import asyncio

import BAC0


THRESHOLD = 70.0


async def main():
    # BACnet stack bound to UDP/47808 in the container
    bacnet = BAC0.lite(ip="0.0.0.0/24", port=47808)

    # Local device with demo objects
    device = await BAC0.device(bacnet, 1234, "BACnet Lab")

    do1 = device.add_object("binaryOutput", 1, name="bacnet/DO1", presentValue=False)
    do2 = device.add_object("binaryOutput", 2, name="bacnet/DO2", presentValue=False)
    do3 = device.add_object("binaryOutput", 3, name="bacnet/DO3", presentValue=False)
    do4 = device.add_object("binaryOutput", 4, name="bacnet/DO4", presentValue=False)

    di1 = device.add_object("binaryInput", 1, name="bacnet/DI1", presentValue=False)
    di2 = device.add_object("binaryInput", 2, name="bacnet/DI2", presentValue=False)
    di3 = device.add_object("binaryInput", 3, name="bacnet/DI3", presentValue=False)
    di4 = device.add_object("binaryInput", 4, name="bacnet/DI4", presentValue=False)

    ao1 = device.add_object("analogOutput", 1, name="bacnet/AO1", presentValue=50.0)
    ai0 = device.add_object("analogInput", 1, name="bacnet/AI0", presentValue=50.0)

    timer_ai1 = device.add_object("analogValue", 1, name="bacnet/TimerAI1", presentValue=0)
    switch_count = device.add_object("analogValue", 2, name="bacnet/SwitchCount", presentValue=0)
    crossing_count = device.add_object("analogValue", 3, name="bacnet/Crossing70", presentValue=0)

    prev_do = [False] * 4
    prev_ai = 50.0
    timer = 0
    switches = 0
    crossings = 0

    print("BACnet server running on UDP/47808 (device id 1234)")

    while True:
        current_do = [bool(do1.presentValue), bool(do2.presentValue), bool(do3.presentValue), bool(do4.presentValue)]
        di1.presentValue, di2.presentValue, di3.presentValue, di4.presentValue = current_do

        ao_val = float(ao1.presentValue)
        ai0.presentValue = ao_val

        for idx in range(4):
            if not prev_do[idx] and current_do[idx]:
                switches = min(switches + 1, 2**31 - 1)
        prev_do = current_do

        if prev_ai <= THRESHOLD < ao_val:
            crossings = min(crossings + 1, 2**31 - 1)
        prev_ai = ao_val

        if ao_val > THRESHOLD:
            timer += 1

        timer_ai1.presentValue = timer
        switch_count.presentValue = switches
        crossing_count.presentValue = crossings

        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
