import subprocess


def main():
    # Simple EtherNet/IP server using cpppo.
    # Tag types: BOOL for digital, INT for analog/timer/counter values.
    tag_defs = [
        "DO1=BOOL",
        "DO2=BOOL",
        "DO3=BOOL",
        "DO4=BOOL",
        "DI1=BOOL",
        "DI2=BOOL",
        "DI3=BOOL",
        "DI4=BOOL",
        "AO1=INT",
        "AI0=INT",
        "TimerAI1=INT",
        "SwitchCount=INT",
        "Crossing70=INT",
    ]

    # cpppo ENIP server (Logix-style tags)
    subprocess.run(
        [
            "python",
            "-m",
            "cpppo.server.enip",
            "--address",
            "0.0.0.0:44818",
            "-S",
            *tag_defs,
        ],
        check=True,
    )


if __name__ == "__main__":
    main()
