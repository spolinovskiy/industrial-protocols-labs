import time
from pyModbusTCP.server import ModbusServer

THRESHOLD = 70


def main() -> None:
    server = ModbusServer(host="0.0.0.0", port=502, no_block=True)
    server.start()
    print("Modbus server started on 0.0.0.0:502")

    # Initialize: 8 DO, 8 DI, 4 AO, 4 AI + TMR_01 + CNT_01
    server.data_bank.set_coils(0, [False] * 8)
    server.data_bank.set_discrete_inputs(0, [False] * 8)
    server.data_bank.set_holding_registers(0, [0] * 4)  # AO_01..AO_04
    server.data_bank.set_input_registers(0, [0] * 6)    # AI_01..AI_04 + TMR_01 + CNT_01

    prev_ao1 = 0
    prev_coils = [False] * 8
    timer = 0
    switch_count = 0
    thresh_count = 0

    last_tick = time.monotonic()
    while True:
        now = time.monotonic()
        holding = server.data_bank.get_holding_registers(0, 4) or [0] * 4
        ao1 = int(holding[0])

        coils = server.data_bank.get_coils(0, 8) or [False] * 8
        reset_requested = coils[4] and not prev_coils[4]
        if reset_requested:
            switch_count = 0
            thresh_count = 0
            timer = 0
            prev_ao1 = ao1
            last_tick = now
            # Clear DO_01..DO_05 so reset is a momentary pulse.
            new_coils = list(coils)
            for idx in range(5):
                new_coils[idx] = False
            server.data_bank.set_coils(0, new_coils)
            coils = new_coils
        else:
            # Count DO rising edges (first 4 switches)
            for idx in range(4):
                if not prev_coils[idx] and coils[idx]:
                    switch_count = min(switch_count + 1, 65535)

            # Threshold crossing counter (AO_01 low->high)
            if prev_ao1 <= THRESHOLD < ao1:
                thresh_count = min(thresh_count + 1, 65535)

            # Timer counts in real seconds while AO_01 > threshold
            if now - last_tick >= 1.0:
                ticks = int(now - last_tick)
                last_tick += ticks
                if ao1 > THRESHOLD:
                    timer = min(timer + ticks, 65535)

        prev_coils = list(coils)
        prev_ao1 = ao1

        # Mirror DO -> DI (first 8 points)
        server.data_bank.set_discrete_inputs(0, coils)

        # AI_01 mirrors AO_01
        inputs = server.data_bank.get_input_registers(0, 6) or [0] * 6
        inputs[0] = ao1

        # AI_02/AI_03 used for switch/threshold counts (keeps legacy HMI useful)
        inputs[1] = switch_count
        inputs[2] = thresh_count

        # AI_04 mirrors AO_04 (optional)
        inputs[3] = int(holding[3])

        # Unified canonical timer/counter
        inputs[4] = timer
        inputs[5] = thresh_count

        server.data_bank.set_input_registers(0, inputs)
        time.sleep(0.05)


if __name__ == "__main__":
    main()
