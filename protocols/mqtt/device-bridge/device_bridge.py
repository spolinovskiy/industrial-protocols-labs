import json
import time
from typing import Dict

import paho.mqtt.client as mqtt

THRESHOLD = 70

STATE = {
    "DO": [0] * 8,
    "DI": [0] * 8,
    "AO": [0] * 4,
    "AI": [0] * 4,
    "TMR_01": 0,
    "CNT_01": 0,
}


def on_connect(client, userdata, flags, rc):
    client.subscribe("lab/cmd/#")


def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode("utf-8").strip()
    try:
        value = int(float(payload))
    except ValueError:
        value = 0

    if topic.startswith("lab/cmd/DO_"):
        idx = int(topic.split("DO_")[1]) - 1
        if 0 <= idx < 8:
            STATE["DO"][idx] = 1 if value else 0
    if topic.startswith("lab/cmd/AO_"):
        idx = int(topic.split("AO_")[1]) - 1
        if 0 <= idx < 4:
            STATE["AO"][idx] = max(0, min(100, value))


def publish_state(client):
    for i in range(8):
        client.publish(f"lab/state/DO_0{i+1}", STATE["DO"][i], retain=False)
        client.publish(f"lab/state/DI_0{i+1}", STATE["DI"][i], retain=False)
    for i in range(4):
        client.publish(f"lab/state/AO_0{i+1}", STATE["AO"][i], retain=False)
        client.publish(f"lab/state/AI_0{i+1}", STATE["AI"][i], retain=False)
    client.publish("lab/state/TMR_01", STATE["TMR_01"], retain=False)
    client.publish("lab/state/CNT_01", STATE["CNT_01"], retain=False)


def main() -> None:
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("proto-server-mqtt", 1883, 60)
    client.loop_start()

    prev_ao1 = 0

    while True:
        # Mirror DO -> DI
        STATE["DI"] = list(STATE["DO"])

        # Mirror AO -> AI
        STATE["AI"] = list(STATE["AO"])

        ao1 = STATE["AO"][0]
        if prev_ao1 <= THRESHOLD < ao1:
            STATE["CNT_01"] = min(STATE["CNT_01"] + 1, 2**31 - 1)
        prev_ao1 = ao1

        if ao1 > THRESHOLD:
            STATE["TMR_01"] = min(STATE["TMR_01"] + 1, 2**31 - 1)

        publish_state(client)
        time.sleep(1)


if __name__ == "__main__":
    main()
