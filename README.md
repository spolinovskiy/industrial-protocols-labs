# industrial-protocols-labs

Unified, docker-based ICS protocol testbed focused on packet inspection and a consistent HMI experience.

## Quickstart

```bash
./labctl start modbus
```

- Guest HMI (view-only): `http://localhost:1881` (user: `guest`, pass: `guest`)
- Admin HMI + diagnostics: `http://localhost:1882` (user: `proto-researcher`, pass: `lab123`)
- Diagnostics menu: `http://localhost:1882/diag/`

Switch protocols:

```bash
./labctl switch opcua
```

Stop the active protocol server:

```bash
./labctl stop
```

## Lab Switcher UI (Prototype)

The prototype UI lives at `platform/lab_switcher/index.html` and is served by
`scripts/lab_switcher_server.py`. It provides a quick way to switch protocols
and toggle FUXA device enablement during integration testing.

Start the switcher server:

```bash
LAB_SWITCHER_HOST=0.0.0.0 LAB_SWITCHER_PORT=8090 \
python3 scripts/lab_switcher_server.py
```

Open the UI:

```
http://localhost:8090
```

Optional auth token (recommended for shared hosts):

```bash
export LAB_SWITCHER_TOKEN="change-me"
```

Then pass the token as a query param or header:
- `http://localhost:8090?token=change-me`
- `X-Auth-Token: change-me`

What it does:
- Switches protocols via `labctl switch <protocol>`.
- Updates FUXA device enable flags so only the active protocol is enabled.
- Restarts FUXA after switch/stop to apply connection changes.

Note: `Pause/Resume` uses `docker pause/unpause` and is intended only for debugging.

## Repo Layout

```
industrial-protocols-labs/
  frontend/              # Replit UI project (see frontend/README.md)
  docs/
  platform/
    docker-compose.platform.yml
    nginx/
      nginx.conf
      auth/
        guest.htpasswd
        admin.htpasswd
    diagnostics/
      Dockerfile
      entrypoint.sh
      menu.sh
      capture/
        modbus.sh opcua.sh bacnet.sh cip.sh dnp3.sh iec104.sh mqtt.sh s7.sh
    fuxa/
      volumes/          # runtime DB/logs/images (not committed)
      seeds/            # FUXA seed projects (JSON blueprints)
    reset/
      Dockerfile
      reset.sh
      policy.yaml
  protocols/
    modbus/
      server/
      client/
    opcua/
      server/
      client/
    bacnet/
      server/
      client/
    cip/
      server/
      client/
    dnp3/
      server/
      client/
    iec104/
      server/
      client/
    mqtt/
      broker/
      device-bridge/
      client/
    s7/
      plc-sim/
      client/
  scripts/
    test_all.sh
```

Legacy per-protocol lab folders live under `legacy/` to preserve earlier work. The unified platform is the supported path forward.

## Frontend (Replit)

The Replit UI project is embedded in `frontend/`. Follow `frontend/README.md` to run it locally,
then point it at the backend host that runs `scripts/lab_switcher_server.py`.

## Protocol Profiles

Start the platform + one protocol server:

```bash
docker compose -f platform/docker-compose.platform.yml --profile opcua up -d
```

Available profiles:
- `modbus`
- `opcua`
- `bacnet`
- `cip`
- `dnp3`
- `iec104`
- `mqtt`
- `s7`

Optional clients (for testing): `modbus-test`, `opcua-test`, `bacnet-test`, `cip-test`, `dnp3-test`, `iec104-test`, `mqtt-test`, `s7-test`.

## Canonical Tags

Tags are consistent across all protocols:

- DO_01..DO_08
- DI_01..DI_08
- AO_01..AO_04
- AI_01..AI_04
- TMR_01
- CNT_01

Device story (example):
- AO_01 = valve command (0–100%)
- AI_01 = valve feedback (0–100%)
- DI_01 = open limit, DI_02 = close limit
- DO_01 = open command, DO_02 = close command
- TMR_01 = time above 70% command
- CNT_01 = count crossings above 70%

## FUXA Seeds

Seed projects live in `platform/fuxa/seeds/*.project.json`. Import manually in FUXA if needed:

- Admin UI: `Open Project` → select `platform/fuxa/seeds/<protocol>.project.json`

The reset controller attempts a best-effort import via API when a protocol is active.

## Diagnostics

The diagnostics menu is terminal-only (no full shell by default) and provides on-demand captures:

- Modbus: tcp/502
- OPC UA: tcp/4840
- BACnet/IP: udp/47808
- CIP: tcp/44818 + udp/2222
- DNP3: tcp/20000
- IEC‑104: tcp/2404
- MQTT: tcp/1883
- S7comm: tcp/102

Captures are bounded (max 20 files, 3 days retention).

## Reset Controller

Default policy (`platform/reset/policy.yaml`):
- TTL: 1 hour
- Idle timeout: 15 minutes
- Capture retention: 3 days

The controller stops the active protocol server and clears old captures on reset.

## Known Limitations

- IEC‑104 implementation is a placeholder TCP echo server to enable packet capture demonstrations.
- DNP3 output control is minimal (outstation publishes points; control command handling is limited).
- BACnet/IP client uses BAC0 for simple testing; server uses bacpypes3.
- DNP3 Python bindings (pydnp3) do not build reliably on arm64. Tests skip DNP3 on arm64 unless `RUN_DNP3=1` is set on x86_64.

## Tests

Run the test suite (builds and cycles through profiles):

```bash
scripts/test_all.sh
```

## Ports

- Guest HMI: 1881
- Admin HMI + diagnostics: 1882
- Diagnostics menu (via gateway): /diag

Protocol server ports are the standard defaults (502, 4840, 47808/udp, 44818, 20000, 2404, 1883, 102).

## HTTPS / TLS Guidance

Use HTTPS for any access outside a trusted LAN or when exposing the lab via Replit or a public endpoint. Keep HTTP only for local LAN testing.

Recommended options:

- **TLS termination at nginx (in gateway container)**:
  - Add `listen 443 ssl;` and mount cert/key into `platform/nginx/`.
  - Redirect `http -> https` (port 80) if you expose it.
  - Keep upstreams (`fuxa`, `fuxa_guest`, `diagnostics`) on HTTP inside the Docker network.
- **External reverse proxy** (Caddy/Traefik/Nginx on the host):
  - Terminate TLS on the host and proxy to `gateway:1881/1882`.
  - Recommended for managed environments (Replit, cloud VM) where cert automation is easier.

Notes:
- Diagnostics uses WebSockets; keep `Upgrade`/`Connection` headers in the TLS proxy.
- If you enforce HTTPS, ensure `X-Forwarded-Proto https` is preserved so FUXA generates correct links.
