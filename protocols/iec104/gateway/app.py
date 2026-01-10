import threading
import time
from typing import Any, Dict, List

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

THRESHOLD = 70
MAX_INT = 32767

DO_IDS = [f"i_do_{i:02d}" for i in range(1, 9)]
DI_IDS = [f"i_di_{i:02d}" for i in range(1, 9)]
AO_IDS = [f"i_ao_{i:02d}" for i in range(1, 5)]
AI_IDS = [f"i_ai_{i:02d}" for i in range(1, 5)]

WRITABLE_PREFIXES = ("i_do_", "i_ao_")

STATE_LOCK = threading.Lock()
STATE = {
    "prev_do": [False] * 8,
    "prev_ao1": 0,
    "timer": 0,
    "switch_count": 0,
    "thresh_count": 0,
    "last_tick": time.monotonic(),
    "do": [0] * 8,
    "ao": [0] * 4,
}


class TagWrite(BaseModel):
    id: str
    value: Any


def clamp_ao(value: Any) -> int:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        numeric = 0
    return max(0, min(100, int(numeric)))


def update_state() -> None:
    do_vals = STATE["do"]
    ao_vals = STATE["ao"]
    prev_do = STATE["prev_do"]
    prev_ao1 = int(STATE["prev_ao1"])
    timer = int(STATE["timer"])
    switch_count = int(STATE["switch_count"])
    thresh_count = int(STATE["thresh_count"])
    last_tick = float(STATE["last_tick"])

    ao1 = int(ao_vals[0])
    reset_requested = bool(do_vals[4]) and not bool(prev_do[4])
    if reset_requested:
        timer = 0
        switch_count = 0
        thresh_count = 0
        for idx in range(5):
            do_vals[idx] = 0
        prev_ao1 = ao1
        last_tick = time.monotonic()
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

    STATE["prev_do"] = list(do_vals)
    STATE["prev_ao1"] = prev_ao1
    STATE["timer"] = timer
    STATE["switch_count"] = switch_count
    STATE["thresh_count"] = thresh_count
    STATE["last_tick"] = last_tick


@app.get("/tags")
def get_tags() -> List[Dict[str, Any]]:
    with STATE_LOCK:
        update_state()
        do_vals = list(STATE["do"])
        ao_vals = list(STATE["ao"])
        timer = int(STATE["timer"])
        switch_count = int(STATE["switch_count"])
        thresh_count = int(STATE["thresh_count"])

    results: List[Dict[str, Any]] = []
    for idx, tag_id in enumerate(DO_IDS):
        results.append({"id": tag_id, "value": bool(do_vals[idx])})
    for idx, tag_id in enumerate(DI_IDS):
        results.append({"id": tag_id, "value": bool(do_vals[idx])})
    for idx, tag_id in enumerate(AO_IDS):
        results.append({"id": tag_id, "value": int(ao_vals[idx])})

    results.append({"id": "i_ai_01", "value": int(ao_vals[0])})
    results.append({"id": "i_ai_02", "value": switch_count})
    results.append({"id": "i_ai_03", "value": thresh_count})
    results.append({"id": "i_ai_04", "value": int(ao_vals[3])})
    results.append({"id": "i_tmr_01", "value": timer})
    results.append({"id": "i_cnt_01", "value": thresh_count})
    return results


@app.post("/tags")
def set_tags(payload: List[TagWrite]) -> Dict[str, Any]:
    written = 0
    with STATE_LOCK:
        for item in payload:
            tag_id = item.id
            if not tag_id.startswith(WRITABLE_PREFIXES):
                continue
            if tag_id.startswith("i_do_"):
                idx = int(tag_id.split("_")[2]) - 1
                if 0 <= idx < 8:
                    STATE["do"][idx] = 1 if bool(item.value) else 0
                    written += 1
            elif tag_id.startswith("i_ao_"):
                idx = int(tag_id.split("_")[2]) - 1
                if 0 <= idx < 4:
                    STATE["ao"][idx] = clamp_ao(item.value)
                    written += 1
        update_state()

    return {"status": "ok", "written": written}
