import time
from opcua import ua, Server

THRESHOLD = 70.0


def add_var(parent, name, value, vtype, writable=False):
    node = parent.add_variable(f"ns=2;s=opcua/{name}", name, value, vtype)
    if writable:
        node.set_writable()
    return node


def main() -> None:
    server = Server()
    server.set_endpoint("opc.tcp://0.0.0.0:4840/")
    server.set_server_name("Unified OPC UA Lab")

    ns = server.register_namespace("opcua-lab")
    objects = server.get_objects_node()
    lab = objects.add_object(ns, "Lab")

    do_vars = [add_var(lab, f"DO_0{i}", False, ua.VariantType.Boolean, True) for i in range(1, 9)]
    di_vars = [add_var(lab, f"DI_0{i}", False, ua.VariantType.Boolean, False) for i in range(1, 9)]

    ao_vars = [add_var(lab, f"AO_0{i}", 0.0, ua.VariantType.Float, True) for i in range(1, 5)]
    ai_vars = [add_var(lab, f"AI_0{i}", 0.0, ua.VariantType.Float, False) for i in range(1, 5)]

    tmr_01 = add_var(lab, "TMR_01", 0, ua.VariantType.Int32, False)
    cnt_01 = add_var(lab, "CNT_01", 0, ua.VariantType.Int32, False)

    prev_ao1 = 0.0
    timer = 0
    counter = 0

    server.start()
    print("OPC UA server listening on opc.tcp://0.0.0.0:4840/")

    try:
        while True:
            current_do = [bool(v.get_value()) for v in do_vars]
            for idx, val in enumerate(current_do):
                di_vars[idx].set_value(val)

            ao_vals = [float(v.get_value()) for v in ao_vars]
            for idx, val in enumerate(ao_vals):
                ai_vars[idx].set_value(val)

            ao1 = ao_vals[0]
            if prev_ao1 <= THRESHOLD < ao1:
                counter = min(counter + 1, 2**31 - 1)
            prev_ao1 = ao1

            if ao1 > THRESHOLD:
                timer = min(timer + 1, 2**31 - 1)

            tmr_01.set_value(timer)
            cnt_01.set_value(counter)

            time.sleep(1)
    finally:
        server.stop()


if __name__ == "__main__":
    main()
