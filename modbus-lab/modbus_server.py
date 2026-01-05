import logging
import time
from pyModbusTCP.server import ModbusServer
from time import sleep

# Configure logging to a file for easy inspection inside the container
logging.basicConfig(
    filename="modbus_server.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
)


def start_server() -> ModbusServer:
    """Start Modbus TCP server bound to all interfaces on port 502."""
    srv = ModbusServer(host="0.0.0.0", port=502, no_block=True)
    srv.start()
    print("Modbus server started on 0.0.0.0:502")
    logging.info("Modbus server started on 0.0.0.0:502")

    # Initialize all four Modbus areas so the HMI and tests have predictable values
    srv.data_bank.set_coils(0, [False] * 16)  # DO (coils)
    srv.data_bank.set_discrete_inputs(0, [False] * 16)  # DI (discrete inputs)
    # Holding: AO0 setpoint; HR1 switch counter; HR2 threshold counter
    holding_init = [0] * 16
    srv.data_bank.set_holding_registers(0, holding_init)
    # Inputs: AI0 mirror; AI1 timer; AI2 switch counter; AI3 threshold counter
    input_init = [0] * 16
    srv.data_bank.set_input_registers(0, input_init)

    return srv


def mirror_bits(server: ModbusServer, points: int = 4) -> None:
    """Mirror DO writes into DI for the first *points* coils."""
    coils = server.data_bank.get_coils(0, points)
    if coils is None:
        raise ValueError("Failed to retrieve DO (coils) data.")

    server.data_bank.set_discrete_inputs(0, coils)


def get_registers(server: ModbusServer) -> tuple[list[int], list[int]]:
    """Return holding (HR0..HR2) and input (IR0..IR3) with safe defaults."""
    hr = server.data_bank.get_holding_registers(0, 3) or []
    if len(hr) < 3:
        hr = (hr + [0, 0, 0])[:3]
    ir = server.data_bank.get_input_registers(0, 4) or []
    if len(ir) < 4:
        ir = (ir + [0, 0, 0, 0])[:4]
    return hr, ir


def update_timer_and_counters(
    prev_coils: list[bool],
    coils: list[bool],
    prev_ai0: int,
    ai0_value: int,
    timer_accum: float,
    switch_count: int,
    thresh_count: int,
    threshold: int = 70,
) -> tuple[int, float, int, int]:
    """
    - Increment timer (seconds) only when AI0 > threshold.
    - Count any DO rising edge (0->1) in switch_count.
    - Count AI0 threshold crossings (below -> above) in thresh_count.
    """
    # DO rising edges (first 4 only)
    for idx in range(4):
        if len(prev_coils) > idx and (not prev_coils[idx] and coils[idx]):
            switch_count = min(switch_count + 1, 65535)

    # AI threshold crossing (below -> above threshold)
    if prev_ai0 <= threshold < ai0_value:
        thresh_count = min(thresh_count + 1, 65535)

    # Timer in seconds, only when AI0 > threshold
    if ai0_value > threshold:
        timer_accum += 1  # will be called every second in main loop pacing

    return ai0_value, timer_accum, switch_count, thresh_count


def handle_reset(
    server: ModbusServer,
    coils: list[bool],
    prev_coils: list[bool],
    timer_accum: float,
) -> tuple[float, bool]:
    """
    If coil5 (index 4) rises: reset counters/timer, set AO0/AI0 to 50, and turn OFF DO1-DO4.
    Returns (timer_accum, reset_done)
    """
    reset_done = False
    if len(coils) > 4 and len(prev_coils) > 4 and (not prev_coils[4] and coils[4]):
        hr, ir = get_registers(server)
        hr[0] = 50
        hr[1] = 0
        hr[2] = 0
        ir[0] = 50
        ir[1] = 0
        ir[2] = 0
        ir[3] = 0
        server.data_bank.set_holding_registers(0, hr)
        server.data_bank.set_input_registers(0, ir)

        # Turn off DO1-DO4 and mirror to DI on next loop
        server.data_bank.set_coils(0, [False, False, False, False, False])

        timer_accum = 0.0
        reset_done = True
    return timer_accum, reset_done


