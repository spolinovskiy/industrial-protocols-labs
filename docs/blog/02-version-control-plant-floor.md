# Version Control Comes to the Plant Floor

## How OT Is Adopting Git Principles for PLC Logic, Configuration, and Change Management

For decades, version control in industrial automation meant one thing:
"Who has the latest backup?"

Projects were tracked through file names, USB drives, and email attachments. Rollbacks depended on tribal knowledge. Merges were avoided entirely. Audit trails were manual at best.

That model no longer survives modern OT reality.

As industrial systems become:
- software-heavy
- continuously updated
- cyber-regulated
- increasingly integrated with IT systems

OT is being forced to adopt IT-grade version control discipline.

This shift is no longer theoretical. Major automation vendors are now embedding Git concepts directly into engineering workflows.

## 1. Why Git principles matter in OT (not Git itself)

Before naming tools, it is critical to separate principles from implementations.

OT does not need developers writing git rebase on PLCs.

OT does need:
- deterministic history of logic changes
- diff visibility at logic and configuration level
- safe rollback to known-good states
- branch-like workflows for FAT/SAT/hotfixes
- traceability for compliance (IEC 62443, FDA, ISO, FSTEC)

In other words:
OT needs outcomes of Git, not Git commands on the shop floor.

## 2. Rockwell Automation: VCS Custom Tools (a milestone moment)

Rockwell's release of VCS (Version Control System) Custom Tools is a strong signal that PLC logic is now treated as source code.

What VCS Custom Tools actually do:
- integrate Studio 5000 Logix Designer with Git-based repositories
- serialize PLC projects into diff-friendly artifacts
- enable change tracking, commit history, rollback, and multi-engineer workflows

Importantly:
- Git is not exposed directly to controls engineers
- Git acts as a backend system of record
- Rockwell controls how projects are decomposed and compared

This mirrors how IT tools abstract Git behind IDEs.

Why this is important:
Rockwell historically relied on:
- AssetCentre (audit + backup)
- proprietary project files
- lock-based workflows

VCS tools represent a philosophical shift:
PLC logic is no longer a monolithic binary; it is versioned content.

## 3. Siemens: openness first, Git second

Siemens took a different path.

Instead of adding Git inside TIA Portal, Siemens focused on:
- openness of engineering data
- external lifecycle tooling

Key Siemens elements:
- TIA Portal Openness: APIs for exporting project elements
- external scripts for serialization and comparison
- Siemens Automation Toolchain (SAT): CI/CD-like pipelines, integration with GitLab/Azure DevOps
- PLC code generation, structured text increasingly resembles traditional code

Philosophy:
Siemens assumes OT teams will integrate into existing IT DevOps ecosystems.
Version control is handled externally; engineering tools remain deterministic editors.

This aligns well with large EPC and multi-vendor environments.

## 4. Schneider Electric: EcoStruxure and lifecycle traceability

Schneider's approach focuses on lifecycle management rather than pure Git tooling.

Key components:
- EcoStruxure Control Expert project history
- integration with SVN/Git repositories and change management systems
- strong emphasis on safety lifecycle, auditability, and regulated industries

Schneider treats version control as governance infrastructure, not a developer convenience.

## 5. Beckhoff: PLC as software, unapologetically

Beckhoff is the most IT-native of major PLC vendors.

Why Beckhoff is different:
- TwinCAT runs on Windows with real-time extensions
- PLC projects are text-based, modular, and scriptable
- Git integration is direct and practical

Engineers commonly:
- store TwinCAT projects in Git
- diff structured text directly
- use branching strategies similar to software teams

Philosophy:
Beckhoff does not add IT principles to OT. It assumes them.

## 6. ABB and Emerson: controlled evolution

ABB and Emerson operate in highly regulated, safety-critical domains.

Their version control strategies emphasize:
- change authorization
- state control
- audit completeness

Git is typically used in engineering support layers, not exposed directly to control logic runtime workflows.

This is intentional. Their customers prioritize predictability over agility and governance over speed.

## 7. Comparative view: OT vendors and Git adoption

| Vendor | Git integration style | Philosophy |
| --- | --- | --- |
| Rockwell | Embedded VCS tools | Git abstracted, OT-friendly |
| Siemens | External DevOps integration | IT-driven lifecycle |
| Schneider | Governance-focused | Compliance first |
| Beckhoff | Native usage | PLC = software |
| ABB | Controlled lifecycle | Safety and audit |
| Emerson | Change management | Regulated OT |

## 8. What this means for OT engineers

The shift is irreversible.

Future OT workflows will include:
- repositories, not folders
- commits, not "final_final_v7"
- rollbacks, not emergency reuploads
- parallel development, not tool locking

But this does not turn OT engineers into software developers.

Instead:
It turns PLC logic into managed intellectual property.

## 9. Practical guidance for protocol labs and OT testbeds

When building protocol or PLC labs:
- store logic exports, not binaries
- use Git as single source of truth
- separate runtime testing from configuration versioning
- simulate bad commits, rollbacks, and merge conflicts

Labs that ignore version control no longer represent real industrial systems.

## 10. Closing: OT is not becoming IT — it is maturing

OT is not copying IT blindly. It is selectively adopting what works:
- determinism from OT
- traceability from IT
- governance from safety standards

Git is not the goal.
