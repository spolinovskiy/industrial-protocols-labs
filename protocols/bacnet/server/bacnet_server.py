import asyncio
import os
import socket

from bacpypes3.app import Application
from bacpypes3.basetypes import NetworkType, ProtocolLevel
from bacpypes3.local.device import DeviceObject
from bacpypes3.object import (
    AnalogInputObject,
    AnalogOutputObject,
    AnalogValueObject,
    BinaryInputObject,
    BinaryOutputObject,
    NetworkPortObject,
)
from bacpypes3.pdu import IPv4Address

THRESHOLD = 70.0


async def main() -> None:
    device = DeviceObject(
        objectIdentifier=("device", 1234),
        objectName="BACnet Lab",
        vendorIdentifier=15,
    )

    network_port = NetworkPortObject(
        objectIdentifier=("network-port", 1),
        objectName="NetworkPort-1",
    )
    network_port.networkType = NetworkType.ipv4
    network_port.protocolLevel = ProtocolLevel.bacnetApplication
    ip_addr = os.environ.get("BACNET_IP")
    if not ip_addr:
        try:
            ip_addr = socket.gethostbyname(socket.gethostname())
        except socket.gaierror:
            ip_addr = "0.0.0.0"
    network_port.address = IPv4Address(f\"{ip_addr}/24:47808\")
    network_port.networkNumber = 1
    network_port.networkNumberQuality = "configured"

    do_objs = [
        BinaryOutputObject(objectIdentifier=("binary-output", i), objectName=f"DO_0{i}", presentValue=False)
        for i in range(1, 9)
    ]
    di_objs = [
        BinaryInputObject(objectIdentifier=("binary-input", i), objectName=f"DI_0{i}", presentValue=False)
        for i in range(1, 9)
    ]

    ao_objs = [
        AnalogOutputObject(objectIdentifier=("analog-output", i), objectName=f"AO_0{i}", presentValue=0.0)
        for i in range(1, 5)
    ]
    ai_objs = [
        AnalogInputObject(objectIdentifier=("analog-input", i), objectName=f"AI_0{i}", presentValue=0.0)
        for i in range(1, 5)
    ]

    tmr_obj = AnalogValueObject(
        objectIdentifier=("analog-value", 1),
        objectName="TMR_01",
        presentValue=0,
    )
    cnt_obj = AnalogValueObject(
        objectIdentifier=("analog-value", 2),
        objectName="CNT_01",
        presentValue=0,
    )

    objects = [device, network_port] + do_objs + di_objs + ao_objs + ai_objs + [tmr_obj, cnt_obj]
    app = Application.from_object_list(objects)

    print("BACnet/IP server running on UDP/47808")

    prev_ao1 = 0.0
    timer = 0
    counter = 0

    while True:
        for idx, do_obj in enumerate(do_objs):
            di_objs[idx].presentValue = bool(do_obj.presentValue)

        for idx, ao_obj in enumerate(ao_objs):
            ai_objs[idx].presentValue = float(ao_obj.presentValue)

        ao1 = float(ao_objs[0].presentValue)
        if prev_ao1 <= THRESHOLD < ao1:
            counter = min(counter + 1, 2**31 - 1)
        prev_ao1 = ao1

        if ao1 > THRESHOLD:
            timer = min(timer + 1, 2**31 - 1)

        tmr_obj.presentValue = timer
        cnt_obj.presentValue = counter

        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
