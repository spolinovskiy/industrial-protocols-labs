import time

import snap7
from snap7.util import get_bool, get_int, set_bool, set_int
from snap7.types import Areas

THRESHOLD = 70
DB_NUM = 1
DB_SIZE = 256


def main() -> None:
    server = snap7.server.Server()
    db = bytearray(DB_SIZE)
    server.register_area(Areas.DB, DB_NUM, db)
    server.start(tcpport=102)
    print("S7 server listening on 0.0.0.0:102 (DB1)")

    prev_ao1 = 0
    timer = 0
    counter = 0

    while True:
        # DO bits in byte 0
        do_bits = [get_bool(db, 0, bit) for bit in range(8)]
        for bit, val in enumerate(do_bits):
            set_bool(db, 1, bit, val)  # DI bits in byte 1

        ao_vals = [get_int(db, 2 + (idx * 2)) for idx in range(4)]
        for idx, val in enumerate(ao_vals):
            set_int(db, 10 + (idx * 2), val)  # AI values

        ao1 = ao_vals[0]
        if prev_ao1 <= THRESHOLD < ao1:
            counter = min(counter + 1, 32767)
        prev_ao1 = ao1

        if ao1 > THRESHOLD:
            timer = min(timer + 1, 32767)

        set_int(db, 18, timer)
        set_int(db, 20, counter)

        time.sleep(1)


if __name__ == "__main__":
    main()
