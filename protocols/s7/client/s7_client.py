import time

import snap7
from snap7.util import set_bool, set_int


def main() -> None:
    client = snap7.client.Client()
    client.connect("proto-server-s7", 0, 1)

    for step in range(3):
        db = bytearray(client.db_read(1, 0, 32))
        set_bool(db, 0, 0, True)
        set_int(db, 2, 75 + step)
        client.db_write(1, 0, db)
        time.sleep(1)

        set_bool(db, 0, 0, False)
        client.db_write(1, 0, db)
        time.sleep(1)

    client.disconnect()


if __name__ == "__main__":
    main()
