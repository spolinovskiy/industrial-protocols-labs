from pyModbusTCP.server import ModbusServer
from time import sleep
import random

print("### HOST FILE MARKER: NEW CODE LOADED ###")

server = ModbusServer(host="0.0.0.0", port=502, no_block=True)
server.start()
print("Modbus server started on 0.0.0.0:502")

# ---- Initialize ranges using instance methods ----
server.data_bank.set_coils(0, [False] * 16)  # DO (coils)
server.data_bank.set_discrete_inputs(0, [False] * 16)  # DI (discrete inputs)
server.data_bank.set_holding_registers(0, [0] * 16)  # AO (holding registers)
server.data_bank.set_input_registers(0, [0] * 16)  # AI (input registers)

# Initialize previous states for DO and AO
prev_do = [False] * 16
prev_ao = [0] * 16

try:
    while True:
        # ---- DO -> DI (mirror first 2 points) ----
        do = server.data_bank.get_coils(0, 16)
        if do is None:
            raise ValueError("Failed to retrieve DO (coils) data.")
        for i in range(2):
            if do[i] != prev_do[i]:
                print(f"DO{i} changed -> {do[i]}")
                server.data_bank.set_discrete_inputs(i, [do[i]])  # Update DI
                print(f"DI{i} set     -> {do[i]}")
                prev_do[i] = do[i]

        # ---- AO -> AI (mirror first 2 points with small noise) ----
        ao = server.data_bank.get_holding_registers(0, 2)
        if ao is None:
            raise ValueError("Failed to retrieve AO (holding registers) data.")
        for i in range(2):
            if ao[i] != prev_ao[i]:
                ai = int(ao[i] + random.randint(-5, 5))
                print(f"AO{i} written -> {ao[i]} | AI{i} updated -> {ai}")
                server.data_bank.set_input_registers(i, [ai])  # Update AI
                prev_ao[i] = ao[i]

        sleep(0.1)

except KeyboardInterrupt:
    print("Stopping Modbus server")
finally:
    server.stop()

