from pyModbusTCP.client import ModbusClient
from time import sleep

client = ModbusClient(host="modbus-server", port=502, auto_open=True, auto_close=False)

print("Starting Modbus client. Target: modbus-server:502")

while True:
    regs = client.read_holding_registers(0, 1)
    if regs:
        print(f"Read holding register 0 <= {regs[0]}")
    else:
        print("Read failed (no response / not connected yet). Retrying...")
    sleep(1)
