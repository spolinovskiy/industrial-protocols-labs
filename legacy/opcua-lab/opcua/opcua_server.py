import time
from opcua import ua, Server


def add_var(obj, name, value, vtype, writable=False):
    node = obj.add_variable(f"ns=2;s={name}", name, value, vtype)
    if writable:
        node.set_writable()
    return node


def main():
    server = Server()
    server.set_endpoint("opc.tcp://0.0.0.0:4840/")
    server.set_server_name("OPC UA Lab Server")

    ns = server.register_namespace("opcua-lab")
    objects = server.get_objects_node()
    lab = objects.add_object(ns, "Lab")

    # Digital outputs/inputs
    do_vars = [add_var(lab, f"opcua/DO{i}", False, ua.VariantType.Boolean, True) for i in range(1, 5)]
    di_vars = [add_var(lab, f"opcua/DI{i}", False, ua.VariantType.Boolean, False) for i in range(1, 5)]

    # Analog output/input
    ao1 = add_var(lab, "opcua/AO1", 50.0, ua.VariantType.Float, True)
    ai0 = add_var(lab, "opcua/AI0", 50.0, ua.VariantType.Float, False)

    # Counters/timer
    timer_ai1 = add_var(lab, "opcua/TimerAI1", 0, ua.VariantType.Int32, False)
    switch_count = add_var(lab, "opcua/SwitchCount", 0, ua.VariantType.Int32, False)
    crossing_count = add_var(lab, "opcua/Crossing70", 0, ua.VariantType.Int32, False)

    threshold = 70.0
    prev_do = [False] * 4
    prev_ai = 50.0
    timer = 0
    switches = 0
    crossings = 0

    server.start()
    print("OPC UA server listening on opc.tcp://0.0.0.0:4840/")
    try:
        while True:
            # Mirror DO -> DI
            current_do = [bool(v.get_value()) for v in do_vars]
            for idx, val in enumerate(current_do):
                di_vars[idx].set_value(val)

            # AO -> AI mirror
            ao_val = float(ao1.get_value())
            ai0.set_value(ao_val)

            # Count DO rising edges
            for idx in range(4):
                if not prev_do[idx] and current_do[idx]:
                    switches = min(switches + 1, 2**31 - 1)
            prev_do = current_do

            # Count threshold crossings (below -> above)
            if prev_ai <= threshold < ao_val:
                crossings = min(crossings + 1, 2**31 - 1)
            prev_ai = ao_val

            # Timer increments only while AI0 > threshold
            if ao_val > threshold:
                timer += 1

            timer_ai1.set_value(timer)
            switch_count.set_value(switches)
            crossing_count.set_value(crossings)

            time.sleep(1)
    finally:
        server.stop()


if __name__ == "__main__":
    main()
