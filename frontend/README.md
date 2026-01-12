# IACS DevOps Lab

## Purpose
IACS DevOps Lab is a hands-on training and experimentation platform for
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
- client/ – web UI
- server/ – backend services
- labs/ – protocol laboratories (Docker-based)
- scripts/ – helper and automation scripts
- shared/ – shared models and utilities

## Protocol laboratories
Each protocol lab provides:
- Docker Compose environment
- Client and server simulators
- Packet capture (PCAP) export
- Wireshark and PyShark analysis

Supported / planned protocols:
- Modbus TCP
- OPC UA
- CIP (EtherNet/IP)
- DNP3
- MQTT

## Getting started
See `docs/getting-started.md`.
