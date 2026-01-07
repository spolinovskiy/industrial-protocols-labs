import time

from pydnp3 import asiodnp3, opendnp3, asiopal


def main():
    manager = asiodnp3.DNP3Manager(1, asiodnp3.ConsoleLogger().Create())
    channel = manager.AddTCPClient(
        "client",
        opendnp3.levels.NOTHING,
        asiopal.ChannelRetry().Default(),
        "0.0.0.0",
        ["dnp3-server"],
        20000,
        asiopal.ChannelRetry().Default(),
    )

    stack_config = asiodnp3.MasterStackConfig()
    stack_config.link.LocalAddr = 1
    stack_config.link.RemoteAddr = 1024

    master = channel.AddMaster(
        "master",
        opendnp3.PrintingChannelListener().Create(),
        asiodnp3.DefaultMasterApplication(),
        stack_config,
    )

    master.AddClassScan(opendnp3.ClassField().AllClasses(), opendnp3.TimeDuration().Seconds(5))
    master.Enable()

    print("DNP3 master started")

    while True:
        time.sleep(5)


if __name__ == "__main__":
    main()
