import time

from pycomm3 import LogixDriver


def main():
    # Connect to the CIP server (cpppo) and toggle DO1/AO1
    with LogixDriver("cip-server") as plc:
        for step in range(5):
            plc.write("DO1", step % 2)
            plc.write("AO1", 50 + step * 5)
            ai0 = plc.read("AI0")
            print("AI0", ai0)
            time.sleep(1)


if __name__ == "__main__":
    main()
