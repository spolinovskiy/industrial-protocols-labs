# Switchover Performance Report

Date: 2026-01-11  
Host: l-machine (Lenovo-class), Docker Compose

## Test Notes

All measurements are from the l-machine using the unified platform. Base services
were stopped (`docker compose ... down`) to measure cold startup, then protocol
switches were triggered via `labctl`.

Important:
- Prior to the test, a stale `proto-server-modbus` container referenced a removed
  Docker network. Removing the old container resolved the issue.
- Results below reflect real-world container start/stop plus network creation.

## Cold Start (from zero)

Command:

```
docker compose -f platform/docker-compose.platform.yml up -d
```

Observed:
- Full platform startup time: **~18.6s**
- Base services started: `fuxa`, `fuxa_guest`, `gateway`, `diagnostics`, `reset-controller`
- Networks created: `platform_net`, `modbus_net`, `opcua_net`, `bacnet_net`, `cip_net`, `dnp3_net`, `iec104_net`, `mqtt_net`, `s7_net`

## Protocol Switchover Timing

Switch to Modbus:
- `labctl switch modbus`
- **~3.2s** (after removing stale container)

Switch to OPC UA:
- `labctl switch opcua`
- **~16.0s**

Notes:
- OPC UA switch was slower on the l-machine; variability is expected depending on
  image cache and CPU. Cold image pulls will add additional time.

## Resource Snapshot (post-switch)

Immediately after switching to OPC UA:

```
proto-server-opcua  ~0.14% CPU   ~59.6MiB RAM
fuxa               ~0.33% CPU   ~110MiB RAM
fuxa_guest         ~0.11% CPU   ~92MiB RAM
gateway            ~0% CPU      ~2.7MiB RAM
diagnostics        ~0% CPU      ~0.3MiB RAM
reset-controller   ~0% CPU      ~1.2MiB RAM
```

## Restart Behavior (from zero)

Full restart approach:
1) `docker compose ... down`
2) `docker compose ... up -d`
3) `labctl switch <protocol>`

Outcome:
- Works reliably if stale protocol containers are removed.
- If a protocol container references a deleted network, remove it with:
  `docker rm -f proto-server-<protocol>`.

## Optimization Options

Startup:
- Pre-pull protocol images to avoid cold-start pulls.
- Keep one protocol server warm (optional) if faster switching is required.

Switchover:
- Replace `labctl switch` with an API that:
  - stops active protocol
  - removes stale containers
  - starts the next profile
  - restarts FUXA only when device enablement changes
- Avoid `docker pause` for production; prefer stop/start for clean sockets.

Network:
- Ensure old `proto-server-*` containers are removed when networks are recreated.

## Compose vs Kubernetes

Docker Compose is sufficient for:
- Single-VM deployments
- One active protocol at a time
- Small cohorts or guided labs

Kubernetes is only justified when you need:
- Per-user isolated environments at scale
- Automated multi-tenant scheduling
- Strong network isolation and traffic policies
- Horizontal scaling of protocol servers

Recommendation:
- Use Docker Compose for current scope.
- Consider Kubernetes only if user concurrency and isolation become hard requirements.
