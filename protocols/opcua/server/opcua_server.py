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
    prev_do = [False] * 8
    timer = 0
    switch_count = 0
    thresh_count = 0
    last_tick = time.monotonic()

    server.start()
    print("OPC UA server listening on opc.tcp://0.0.0.0:4840/")

    try:
        while True:
            current_do = [bool(v.get_value()) for v in do_vars]
            reset_requested = current_do[4] and not prev_do[4]
            if reset_requested:
                timer = 0
                switch_count = 0
                thresh_count = 0
                prev_ao1 = float(ao_vars[0].get_value())
                last_tick = time.monotonic()
                for idx in range(5):
                    do_vars[idx].set_value(False)
                current_do = [bool(v.get_value()) for v in do_vars]

            for idx, val in enumerate(current_do):
                di_vars[idx].set_value(val)

            ao_vals = [float(v.get_value()) for v in ao_vars]
            ao1 = ao_vals[0]

            if not reset_requested:
                for idx in range(4):
                    if not prev_do[idx] and current_do[idx]:
                        switch_count = min(switch_count + 1, 2**31 - 1)

                if prev_ao1 <= THRESHOLD < ao1:
                    thresh_count = min(thresh_count + 1, 2**31 - 1)
                prev_ao1 = ao1

                now = time.monotonic()
                if now - last_tick >= 1.0:
                    ticks = int(now - last_tick)
                    last_tick += ticks
                    if ao1 > THRESHOLD:
                        timer = min(timer + ticks, 2**31 - 1)

            ai_vars[0].set_value(ao1)
            ai_vars[1].set_value(switch_count)
            ai_vars[2].set_value(thresh_count)
            ai_vars[3].set_value(ao_vals[3])

            tmr_01.set_value(timer)
            cnt_01.set_value(thresh_count)

            prev_do = list(current_do)

            time.sleep(1)
    finally:
        server.stop()


if __name__ == "__main__":
    main()
