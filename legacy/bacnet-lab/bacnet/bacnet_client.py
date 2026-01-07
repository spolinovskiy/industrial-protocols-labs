import asyncio

import BAC0


async def main():
    bacnet = BAC0.lite(ip="0.0.0.0/24", port=47808)
    target = "bacnet-server"

    # Toggle a binary output and set AO1
    for step in range(5):
        bacnet.write(f"{target} binaryOutput 1 presentValue {step % 2}")
        bacnet.write(f"{target} analogOutput 1 presentValue {50 + step * 5}")
        await asyncio.sleep(1)
        ai0 = bacnet.read(f"{target} analogInput 1 presentValue")
        print("AI0", ai0)


if __name__ == "__main__":
    asyncio.run(main())
