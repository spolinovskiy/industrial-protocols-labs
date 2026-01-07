import time
from opcua import Client


def main() -> None:
    client = Client("opc.tcp://proto-server-opcua:4840/")
    client.connect()
    try:
        do1 = client.get_node("ns=2;s=opcua/DO_01")
        ao1 = client.get_node("ns=2;s=opcua/AO_01")
        ai1 = client.get_node("ns=2;s=opcua/AI_01")

        for step in range(3):
            do1.set_value(True)
            ao1.set_value(75.0 + step)
            time.sleep(1)
            print("AI_01", ai1.get_value())
            do1.set_value(False)
            time.sleep(1)
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()
