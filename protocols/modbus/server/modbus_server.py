import time
from pyModbusTCP.server import ModbusServer

THRESHOLD = 70


def main() -> None:
    server = ModbusServer(host="0.0.0.0", port=502, no_block=True)
    server.start()
    print("Modbus server started on 0.0.0.0:502")

    # Initialize all areas (8 DO, 8 DI, 4 AO, 4 AI, TMR_01, CNT_01)
    server.data_bank.set_coils(0, [False] * 8)
    server.data_bank.set_discrete_inputs(0, [False] * 8)
    server.data_bank.set_holding_registers(0, [0] * 4)  # AO_01..AO_04
    server.data_bank.set_input_registers(0, [0] * 6)    # AI_01..AI_04 + TMR_01 + CNT_01

    prev_ao1 = 0
    timer = 0
    counter = 0

    while True:
        # Mirror DO -> DI
        coils = server.data_bank.get_coils(0, 8) or [False] * 8
        server.data_bank.set_discrete_inputs(0, coils)

        holding = server.data_bank.get_holding_registers(0, 4) or [0] * 4
        ao1 = int(holding[0])

        # Mirror AO -> AI
        inputs = server.data_bank.get_input_registers(0, 6) or [0] * 6
        inputs[0] = ao1
        inputs[1] = int(holding[1])
        inputs[2] = int(holding[2])
        inputs[3] = int(holding[3])

        if prev_ao1 <= THRESHOLD < ao1:
            counter = min(counter + 1, 65535)
        prev_ao1 = ao1

        if ao1 > THRESHOLD:
            timer = min(timer + 1, 65535)

        inputs[4] = timer
        inputs[5] = counter

        server.data_bank.set_input_registers(0, inputs)
        time.sleep(1)


if __name__ == "__main__":
    main()
