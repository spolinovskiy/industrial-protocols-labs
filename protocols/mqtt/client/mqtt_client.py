import time
import paho.mqtt.client as mqtt


def main() -> None:
    client = mqtt.Client()
    client.connect("proto-server-mqtt", 1883, 60)
    client.loop_start()

    for step in range(3):
        client.publish("lab/cmd/DO_01", 1)
        client.publish("lab/cmd/AO_01", 75 + step)
        time.sleep(1)
        client.publish("lab/cmd/DO_01", 0)
        time.sleep(1)

    client.loop_stop()


if __name__ == "__main__":
    main()
