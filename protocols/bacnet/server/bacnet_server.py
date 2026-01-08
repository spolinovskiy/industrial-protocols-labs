import asyncio
import os
import time

import BAC0

THRESHOLD = 70.0


async def main() -> None:
    ip_addr = os.environ.get("BACNET_IP", "0.0.0.0/24")
    port = int(os.environ.get("BACNET_PORT", "47808"))
    device_id = int(os.environ.get("BACNET_DEVICE_ID", "1234"))

    bacnet = BAC0.lite(ip=ip_addr, port=port)
    device = await BAC0.device(bacnet, device_id, "BACnet Lab")

    do_objs = [
        device.add_object("binaryOutput", i, name=f"DO_0{i}", presentValue=False)
        for i in range(1, 9)
    ]
    di_objs = [
        device.add_object("binaryInput", i, name=f"DI_0{i}", presentValue=False)
        for i in range(1, 9)
    ]
    ao_objs = [
        device.add_object("analogOutput", i, name=f"AO_0{i}", presentValue=0.0)
        for i in range(1, 5)
    ]
    ai_objs = [
        device.add_object("analogInput", i, name=f"AI_0{i}", presentValue=0.0)
        for i in range(1, 5)
    ]
    tmr_obj = device.add_object("analogValue", 1, name="TMR_01", presentValue=0)
    cnt_obj = device.add_object("analogValue", 2, name="CNT_01", presentValue=0)

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
