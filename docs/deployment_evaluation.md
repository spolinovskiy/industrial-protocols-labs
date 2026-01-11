# Deployment Readiness Report (Industrial Protocol Labs)

Date: 2026-01-11

## Executive Summary

The current lab platform is deployable on a single VM for small cohorts and demos, with a clear separation between guest (Modbus-only) access and admin access. The main constraints are multi-user concurrency (shared state) and switchover orchestration (front-end must control which protocol is active). The system is best suited for one active protocol at a time per host, with a predictable reset controller to restore baseline state.

Key readiness items:
- Core platform services (FUXA, gateway, diagnostics, reset controller) are stable and restartable.
- Guest HMI is isolated to a Modbus-only FUXA instance.
- Protocol servers can be switched via `labctl switch <protocol>`.
- Diagnostics captures are bounded and menu-only (no shell).

Remaining gaps for production:
- Multi-user isolation requires per-user environments or per-session namespaces.
- Switchover should be driven by a backend API rather than manual CLI.
- TLS should be terminated at nginx or an external reverse proxy.

## Current Architecture (Baseline)

Always-on services:
- FUXA admin (`fuxa`): full multi-protocol views.
- FUXA guest (`fuxa_guest`): Modbus-only view.
- Gateway (`nginx`): ports 1881 (guest) and 1882 (admin + diagnostics).
- Diagnostics (`ttyd + termshark`): capture-only menu.
- Reset controller: TTL and idle-time resets; seed restore.

Protocol servers:
- One active profile at a time (modbus, opcua, bacnet, cip, dnp3, iec104, mqtt, s7).

## Lab Switchover Flow (Current)

Recommended switchover steps (admin path):
1) Front-end calls backend to run `./labctl switch <protocol>`.
2) Backend writes `platform/active_protocol` for reset controller.
3) Optionally trigger a seed import for the selected protocol to ensure view/tag consistency.

Notes:
- The reset controller imports the seed on TTL/idle expiration, not immediately.
- If immediate view consistency is required, call the FUXA import endpoint or a DB patch script right after switching.
- For guest, only Modbus is available; no switching is allowed.

## Guest Access Hardening

Guest behavior (expected):
- Only Modbus Test Bench is visible.
- No access to editor or device management.
- No view switching to other protocols.

Current enforcement:
- Guest traffic is routed to `fuxa_guest` with a pruned DB (single Modbus view).
- Nginx blocks `/editor`, `/device`, `/devices`, `/project`, `/diag`.

Recommended additions:
- Block `/lab` and `/api` for guest if any unwanted endpoints are exposed.
- Keep guest on a separate FUXA instance to avoid accidental cross-protocol access.

## Session Lifecycle and Reset

The reset controller enforces:
- TTL (1 hour default).
- Idle timeout (15 minutes default).
- Capture retention (3 days, capped).

Limitations:
- The controller is global for the host; it cannot isolate per-user activity.
- Reset logic is safe for a single cohort but conflicts with concurrent users.

Recommendation:
- For multi-user concurrency, use a per-user container stack or per-user VM.
- If staying on one VM, enforce one active user/session at a time.

## Multi-User Behavior (Risk Analysis)

Shared environment risks:
- One user switching protocols interrupts others.
- Shared FUXA DB and devices cause conflicting writes.
- Diagnostics captures mix traffic across users.

Mitigation options (in order of complexity):
1) One VM per user (simplest, reliable isolation).
2) One VM per group, time-sliced (reset controller forces session rotation).
3) Multi-tenant on one VM (advanced): unique compose project per user, port offsets, isolated networks, separate FUXA instances.

## VM Sizing Recommendations

Assumptions:
- One protocol server active at a time.
- FUXA and diagnostics always on.

Small demo / 1-5 users (single session):
- 2 vCPU, 4 GB RAM, 40-60 GB disk.

Small class / 5-15 users with scheduled sessions:
- 4 vCPU, 8 GB RAM, 80-120 GB disk.

Concurrent users requiring isolation:
- 2 vCPU, 4 GB RAM per user (or group) VM.

Networking:
- Expose only 1881/1882 externally.
- Use host firewall to restrict protocol ports unless specifically needed for packet exercises.

## Pause vs Stop

`docker pause` can freeze protocol containers but often breaks client connections and leaves sockets in odd states. For predictable lab behavior:
- Use `docker stop` / `labctl stop` for non-active protocol servers.
- Keep platform services running (FUXA, gateway, diagnostics).

## Integration Steps for Front-End

Minimum backend API responsibilities:
- `POST /lab/switch?protocol=<name>` -> run `labctl switch <protocol>`.
- `POST /lab/stop` -> run `labctl stop`.
- `GET /lab/status` -> returns active protocol + compose health.
- Optionally call FUXA import endpoint to load the matching seed.

Front-end flow:
1) User selects protocol card.
2) Front-end calls backend `switch` endpoint.
3) Backend confirms active protocol and returns links for guest/admin.
4) Front-end opens FUXA admin view (or guest if Modbus).

## Readiness Verdict

Ready for VM deployment for controlled sessions, with clear guardrails.
Not ready for multi-user concurrency without per-user isolation.
Switchover requires backend orchestration; a minimal API is needed before connecting a public UI.
