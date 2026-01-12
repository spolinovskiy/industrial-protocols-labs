# Replit Integration Roadmap and Merge Prompt

Date: 2026-01-11

## Scope

Merge the Replit frontend project (`IACS-DevOps-Laboratory-1`) with the current
Industrial Protocol Labs backend so users can select labs from a single site.
Guest users see Modbus only; other protocols require authenticated access.

This roadmap provides:
- Step-by-step integration plan.
- Backend contract (endpoints, env vars).
- Hardening and QC test scenarios.
- Multi-user testing guidance.
- Recovery plan.
- Expansion-ready site structure.
- A structured prompt for the Replit agent.

## System Roles

Frontend (Replit):
- Renders the public site and protocol catalog.
- Calls backend API to switch labs.
- Links to guest/admin FUXA endpoints.

Backend (lab VM / l-machine):
- Hosts Docker Compose stack (FUXA, diagnostics, gateways, protocol servers).
- Provides lab switcher API (via `scripts/lab_switcher_server.py`).
- Enforces guest/admin separation via nginx.

## Step-by-Step Integration Plan

### 1) Align URLs and env vars

On Replit, configure:
- `LAB_API_BASE`: base URL for lab switcher API (example: `https://lab.example.com:8090`).
- `LAB_GUEST_URL`: guest HMI (example: `https://lab.example.com:1881`).
- `LAB_ADMIN_URL`: admin HMI (example: `https://lab.example.com:1882`).
- `LAB_DIAG_URL`: diagnostics (example: `https://lab.example.com:1882/diag/`).
- Optional `LAB_API_TOKEN` (for lab switcher API auth).

On the lab VM:
- Run `scripts/lab_switcher_server.py` on port 8090.
- Use nginx for TLS termination (or an external proxy).

### 2) Implement a lab control API

Use the existing switcher server (recommended):
- `scripts/lab_switcher_server.py`
- Endpoints:
  - `POST /api/switch?protocol=<name>`
  - `POST /api/stop`
  - `POST /api/pause?protocol=<name>&pause=1|0`
  - `GET /api/status`
  - `GET /api/stream` (SSE status stream)

The switcher:
- Runs `labctl switch <protocol>`.
- Enables only the active protocol device in FUXA.
- Restarts FUXA to apply connection changes.

If you want a dedicated service instead of the Python script:
- Wrap these commands in a small FastAPI service.
- Keep the same endpoints for frontend compatibility.

### 3) Guest-only Modbus access

The platform already provides:
- `fuxa_guest` with a Modbus-only view.
- nginx guest route that blocks editor/config routes.

Guest URL:
- `http(s)://<lab-host>:1881`

Admin URL:
- `http(s)://<lab-host>:1882` (user: `proto-researcher`, pass: `lab123`)

### 4) Frontend integration steps

Add UI behaviors:
- Protocol cards call `/api/switch`.
- Show current active protocol via `/api/stream` (SSE), with a fallback to `/api/status`.
- For Modbus:
  - Provide guest link and admin link.
- For other protocols:
  - Require admin login or show prompt to sign in.

### 5) Document and test switch behavior

From the frontend:
- Click a protocol card.
- Confirm protocol server starts.
- Confirm FUXA connection status turns green.
- Confirm old protocol is stopped.

## Hardening Checklist

Network:
- TLS termination at nginx or external reverse proxy.
- Restrict ports to 1881/1882/8090 (and optionally 7681 for direct diagnostics).
- Use firewall allowlists for admin/diagnostics.

Auth:
- Guest auth on 1881.
- Admin auth on 1882.
- Optional API token for lab switcher.

FUXA:
- Guest uses `fuxa_guest` and Modbus-only view.
- Admin uses full FUXA with all views.
- Editor blocked for guest.

Diagnostics:
- No advanced shell access.
- Capture-only menu.
- Keep capped capture retention.

Reverse proxy (if used):
- Ensure buffering is disabled for SSE (`/api/stream`) so status events flush to the browser.

## QC / Testing Scenarios

Functional:
- Switch Modbus -> OPC UA -> Modbus.
- Verify FUXA connects to the active protocol only.
- Confirm guest cannot access /editor, /home, /config, /configurator.

Security:
- Guest cannot open diagnostics.
- Invalid auth for admin and guest is rejected.
- API token required when enabled.

Performance:
- Measure switch time after cold start.
- Ensure no orphan containers with stale networks.

## Multi-User Testing Scenarios

Single-host (shared):
- Two users try to switch protocols at the same time.
- Validate lock or last-write-wins behavior.
- Confirm resets are predictable.

Isolation (recommended for real usage):
- One VM per user (or per class group).
- Shared VM only for guided labs with scheduled sessions.

## Recovery / Restore Plan

Backup strategy:
- Daily snapshot of `platform/fuxa/volumes`.
- Git-backed repository for configs and scripts.
- Retain PCAPs only for short periods.

Restore steps:
1) Rebuild VM from golden image.
2) `git clone` the repo.
3) Restore `platform/fuxa/volumes` from backup.
4) `docker compose up -d`.
5) Verify guest/admin access.

Optional hardening:
- Immutable images for protocol servers.
- Separate admin accounts per cohort.
- Off-host backups to object storage.

## Future Expansion (Site Structure)

Add top-level lab categories:
- Protocol Labs (current).
- OT -> IT Data Pipelines.
- Industrial DMZ / Purdue Model.
- Observability Labs.
- Security and Threat Modeling Labs.
- Configuration & Change Management.
- Incident & Failure Scenarios.
- Digital Twin Lite.
- Human Interface / Vocabulary labs.

Each category should map to:
- Overview page.
- Lab list.
- Per-lab details with prerequisites and links.

## Replit Agent Prompt (Copy/Paste)

You are integrating the Replit frontend with the industrial-protocols-labs backend.

Goals:
1) Build a protocol catalog UI with cards for Modbus, OPC UA, CIP, BACnet, DNP3, IEC-104, MQTT, S7.
2) On card click, call the lab switcher API:
   - POST `${LAB_API_BASE}/api/switch?protocol=<protocol>`
3) Show current active protocol using the SSE stream:
   - GET `${LAB_API_BASE}/api/stream` (event: `status`, payload includes `active`)
   - Fallback to `${LAB_API_BASE}/api/status` if SSE is unavailable
4) Provide links:
   - Guest HMI: `${LAB_GUEST_URL}` (Modbus only)
   - Admin HMI: `${LAB_ADMIN_URL}` (proto-researcher / lab123)
   - Diagnostics: `${LAB_DIAG_URL}`
5) Guest UX:
   - Modbus card shows guest link.
   - Other protocol cards show "Sign in to access".

Implement:
- Configurable env vars: LAB_API_BASE, LAB_GUEST_URL, LAB_ADMIN_URL, LAB_DIAG_URL, LAB_API_TOKEN.
- If LAB_API_TOKEN is set, send it in `X-Auth-Token`.
- Display switch status and handle errors.

Hardening expectations:
- Do not expose admin URLs in guest-only layouts.
- Include a simple warning that switching protocols affects other active users.
- Provide a toggle or "confirm switch" step.

Testing checklist:
- Switch to Modbus -> FUXA Modbus screen becomes active.
- Switch to OPC UA -> OPC UA server starts, Modbus server stops.
- Guest cannot access editor or diagnostics.

Deliverable:
- A working front-end that drives lab switching and links to FUXA endpoints.
