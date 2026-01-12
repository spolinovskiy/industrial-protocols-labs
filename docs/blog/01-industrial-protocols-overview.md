# Industrial Protocols Overview

## Understanding Protocol Philosophy Before You Touch the Wire

Industrial protocols are often taught as collections of ports, frame formats, and supported devices. That approach is sufficient for basic integration, but it fails when systems must scale, interoperate across vendors, or withstand operational and security pressure.

This article takes a different approach.

Instead of beginning with how to use industrial protocols, it begins with how they think. Every protocol encodes assumptions about data, communication, reliability, and security. Those assumptions shape architectures long before the first packet is captured. When they are misunderstood, integration problems follow. When they are understood, protocol selection becomes an engineering decision rather than guesswork.

## What protocol philosophy means

At a practical level, every industrial protocol answers the same four questions, whether explicitly or implicitly.

- How is data represented? As raw memory locations, structured objects, or opaque messages?
- How does communication occur? Through polling, cyclic exchange, event reporting, or brokered publish/subscribe?
- What assumptions exist about time and reliability? Best-effort reads, deterministic updates, or guaranteed event delivery?
- Where does security live? Outside the protocol, added later, or embedded in the architecture itself?

Most integration failures occur when systems with incompatible answers to these questions are forced together.

## Four mental models of industrial protocols

Viewed through this lens, the eight protocols discussed here fall naturally into four conceptual families.

### 1. Memory-oriented protocols

Modbus, classic S7comm

These protocols treat data as locations, not concepts. A register or memory offset has no intrinsic meaning; interpretation exists entirely outside the protocol. Communication is simple request/response.

Their strength is durability and simplicity. Their weakness is semantic blindness. As systems grow, documentation replaces protocol structure, and complexity moves out of sight.

### 2. Telecontrol and event-centric protocols

DNP3, IEC-60870-5-104

These protocols assume unreliable links, large distances, and operational consequences. Data is modeled as points with state, quality, and time. Event reporting and acknowledgements are central, not optional.

They were designed for critical infrastructure long before the term "IIoT" existed.

### 3. Object-oriented industrial protocols

CIP (EtherNet/IP), OPC UA, BACnet

These protocols model devices explicitly. Data has structure, type, and context. Objects expose attributes and services. Discovery and metadata are first-class concerns.

This increases complexity, but it enables long-term interoperability and vendor independence.

### 4. Messaging and transport protocols

MQTT

MQTT deliberately avoids modeling the physical world. It moves messages efficiently and at scale. Semantics are external, defined by topic structure and payload conventions.

This is not a limitation. It is the point.

## Philosophy-level comparison

| Protocol | Data model | Communication | Semantics | Complexity | Security posture |
| --- | --- | --- | --- | --- | --- |
| Modbus | Registers, coils | Client polling | None | Low | Originally none; TLS via Modbus Security |
| DNP3 | Points + events | Event-driven | Limited | Medium | Secure Authentication profiles |
| S7comm | PLC memory areas | Session reads/writes | None | Medium | Historically weak; proprietary hardening |
| IEC-104 | Information objects | Telecontrol workflow | Limited | Medium | IEC-62351 (TLS profiles) |
| MQTT | Messages on topics | Brokered pub/sub | External | Low-Medium | TLS + broker policy |
| OPC UA | Typed information model | Services + subscriptions | Strong | High | Built-in secure channels |
| CIP | Objects + cyclic I/O | Implicit + explicit | Strong | High | CIP Security (TLS/DTLS) |
| BACnet | Building objects | Service-oriented | Strong | High | BACnet/SC with TLS 1.3 |

This comparison is not about superiority. It is about architectural fitness.

## How each protocol "thinks"

### Modbus — "Read this address"

Modbus models the world as shared memory. A value is a value, nothing more. This makes it easy to implement and trivial to test, but incapable of self-description or native eventing. Security can be added at the transport layer, but the data model remains flat.

Architectural takeaway: Use Modbus where simplicity and ubiquity outweigh semantic richness.

### DNP3 — "Tell me what changed, and when"

DNP3 assumes that polling everything is wasteful and fragile. It prioritizes time-stamped events, acknowledgements, and operational discipline. Security extensions fit naturally because command authenticity already mattered.

Architectural takeaway: DNP3 embeds operational intent directly into protocol behavior.

### S7comm — "Access the PLC internals"

S7comm is optimized for Siemens tooling, not interoperability. It assumes trusted environments and direct memory access. Security improvements have come later, but they reinforce its closed, privileged nature.

Architectural takeaway: Treat S7comm as internal plumbing, not an architectural boundary.

### IEC-104 — "Operate the grid safely"

IEC-104 encodes power-system operations as protocol rules: monitoring, commands, confirmations, sequencing. It formalizes control-room workflow on the wire. Security profiles extend this model without changing its intent.

Architectural takeaway: IEC-104 is operational process, not generic data exchange.

### MQTT — "Move messages, not meaning"

MQTT minimizes assumptions. It scales by decoupling producers and consumers. Meaning is imposed by convention, not enforced by protocol rules. Security is delegated to brokers and transport.

Architectural takeaway: MQTT excels as a distribution layer, not a device model.

### OPC UA — "Make meaning explicit"

OPC UA assumes interoperability requires shared understanding. Its information model captures structure, relationships, and access rules. Security is integral, not optional. Complexity is the price of clarity.

Architectural takeaway: OPC UA belongs at system boundaries where meaning must survive change.

### CIP (EtherNet/IP) — "Objects plus real-time behavior"

CIP unifies object modeling with cyclic real-time exchange. Time-critical I/O and configuration services coexist within one framework. Security enhancements preserve control behavior.

Architectural takeaway: CIP is a control system architecture, not just a protocol.

### BACnet — "Buildings as structured systems"

BACnet standardizes building concepts as shared objects. This enables multi-vendor integration at the application level. BACnet/SC modernizes the architecture with TLS-based security.

Architectural takeaway: BACnet's strength is semantic alignment across building systems.

## A security reality check

TLS alone does not make systems secure.

Effective security depends on identity, certificate lifecycle, roles, segmentation, and operations. Protocols differ mainly in how much of this they standardize versus how much they leave to architecture.

## Why this matters for protocol labs

Protocol labs should not stop at packet dissection.

They should test assumptions:
- polling versus events
- cyclic versus on-demand
- flat memory versus semantic models
- security outside versus inside the protocol

A good lab answers one question:
What architectural behavior does this protocol encourage?

## Closing perspective

Industrial protocols do not compete in isolation. They coexist in layers.

Understanding protocol philosophy allows engineers to place each protocol where it fits naturally, avoid forcing one protocol to imitate another, and design systems that scale technically and organizationally.

That understanding is the foundation of any serious industrial protocol lab and any sustainable OT architecture.
