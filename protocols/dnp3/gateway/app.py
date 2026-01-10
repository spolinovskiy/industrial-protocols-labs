import os
import threading
import time
from typing import Any, Dict, List

from fastapi import FastAPI
from pydantic import BaseModel

try:
    from pydnp3 import asiodnp3, opendnp3, asiopal
except Exception:  # pragma: no cover - optional when building without pydnp3
    asiodnp3 = None
    opendnp3 = None
    asiopal = None


app = FastAPI()

DNP3_HOST = os.environ.get("DNP3_HOST", "proto-server-dnp3")
DNP3_PORT = int(os.environ.get("DNP3_PORT", "20000"))
THRESHOLD = 70
MAX_INT = 2**31 - 1

DO_IDS = [f"d_do_{i:02d}" for i in range(1, 9)]
DI_IDS = [f"d_di_{i:02d}" for i in range(1, 9)]
AO_IDS = [f"d_ao_{i:02d}" for i in range(1, 5)]
AI_IDS = [f"d_ai_{i:02d}" for i in range(1, 5)]

TAG_MAP: Dict[str, str] = {tag_id: f"DO_0{i}" for i, tag_id in enumerate(DO_IDS, start=1)}
TAG_MAP.update({tag_id: f"DI_0{i}" for i, tag_id in enumerate(DI_IDS, start=1)})
TAG_MAP.update({tag_id: f"AO_0{i}" for i, tag_id in enumerate(AO_IDS, start=1)})
TAG_MAP.update({tag_id: f"AI_0{i}" for i, tag_id in enumerate(AI_IDS, start=1)})
TAG_MAP["d_tmr_01"] = "TMR_01"
TAG_MAP["d_cnt_01"] = "CNT_01"

WRITABLE_PREFIXES = ("d_do_", "d_ao_")

STATE_LOCK = threading.Lock()
STATE = {
    "do": [0] * 8,
    "ao": [0] * 4,
    "prev_do": [0] * 8,
    "prev_ao1": 0,
    "timer": 0,
    "switch_count": 0,
    "thresh_count": 0,
    "last_tick": time.monotonic(),
}


class TagWrite(BaseModel):
    id: str
    value: Any


def update_state() -> Dict[str, Any]:
    do_vals = STATE["do"]
    ao_vals = STATE["ao"]
    prev_do = STATE["prev_do"]
    prev_ao1 = STATE["prev_ao1"]
    timer = STATE["timer"]
    switch_count = STATE["switch_count"]
    thresh_count = STATE["thresh_count"]
    last_tick = STATE["last_tick"]

    ao1 = int(ao_vals[0])
    reset_requested = do_vals[4] and not prev_do[4]
    if reset_requested:
        timer = 0
        switch_count = 0
        thresh_count = 0
        prev_ao1 = ao1
        last_tick = time.monotonic()
        for idx in range(5):
            do_vals[idx] = 0
    else:
        for idx in range(4):
            if not prev_do[idx] and do_vals[idx]:
                switch_count = min(switch_count + 1, MAX_INT)

        if prev_ao1 <= THRESHOLD < ao1:
            thresh_count = min(thresh_count + 1, MAX_INT)
        prev_ao1 = ao1

        now = time.monotonic()
        if now - last_tick >= 1.0:
            ticks = int(now - last_tick)
            last_tick += ticks
            if ao1 > THRESHOLD:
                timer = min(timer + ticks, MAX_INT)

    STATE["do"] = list(do_vals)
    STATE["ao"] = list(ao_vals)
    STATE["prev_do"] = list(do_vals)
    STATE["prev_ao1"] = prev_ao1
    STATE["timer"] = timer
    STATE["switch_count"] = switch_count
    STATE["thresh_count"] = thresh_count
    STATE["last_tick"] = last_tick

    return {
        "do": do_vals,
        "ao": ao_vals,
        "timer": timer,
        "switch_count": switch_count,
        "thresh_count": thresh_count,
    }


def build_response(state: Dict[str, Any]) -> List[Dict[str, Any]]:
    do_vals = state["do"]
    ao_vals = state["ao"]
    timer = state["timer"]
    switch_count = state["switch_count"]
    thresh_count = state["thresh_count"]

    results: List[Dict[str, Any]] = []
    for idx, tag_id in enumerate(DO_IDS):
        results.append({"id": tag_id, "value": bool(do_vals[idx])})
    for idx, tag_id in enumerate(DI_IDS):
        results.append({"id": tag_id, "value": bool(do_vals[idx])})
    for idx, tag_id in enumerate(AO_IDS):
        results.append({"id": tag_id, "value": int(ao_vals[idx])})

    results.append({"id": "d_ai_01", "value": int(ao_vals[0])})
    results.append({"id": "d_ai_02", "value": switch_count})
    results.append({"id": "d_ai_03", "value": thresh_count})
    results.append({"id": "d_ai_04", "value": int(ao_vals[3])})
    results.append({"id": "d_tmr_01", "value": timer})
    results.append({"id": "d_cnt_01", "value": thresh_count})
    return results


def start_dnp3_master() -> None:
    if not asiodnp3:
        return

    def run() -> None:
        try:
            manager = asiodnp3.DNP3Manager(1, asiodnp3.ConsoleLogger().Create())
            channel = manager.AddTCPClient(
                "gateway",
                opendnp3.levels.NOTHING,
                asiopal.ChannelRetry().Default(),
                "0.0.0.0",
                [DNP3_HOST],
                DNP3_PORT,
                asiopal.ChannelRetry().Default(),
            )
            stack_config = asiodnp3.MasterStackConfig()
            stack_config.link.LocalAddr = 1
            stack_config.link.RemoteAddr = 1024
            master = channel.AddMaster(
                "master",
                opendnp3.PrintingChannelListener().Create(),
                asiodnp3.DefaultMasterApplication(),
                stack_config,
            )
            master.AddClassScan(opendnp3.ClassField().AllClasses(), opendnp3.TimeDuration().Seconds(5))
            master.Enable()
            while True:
                time.sleep(10)
        except Exception:
            return

    thread = threading.Thread(target=run, daemon=True)
    thread.start()


@app.on_event("startup")
def startup() -> None:
    start_dnp3_master()


@app.get("/tags")
def get_tags() -> List[Dict[str, Any]]:
    with STATE_LOCK:
        state = update_state()
        return build_response(state)


@app.post("/tags")
def set_tags(payload: List[TagWrite]) -> Dict[str, Any]:
    with STATE_LOCK:
        for item in payload:
            tag_id = item.id
            if not tag_id.startswith(WRITABLE_PREFIXES):
                continue
            value = item.value
            if tag_id.startswith("d_do_"):
                idx = int(tag_id.split("_")[2]) - 1
                if 0 <= idx < 8:
                    STATE["do"][idx] = 1 if int(bool(value)) else 0
            elif tag_id.startswith("d_ao_"):
                idx = int(tag_id.split("_")[2]) - 1
                if 0 <= idx < 4:
                    STATE["ao"][idx] = max(0, min(100, int(float(value))))

    return {"status": "ok"}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}
