import time
from pyModbusTCP.client import ModbusClient


def main() -> None:
    client = ModbusClient(host="proto-server-modbus", port=502, auto_open=True, auto_close=True)

    for step in range(3):
        client.write_single_coil(0, True)
        client.write_single_register(0, 75)
        time.sleep(1)
        ai = client.read_input_registers(0, 1) or [0]
        print("AI_01", ai[0])
        client.write_single_coil(0, False)
        time.sleep(1)


if __name__ == "__main__":
    main()
