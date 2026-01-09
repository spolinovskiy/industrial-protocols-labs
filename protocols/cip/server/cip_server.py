import subprocess
import sys


def main() -> None:
    tag_defs = [
        "DO_01=BOOL",
        "DO_02=BOOL",
        "DO_03=BOOL",
        "DO_04=BOOL",
        "DO_05=BOOL",
        "DO_06=BOOL",
        "DO_07=BOOL",
        "DO_08=BOOL",
        "DI_01=BOOL",
        "DI_02=BOOL",
        "DI_03=BOOL",
        "DI_04=BOOL",
        "DI_05=BOOL",
        "DI_06=BOOL",
        "DI_07=BOOL",
        "DI_08=BOOL",
        "AO_01=INT",
        "AO_02=INT",
        "AO_03=INT",
        "AO_04=INT",
        "AI_01=INT",
        "AI_02=INT",
        "AI_03=INT",
        "AI_04=INT",
        "TMR_01=INT",
        "CNT_01=INT",
    ]
    cmd = [
        sys.executable,
        "-m",
        "cpppo.server.enip",
        "--address",
        "0.0.0.0:44818",
        *tag_defs,
    ]
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
