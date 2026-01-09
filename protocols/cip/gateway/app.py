import os
import threading
import time
from typing import Any, Dict, List, Tuple

from cpppo.server.enip import client
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()

CIP_ADDRESS = os.environ.get("CIP_ADDRESS", "proto-server-cip")
THRESHOLD = 70
MAX_INT = 32767

DO_IDS = [f"c_do_{i:02d}" for i in range(1, 9)]
DI_IDS = [f"c_di_{i:02d}" for i in range(1, 9)]
AO_IDS = [f"c_ao_{i:02d}" for i in range(1, 5)]
AI_IDS = [f"c_ai_{i:02d}" for i in range(1, 5)]

DO_TAGS = [f"DO_0{i}" for i in range(1, 9)]
AO_TAGS = [f"AO_0{i}" for i in range(1, 5)]
READ_TAGS = DO_TAGS + AO_TAGS

TAG_MAP: Dict[str, str] = {tag_id: tag for tag_id, tag in zip(DO_IDS, DO_TAGS)}
TAG_MAP.update({tag_id: tag for tag_id, tag in zip(DI_IDS, [f"DI_0{i}" for i in range(1, 9)])})
TAG_MAP.update({tag_id: tag for tag_id, tag in zip(AO_IDS, AO_TAGS)})
TAG_MAP.update({tag_id: tag for tag_id, tag in zip(AI_IDS, [f"AI_0{i}" for i in range(1, 5)])})
TAG_MAP["c_tmr_01"] = "TMR_01"
TAG_MAP["c_cnt_01"] = "CNT_01"

WRITABLE_PREFIXES = ("c_do_", "c_ao_")

STATE_LOCK = threading.Lock()
STATE = {
    "prev_do": [False] * 8,
    "prev_ao1": 0,
    "timer": 0,
    "switch_count": 0,
    "thresh_count": 0,
    "last_tick": time.monotonic(),
}


class TagWrite(BaseModel):
    id: str
    value: Any


def parse_address(address: str) -> Tuple[str, int]:
    if ":" in address:
        host, port = address.rsplit(":", 1)
        return host, int(port)
    return address, 44818


def parse_values(values: List[Any]) -> List[Any]:
    parsed = []
    for value in values:
        if isinstance(value, list):
            parsed.append(value[0] if value else 0)
        else:
            parsed.append(value)
    return parsed


def read_do_ao(connection) -> Tuple[List[bool], List[int]]:
    operations = client.parse_operations(READ_TAGS)
    failures, values = connection.process(operations, timeout=1.0, depth=1)
    if failures:
        raise RuntimeError("CIP read failed")
    parsed = parse_values(values)
    do_vals = [bool(v) for v in parsed[:8]]
    ao_vals = [int(v or 0) for v in parsed[8:]]
    return do_vals, ao_vals


def write_tags(connection, tag_values: List[str]) -> None:
    if not tag_values:
        return
    operations = client.parse_operations(tag_values)
    failures, _ = connection.process(operations, timeout=1.0, depth=1)
    if failures:
        raise RuntimeError("CIP write failed")


def update_state(do_vals: List[bool], ao_vals: List[int]) -> Tuple[List[bool], int, int, int, bool]:
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
        for idx in range(5):
            do_vals[idx] = False
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

    return do_vals, timer, switch_count, thresh_count, reset_requested


def build_response(do_vals: List[bool], ao_vals: List[int], timer: int, switch_count: int, thresh_count: int) -> List[Dict[str, Any]]:
    ao1 = int(ao_vals[0])
    ao4 = int(ao_vals[3])
    results: List[Dict[str, Any]] = []

    for idx, tag_id in enumerate(DO_IDS):
        results.append({"id": tag_id, "value": bool(do_vals[idx])})
    for idx, tag_id in enumerate(DI_IDS):
        results.append({"id": tag_id, "value": bool(do_vals[idx])})
    for idx, tag_id in enumerate(AO_IDS):
        results.append({"id": tag_id, "value": int(ao_vals[idx])})

    results.append({"id": "c_ai_01", "value": ao1})
    results.append({"id": "c_ai_02", "value": switch_count})
    results.append({"id": "c_ai_03", "value": thresh_count})
    results.append({"id": "c_ai_04", "value": ao4})
    results.append({"id": "c_tmr_01", "value": timer})
    results.append({"id": "c_cnt_01", "value": thresh_count})

    return results


@app.get("/tags")
def get_tags() -> List[Dict[str, Any]]:
    host, port = parse_address(CIP_ADDRESS)
    connection = client.connector(host=host, port=port, timeout=1.0)
    try:
        with connection:
            do_vals, ao_vals = read_do_ao(connection)
            with STATE_LOCK:
                do_vals, timer, switch_count, thresh_count, reset_requested = update_state(do_vals, ao_vals)

            ao1 = int(ao_vals[0])
            ao4 = int(ao_vals[3])
            if reset_requested:
                reset_ops = [f"DO_0{i}=(BOOL){int(do_vals[i - 1])}" for i in range(1, 6)]
                write_tags(connection, reset_ops)
            return build_response(do_vals, ao_vals, timer, switch_count, thresh_count)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    finally:
        connection.close()


@app.post("/tags")
def set_tags(payload: List[TagWrite]) -> Dict[str, Any]:
    writes = []
    for item in payload:
        tag_id = item.id
        tag_name = TAG_MAP.get(tag_id)
        if not tag_name:
            continue
        if not tag_id.startswith(WRITABLE_PREFIXES):
            continue
        value = item.value
        if tag_id.startswith("c_ao_"):
            value = min(max(int(float(value)), 0), MAX_INT)
            writes.append(f"{tag_name}=(INT){value}")
        elif tag_id.startswith("c_do_"):
            value = int(bool(value))
            writes.append(f"{tag_name}=(BOOL){value}")

    if writes:
        host, port = parse_address(CIP_ADDRESS)
        connection = client.connector(host=host, port=port, timeout=1.0)
        try:
            with connection:
                write_tags(connection, writes)
        except Exception as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        finally:
            connection.close()

    return {"status": "ok", "written": len(writes)}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}
