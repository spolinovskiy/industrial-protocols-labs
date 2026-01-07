import subprocess
import time

from pycomm3 import LogixDriver

THRESHOLD = 70


def start_cpppo() -> subprocess.Popen:
    tag_defs = [
        "DO_01=BOOL",
        "DO_02=BOOL",
        "DO_03=BOOL",
        "DO_04=BOOL",
        "DO_05=BOOL",
        "DO_06=BOOL",
        "DO_07=BOOL",
        "DO_08=BOOL",
        "DI_01=BOOL",
        "DI_02=BOOL",
        "DI_03=BOOL",
        "DI_04=BOOL",
        "DI_05=BOOL",
        "DI_06=BOOL",
        "DI_07=BOOL",
        "DI_08=BOOL",
        "AO_01=INT",
        "AO_02=INT",
        "AO_03=INT",
        "AO_04=INT",
        "AI_01=INT",
        "AI_02=INT",
        "AI_03=INT",
        "AI_04=INT",
        "TMR_01=INT",
        "CNT_01=INT",
    ]
    return subprocess.Popen(
        [
            "python",
            "-m",
            "cpppo.server.enip",
            "--address",
            "0.0.0.0:44818",
            "-S",
            *tag_defs,
        ]
    )


def main() -> None:
    proc = start_cpppo()
    time.sleep(2)

    prev_ao1 = 0
    timer = 0
    counter = 0

    try:
        with LogixDriver("127.0.0.1") as plc:
            while True:
                do_vals = [plc.read(f"DO_0{i}").value for i in range(1, 9)]
                ao_vals = [plc.read(f"AO_0{i}").value for i in range(1, 5)]

                writes = [(f"DI_0{i}", bool(do_vals[i - 1])) for i in range(1, 9)]
                for i in range(1, 5):
                    writes.append((f"AI_0{i}", int(ao_vals[i - 1] or 0)))

                ao1 = int(ao_vals[0] or 0)
                if prev_ao1 <= THRESHOLD < ao1:
                    counter = min(counter + 1, 2**31 - 1)
                prev_ao1 = ao1

                if ao1 > THRESHOLD:
                    timer = min(timer + 1, 2**31 - 1)

                writes.append(("TMR_01", timer))
                writes.append(("CNT_01", counter))

                plc.write(*writes)
                time.sleep(1)
    finally:
        proc.terminate()
        proc.wait(5)


if __name__ == "__main__":
    main()
