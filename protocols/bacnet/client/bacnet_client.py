import asyncio

import BAC0


async def main() -> None:
    # Local client bind; port 47809 to avoid conflict with server
    bacnet = BAC0.lite(ip="0.0.0.0/24", port=47809, ping=False)
    target = "proto-server-bacnet"

    for step in range(3):
        bacnet.write(f"{target} binaryOutput 1 presentValue {step % 2}")
        bacnet.write(f"{target} analogOutput 1 presentValue {75 + step}")
        await asyncio.sleep(1)
        ai1 = bacnet.read(f"{target} analogInput 1 presentValue")
        print("AI_01", ai1)


if __name__ == "__main__":
    asyncio.run(main())
