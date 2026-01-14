# IACS DevOps Labs and Experiments

## Purpose
IACS DevOps Labs and Experiments is a hands-on training and experimentation platform for
industrial automation and control system (IACS) engineers.

The project provides reproducible protocol laboratories using Docker,
focused on industrial communication, observability, and security analysis.

## Target audience
- Automation / SCADA engineers
- OT cybersecurity specialists
- DevOps engineers working with industrial protocols
- Students and researchers

## Core principles
- Protocol-first learning
- Reproducible labs via Docker
- Cross-platform support (Linux, Windows, macOS)
- Packet-level visibility (Wireshark / PyShark)

## Repository structure
- client/ – web UI (React + Vite)
- server/ – Express API used by the UI
- shared/ – shared models and utilities
- script/ – build helpers

## Local development

1) Install dependencies:

```bash
npm install
```

2) Export environment variables for the lab backend:

```bash
export LAB_SWITCHER_URL="http://<lab-host>:8090"
export LAB_GUEST_URL="http://<lab-host>:1881"
export LAB_ADMIN_URL="http://<lab-host>:1882"
export LAB_DIAG_URL="http://<lab-host>:1882/diag"
export LAB_API_TOKEN="optional-token"

export VITE_LAB_GUEST_URL="http://<lab-host>:1881"
export VITE_LAB_ADMIN_URL="http://<lab-host>:1882"
```

3) Start the frontend server:

```bash
npm run dev
```

4) Open the site:

```
http://localhost:5000
```

5) Test a lab:
- Open a protocol page.
- Click "Start Lab" to run the backend protocol stack.
- Click "Open FUXA Interface" to view the HMI.
