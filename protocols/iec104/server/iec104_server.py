import asyncio


async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    addr = writer.get_extra_info("peername")
    print(f"IEC-104 client connected: {addr}")
    try:
        while True:
            data = await reader.read(1024)
            if not data:
                break
            # Echo back as a placeholder to keep the session alive.
            writer.write(data)
            await writer.drain()
    finally:
        writer.close()
        await writer.wait_closed()
        print(f"IEC-104 client disconnected: {addr}")


async def main() -> None:
    server = await asyncio.start_server(handle_client, host="0.0.0.0", port=2404)
    print("IEC-104 placeholder server listening on 0.0.0.0:2404")
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