def log_changes(server: ModbusServer, prev_state: dict) -> dict:
    """Log changes across all areas to a dedicated file for register overview."""
    log_lines = []
    areas = {
        "DO": server.data_bank.get_coils(0, 4) or [],
        "DI": server.data_bank.get_discrete_inputs(0, 4) or [],
        "HR": server.data_bank.get_holding_registers(0, 4) or [],
        "IR": server.data_bank.get_input_registers(0, 4) or [],
    }

    for key, current in areas.items():
        previous = prev_state.get(key, [])
        if current != previous:
            log_lines.append(f"{key} changed {previous} -> {current}")
            prev_state[key] = list(current)

    if log_lines:
        for line in log_lines:
            logging.info(line)
        with open("modbus_registers.log", "a", encoding="utf-8") as fh:
            for line in log_lines:
                fh.write(line + "\n")

    return prev_state


def log_snapshot(server: ModbusServer) -> None:
    coils = server.data_bank.get_coils(0, 4) or [False] * 4
    di = server.data_bank.get_discrete_inputs(0, 4) or [False] * 4
    ao = server.data_bank.get_holding_registers(0, 3) or []
    ai = server.data_bank.get_input_registers(0, 4) or []

    if len(ao) < 3:
        ao = (ao + [0, 0, 0])[:3]
    if len(ai) < 4:
        ai = (ai + [0, 0, 0, 0])[:4]

    msg = (
        f"DO -> {coils} | DI -> {di} | "
        f"AO0 -> {ao[0]} | SwitchCount(HR1) -> {ao[1]} | AIThreshCount(HR2) -> {ao[2]} | "
        f"AI0(analog) -> {ai[0]} | AI1(timer s) -> {ai[1]} | AI2(switches) -> {ai[2]} | AI3(thresh) -> {ai[3]}"
    )
    print(msg)
    logging.info(msg)


if __name__ == "__main__":
    print("### HOST FILE MARKER: NEW CODE LOADED ###")
    logging.info("Modbus server starting.")
    server = start_server()
    prev_state = {}
    prev_coils = [False] * 5  # include reset coil (index 4)
    last_tick = time.monotonic()
    prev_ai0 = 0
    timer_accum = 0.0
    switch_count = 0
    thresh_count = 0

    try:
        while True:
            now = time.monotonic()
            dt = now - last_tick
            # Pace at ~1s for counter/timer stability
            if dt < 1.0:
                sleep(0.05)
                continue
            last_tick = now

            # mirror DO->DI for first 4
            mirror_bits(server, points=4)

            # read registers and AO setpoint
            hr, ir = get_registers(server)
            ao0 = hr[0]

            # AI0 mirrors AO0 directly
            ai0_value = int(max(0, min(65535, ao0)))
            ir[0] = ai0_value
            server.data_bank.set_input_registers(0, ir)

            prev_ai0, timer_accum, switch_count, thresh_count = update_timer_and_counters(
                prev_coils, server.data_bank.get_coils(0, 5) or [False] * 5, prev_ai0, ai0_value, timer_accum, switch_count, thresh_count
            )
            timer_accum, reset_done = handle_reset(
                server,
                server.data_bank.get_coils(0, 5) or prev_coils,
                prev_coils,
                timer_accum,
            )
            if reset_done:
                switch_count = 0
                thresh_count = 0
                prev_coils = [False] * 5

            # Write back counters/timer
            hr[0] = ao0
            hr[1] = switch_count
            hr[2] = thresh_count
            ir[1] = int(timer_accum) % 65536
            ir[2] = switch_count
            ir[3] = thresh_count
            server.data_bank.set_holding_registers(0, hr)
            server.data_bank.set_input_registers(0, ir)
            prev_state = log_changes(server, prev_state)
            log_snapshot(server)

            prev_coils = server.data_bank.get_coils(0, 5) or prev_coils
            prev_ai0 = ai0_value
            sleep(0.01)

    except KeyboardInterrupt:
        print("Stopping Modbus server")
        logging.info("Stopping Modbus server")
    finally:
        server.stop()
