import asyncio
import os
import socket
import time

import BAC0
from bacpypes3.local.analog import AnalogInputObject, AnalogOutputObject, AnalogValueObject
from bacpypes3.local.binary import BinaryInputObject, BinaryOutputObject

THRESHOLD = 70.0


async def main() -> None:
    ip_addr = os.environ.get("BACNET_IP")
    if not ip_addr:
        try:
            ip_addr = socket.gethostbyname(socket.gethostname())
        except socket.gaierror:
            ip_addr = "0.0.0.0"
    if "/" not in ip_addr:
        ip_addr = f"{ip_addr}/24"
    port = int(os.environ.get("BACNET_PORT", "47808"))
    device_id = int(os.environ.get("BACNET_DEVICE_ID", "1234"))

    bacnet = BAC0.lite(ip=ip_addr, port=port, deviceId=device_id, localObjName="BACnet Lab")
    app = bacnet.this_application.app

    do_objs = [
        BinaryOutputObject(objectIdentifier=("binaryOutput", i), objectName=f"DO_0{i}", presentValue=False)
        for i in range(1, 9)
    ]
    di_objs = [
        BinaryInputObject(objectIdentifier=("binaryInput", i), objectName=f"DI_0{i}", presentValue=False)
        for i in range(1, 9)
    ]
    ao_objs = [
        AnalogOutputObject(objectIdentifier=("analogOutput", i), objectName=f"AO_0{i}", presentValue=0.0)
        for i in range(1, 5)
    ]
    ai_objs = [
        AnalogInputObject(objectIdentifier=("analogInput", i), objectName=f"AI_0{i}", presentValue=0.0)
        for i in range(1, 5)
    ]
    tmr_obj = AnalogValueObject(objectIdentifier=("analogValue", 1), objectName="TMR_01", presentValue=0)
    cnt_obj = AnalogValueObject(objectIdentifier=("analogValue", 2), objectName="CNT_01", presentValue=0)

    for obj in do_objs + di_objs + ao_objs + ai_objs + [tmr_obj, cnt_obj]:
        app.add_object(obj)

    print("BACnet objects:", ", ".join(str(oid) for oid in app.objectIdentifier.keys()))

    print("BACnet/IP server running on UDP/47808")

    prev_ao1 = float(ao_objs[0].presentValue)
    prev_do = [False] * 8
    timer = 0
    switch_count = 0
    crossing_count = 0
    last_tick = time.monotonic()

    while True:
        current_do = [bool(obj.presentValue) for obj in do_objs]

        reset_requested = current_do[4] and not prev_do[4]
        if reset_requested:
            timer = 0
            switch_count = 0
            crossing_count = 0
            prev_ao1 = float(ao_objs[0].presentValue)
            last_tick = time.monotonic()
            for idx in range(5):
                do_objs[idx].presentValue = False
            current_do = [bool(obj.presentValue) for obj in do_objs]
        else:
            for idx in range(4):
                if not prev_do[idx] and current_do[idx]:
                    switch_count = min(switch_count + 1, 2**31 - 1)

            ao1 = float(ao_objs[0].presentValue)
            if prev_ao1 <= THRESHOLD < ao1:
                crossing_count = min(crossing_count + 1, 2**31 - 1)
            prev_ao1 = ao1

            now = time.monotonic()
            if now - last_tick >= 1.0:
                ticks = int(now - last_tick)
                last_tick += ticks
                if ao1 > THRESHOLD:
                    timer = min(timer + ticks, 2**31 - 1)

        for idx, do_val in enumerate(current_do):
            di_objs[idx].presentValue = do_val

        ai_objs[0].presentValue = float(ao_objs[0].presentValue)
        ai_objs[1].presentValue = switch_count
        ai_objs[2].presentValue = crossing_count
        ai_objs[3].presentValue = float(ao_objs[3].presentValue)

        tmr_obj.presentValue = timer
        cnt_obj.presentValue = crossing_count

        prev_do = current_do
        await asyncio.sleep(0.2)


if __name__ == "__main__":
    asyncio.run(main())
