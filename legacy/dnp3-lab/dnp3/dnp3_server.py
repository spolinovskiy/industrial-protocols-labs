import time

from pydnp3 import asiodnp3, opendnp3, asiopal


def main():
    # Simple DNP3 outstation on TCP/20000
    manager = asiodnp3.DNP3Manager(1, asiodnp3.ConsoleLogger().Create())
    channel = manager.AddTCPServer(
        "server",
        opendnp3.levels.NOTHING,
        asiopal.ChannelRetry().Default(),
        "0.0.0.0",
        20000,
        asiopal.ChannelRetry().Default(),
    )

    config = asiodnp3.OutstationStackConfig(opendnp3.DatabaseSizes(10, 10, 10, 10))
    config.link.LocalAddr = 1024
    config.link.RemoteAddr = 1

    outstation = channel.AddOutstation(
        "outstation",
        opendnp3.PrintingChannelListener().Create(),
        asiodnp3.DefaultOutstationApplication(),
        config,
    )

    # Initialize points
    builder = opendnp3.UpdateBuilder()
    builder.Update(opendnp3.Binary(True), 0)
    builder.Update(opendnp3.Binary(False), 1)
    builder.Update(opendnp3.Analog(50.0), 0)
    outstation.Load(builder.Build())

    outstation.Enable()

    print("DNP3 outstation listening on TCP/20000")

    value = 50.0
    while True:
        value = 50.0 if value >= 90 else value + 5
        builder = opendnp3.UpdateBuilder()
        builder.Update(opendnp3.Analog(value), 0)
        outstation.Load(builder.Build())
        time.sleep(2)


if __name__ == "__main__":
    main()
