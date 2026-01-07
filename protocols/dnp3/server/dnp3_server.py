import time

from pydnp3 import asiodnp3, opendnp3, asiopal

THRESHOLD = 70.0


def main() -> None:
    manager = asiodnp3.DNP3Manager(1, asiodnp3.ConsoleLogger().Create())
    channel = manager.AddTCPServer(
        "server",
        opendnp3.levels.NOTHING,
        asiopal.ChannelRetry().Default(),
        "0.0.0.0",
        20000,
        asiopal.ChannelRetry().Default(),
    )

    sizes = opendnp3.DatabaseSizes(
        numBinary=8,
        numDoubleBinary=0,
        numAnalog=8,
        numCounter=0,
        numFrozenCounter=0,
        numBinaryOutputStatus=8,
        numAnalogOutputStatus=4,
        numTimeAndInterval=0,
    )
    config = asiodnp3.OutstationStackConfig(sizes)
    config.link.LocalAddr = 1024
    config.link.RemoteAddr = 1

    outstation = channel.AddOutstation(
        "outstation",
        opendnp3.PrintingChannelListener().Create(),
        asiodnp3.DefaultOutstationApplication(),
        config,
    )

    builder = opendnp3.UpdateBuilder()
    for idx in range(8):
        builder.Update(opendnp3.Binary(False), idx)
        builder.Update(opendnp3.BinaryOutputStatus(False), idx)
    for idx in range(4):
        builder.Update(opendnp3.Analog(0.0), idx)
        builder.Update(opendnp3.AnalogOutputStatus(0.0), idx)
    builder.Update(opendnp3.Analog(0.0), 4)  # TMR_01
    builder.Update(opendnp3.Analog(0.0), 5)  # CNT_01
    outstation.Load(builder.Build())

    outstation.Enable()
    print("DNP3 outstation listening on TCP/20000")

    prev_ao1 = 0.0
    timer = 0
    counter = 0
    ao1 = 0.0

    while True:
        ao1 = 75.0 if ao1 < 75.0 else 0.0
        builder = opendnp3.UpdateBuilder()
        builder.Update(opendnp3.Analog(ao1), 0)  # AI_01

        if prev_ao1 <= THRESHOLD < ao1:
            counter = min(counter + 1, 2**31 - 1)
        prev_ao1 = ao1

        if ao1 > THRESHOLD:
            timer = min(timer + 1, 2**31 - 1)

        builder.Update(opendnp3.Analog(float(timer)), 4)
        builder.Update(opendnp3.Analog(float(counter)), 5)
        outstation.Load(builder.Build())
        time.sleep(1)


if __name__ == "__main__":
    main()
