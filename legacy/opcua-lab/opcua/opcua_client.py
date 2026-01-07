import time
from opcua import Client


def main():
    client = Client("opc.tcp://opcua-server:4840/")
    client.connect()
    try:
        do1 = client.get_node("ns=2;s=opcua/DO1")
        ao1 = client.get_node("ns=2;s=opcua/AO1")
        ai0 = client.get_node("ns=2;s=opcua/AI0")
        timer = client.get_node("ns=2;s=opcua/TimerAI1")

        # Simple demo loop: toggle DO1 and move AO1
        for step in range(5):
            do1.set_value(bool(step % 2))
            ao1.set_value(float(60 + step * 5))
            time.sleep(1)
            print("AI0", ai0.get_value(), "Timer", timer.get_value())
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()
