import time
from pycomm3 import LogixDriver


def main() -> None:
    with LogixDriver("proto-server-cip") as plc:
        for step in range(3):
            plc.write("DO_01", True)
            plc.write("AO_01", 75 + step)
            time.sleep(1)
            ai = plc.read("AI_01")
            print("AI_01", ai.value)
            plc.write("DO_01", False)
            time.sleep(1)


if __name__ == "__main__":
    main()
