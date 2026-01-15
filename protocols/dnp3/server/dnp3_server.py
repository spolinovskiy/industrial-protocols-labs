import threading
import time
from typing import Dict, List

from pydnp3 import asiodnp3, opendnp3, asiopal

THRESHOLD = 70
MAX_INT = 2**31 - 1

STATE_LOCK = threading.Lock()
STATE: Dict[str, object] = {
    "do": [0] * 8,
    "ao": [0] * 4,
    "prev_do": [0] * 8,
    "prev_ao1": 0,
    "timer": 0,
    "switch_count": 0,
    "thresh_count": 0,
    "last_tick": time.monotonic(),
}


def clamp_ao(value: float) -> int:
    return max(0, min(100, int(value)))


def derive_snapshot(state: Dict[str, object]) -> Dict[str, List[int]]:
    do_vals = list(state["do"])
    ao_vals = list(state["ao"])
    switch_count = int(state["switch_count"])
    thresh_count = int(state["thresh_count"])
    timer = int(state["timer"])

    di_vals = list(do_vals)
    ai_vals = [
        int(ao_vals[0]),
        switch_count,
        thresh_count,
        int(ao_vals[3]),
    ]
    return {
        "do": do_vals,
        "di": di_vals,
        "ao": ao_vals,
        "ai": ai_vals,
        "timer": timer,
        "counter": thresh_count,
    }


def apply_snapshot(outstation, snapshot: Dict[str, List[int]]) -> None:
    builder = asiodnp3.UpdateBuilder()
    for idx, value in enumerate(snapshot["di"]):
        builder.Update(opendnp3.Binary(bool(value)), idx)
    for idx, value in enumerate(snapshot["do"]):
        builder.Update(opendnp3.BinaryOutputStatus(bool(value)), idx)
    for idx, value in enumerate(snapshot["ao"]):
        builder.Update(opendnp3.AnalogOutputStatus(float(value)), idx)
    for idx, value in enumerate(snapshot["ai"]):
        builder.Update(opendnp3.Analog(float(value)), idx)
    builder.Update(opendnp3.Analog(float(snapshot["timer"])), 4)
    builder.Update(opendnp3.Analog(float(snapshot["counter"])), 5)
    outstation.Apply(builder.Build())


def tick_state(state: Dict[str, object]) -> None:
    do_vals = state["do"]
    ao_vals = state["ao"]
    prev_do = state["prev_do"]
    prev_ao1 = int(state["prev_ao1"])
    timer = int(state["timer"])
    switch_count = int(state["switch_count"])
    thresh_count = int(state["thresh_count"])
    last_tick = float(state["last_tick"])

    ao1 = int(ao_vals[0])
    reset_requested = bool(do_vals[4]) and not bool(prev_do[4])
    if reset_requested:
        timer = 0
        switch_count = 0
        thresh_count = 0
        for idx in range(5):
            do_vals[idx] = 0
        prev_ao1 = ao1
        last_tick = time.monotonic()
    else:
        for idx in range(4):
            if not prev_do[idx] and do_vals[idx]:
                switch_count = min(switch_count + 1, MAX_INT)

        if prev_ao1 <= THRESHOLD < ao1:
            thresh_count = min(thresh_count + 1, MAX_INT)
        prev_ao1 = ao1

        now = time.monotonic()
        if now - last_tick >= 1.0:
            ticks = int(now - last_tick)
            last_tick += ticks
            if ao1 > THRESHOLD:
                timer = min(timer + ticks, MAX_INT)

    state["prev_do"] = list(do_vals)
    state["prev_ao1"] = prev_ao1
    state["timer"] = timer
    state["switch_count"] = switch_count
    state["thresh_count"] = thresh_count
    state["last_tick"] = last_tick


class CommandHandler(opendnp3.ICommandHandler):
    def __init__(self) -> None:
        super().__init__()
        self._outstation = None

    def set_outstation(self, outstation) -> None:
        self._outstation = outstation

    def Start(self) -> None:
        return None

    def End(self) -> None:
        return None

    def Select(self, command, index):
        return opendnp3.CommandStatus.SUCCESS

    def Operate(self, command, index, op_type):
        with STATE_LOCK:
            if isinstance(command, opendnp3.ControlRelayOutputBlock):
                if 0 <= index < len(STATE["do"]):
                    is_on = command.code in (
                        opendnp3.ControlCode.LATCH_ON,
                        opendnp3.ControlCode.PULSE_ON,
                    )
                    STATE["do"][index] = 1 if is_on else 0
            elif isinstance(command, opendnp3.AnalogOutputInt16):
                if 0 <= index < len(STATE["ao"]):
                    STATE["ao"][index] = clamp_ao(command.value)
            elif isinstance(command, opendnp3.AnalogOutputInt32):
                if 0 <= index < len(STATE["ao"]):
                    STATE["ao"][index] = clamp_ao(command.value)
            elif isinstance(command, opendnp3.AnalogOutputFloat32):
                if 0 <= index < len(STATE["ao"]):
                    STATE["ao"][index] = clamp_ao(command.value)
            elif isinstance(command, opendnp3.AnalogOutputDouble64):
                if 0 <= index < len(STATE["ao"]):
                    STATE["ao"][index] = clamp_ao(command.value)

            if self._outstation:
                snapshot = derive_snapshot(STATE)
                apply_snapshot(self._outstation, snapshot)

        return opendnp3.CommandStatus.SUCCESS


def main() -> None:
    manager = asiodnp3.DNP3Manager(1, asiodnp3.ConsoleLogger().Create())
    channel = manager.AddTCPServer(
        "server",
        opendnp3.levels.NORMAL,
        asiopal.ChannelRetry().Default(),
        "0.0.0.0",
        20000,
        asiopal.ChannelRetry().Default(),
    )

    sizes = opendnp3.DatabaseSizes(
        numBinary=8,
        numDoubleBinary=0,
        numAnalog=8,
        numCounter=0,
        numFrozenCounter=0,
        numBinaryOutputStatus=8,
        numAnalogOutputStatus=4,
        numTimeAndInterval=0,
    )
    config = asiodnp3.OutstationStackConfig(sizes)
    config.link.LocalAddr = 1024
    config.link.RemoteAddr = 1

    command_handler = CommandHandler()
    outstation = channel.AddOutstation(
        "outstation",
        command_handler,
        asiodnp3.DefaultOutstationApplication(),
        config,
    )
    command_handler.set_outstation(outstation)

    with STATE_LOCK:
        snapshot = derive_snapshot(STATE)
        apply_snapshot(outstation, snapshot)

    outstation.Enable()
    print("DNP3 outstation listening on TCP/20000")

    while True:
        time.sleep(1)
        with STATE_LOCK:
            tick_state(STATE)
            snapshot = derive_snapshot(STATE)
        apply_snapshot(outstation, snapshot)


if __name__ == "__main__":
    main()
