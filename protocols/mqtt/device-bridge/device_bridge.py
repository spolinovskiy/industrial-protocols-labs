import os
import time

import paho.mqtt.client as mqtt

THRESHOLD = 70
MAX_INT = 2**31 - 1

MQTT_HOST = os.environ.get("MQTT_HOST", "proto-server-mqtt")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))

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
    elif topic.startswith("lab/cmd/AO_"):
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


def publish_reset_commands(client):
    for i in range(5):
        client.publish(f"lab/cmd/DO_0{i+1}", 0, retain=True)


def main() -> None:
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_HOST, MQTT_PORT, 60)
    client.loop_start()

    prev_ao1 = 0
    prev_do = [0] * 8
    timer = 0
    switch_count = 0
    thresh_count = 0
    last_tick = time.monotonic()

    while True:
        ao1 = int(STATE["AO"][0])
        reset_requested = STATE["DO"][4] and not prev_do[4]
        if reset_requested:
            timer = 0
            switch_count = 0
            thresh_count = 0
            prev_ao1 = ao1
            last_tick = time.monotonic()
            for idx in range(5):
                STATE["DO"][idx] = 0
            publish_reset_commands(client)
        else:
            for idx in range(4):
                if not prev_do[idx] and STATE["DO"][idx]:
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

        prev_do = list(STATE["DO"])

        # Mirror DO -> DI
        STATE["DI"] = list(STATE["DO"])

        # Mirror AO -> AI (canonical counters via AI_02/AI_03)
        STATE["AI"][0] = ao1
        STATE["AI"][1] = switch_count
        STATE["AI"][2] = thresh_count
        STATE["AI"][3] = int(STATE["AO"][3])

        STATE["TMR_01"] = timer
        STATE["CNT_01"] = thresh_count

        publish_state(client)
        time.sleep(0.2)


if __name__ == "__main__":
    main()
