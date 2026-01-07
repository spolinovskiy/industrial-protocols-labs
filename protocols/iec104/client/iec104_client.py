import asyncio


async def main() -> None:
    reader, writer = await asyncio.open_connection("proto-server-iec104", 2404)
    writer.write(b"IEC104_TEST")
    await writer.drain()
    data = await reader.read(1024)
    print("IEC104 reply", data)
    writer.close()
    await writer.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())
