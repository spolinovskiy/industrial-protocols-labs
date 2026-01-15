import type { BlogPost, Protocol, Tool } from "@shared/schema";

export interface IStorage {
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  getProtocols(): Promise<Protocol[]>;
  getProtocol(id: string): Promise<Protocol | undefined>;
  getTools(): Promise<Tool[]>;
  getTool(slug: string): Promise<Tool | undefined>;
}

const blogPosts: BlogPost[] = [
  {
    slug: "industrial-protocols-overview",
    title: "Industrial Protocols Overview",
    excerpt: "Understand how protocol philosophy shapes data models, communications, and security choices before you capture the first packet.",
    author: "IACS DevOps Team",
    date: "January 14, 2026",
    category: "Foundations",
    readTime: "18 min read",
    tags: ["Protocols", "Architecture", "OT/IT", "Security"],
    content: `
<h2>Understanding Protocol Philosophy Before You Touch the Wire</h2>
<p>Industrial protocols are often taught as collections of ports, frame formats, and supported devices. That approach is sufficient for basic integration, but it fails when systems must scale, interoperate across vendors, or withstand operational and security pressure.</p>
<p>This article takes a different approach. Instead of beginning with how to use industrial protocols, it begins with how they think. Every protocol encodes assumptions about data, communication, reliability, and security. Those assumptions shape architectures long before the first packet is captured. When they are misunderstood, integration problems follow. When they are understood, protocol selection becomes an engineering decision rather than guesswork.</p>

<h2>What "protocol philosophy" means</h2>
<p>At a practical level, every industrial protocol answers the same four questions, whether explicitly or implicitly.</p>
<ul>
  <li><strong>How is data represented?</strong> As raw memory locations, structured objects, or opaque messages?</li>
  <li><strong>How does communication occur?</strong> Through polling, cyclic exchange, event reporting, or brokered publish/subscribe?</li>
  <li><strong>What assumptions exist about time and reliability?</strong> Best-effort reads, deterministic updates, or guaranteed event delivery?</li>
  <li><strong>Where does security live?</strong> Outside the protocol, added later, or embedded in the architecture itself?</li>
</ul>
<p>Most integration failures occur when systems with incompatible answers to these questions are forced together.</p>

<h2>Four mental models of industrial protocols</h2>
<p>Viewed through this lens, the eight protocols discussed here fall naturally into four conceptual families.</p>

<h3>1. Memory-oriented protocols</h3>
<p><strong>Modbus, classic S7comm</strong></p>
<p>These protocols treat data as locations, not concepts. A register or memory offset has no intrinsic meaning; interpretation exists entirely outside the protocol. Communication is simple request/response. Their strength is durability and simplicity. Their weakness is semantic blindness. As systems grow, documentation replaces protocol structure, and complexity moves out of sight.</p>

<h3>2. Telecontrol and event-centric protocols</h3>
<p><strong>DNP3, IEC-60870-5-104</strong></p>
<p>These protocols assume unreliable links, large distances, and operational consequences. Data is modeled as points with state, quality, and time. Event reporting and acknowledgements are central, not optional. They were designed for critical infrastructure long before the term "IIoT" existed.</p>

<h3>3. Object-oriented industrial protocols</h3>
<p><strong>CIP (EtherNet/IP), OPC UA, BACnet</strong></p>
<p>These protocols model devices explicitly. Data has structure, type, and context. Objects expose attributes and services. Discovery and metadata are first-class concerns. This increases complexity, but it enables long-term interoperability and vendor independence.</p>

<h3>4. Messaging and transport protocols</h3>
<p><strong>MQTT</strong></p>
<p>MQTT deliberately avoids modeling the physical world. It moves messages efficiently and at scale. Semantics are external, defined by topic structure and payload conventions. This is not a limitation. It is the point.</p>

<h2>Philosophy-level comparison</h2>
<table>
  <thead>
    <tr>
      <th>Protocol</th>
      <th>Data model</th>
      <th>Communication</th>
      <th>Semantics</th>
      <th>Complexity</th>
      <th>Security posture</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Modbus</td>
      <td>Registers, coils</td>
      <td>Client polling</td>
      <td>None</td>
      <td>Low</td>
      <td>Originally none; TLS via Modbus Security</td>
    </tr>
    <tr>
      <td>DNP3</td>
      <td>Points + events</td>
      <td>Event-driven</td>
      <td>Limited</td>
      <td>Medium</td>
      <td>Secure Authentication profiles</td>
    </tr>
    <tr>
      <td>S7comm</td>
      <td>PLC memory areas</td>
      <td>Session reads/writes</td>
      <td>None</td>
      <td>Medium</td>
      <td>Historically weak; proprietary hardening</td>
    </tr>
    <tr>
      <td>IEC-104</td>
      <td>Information objects</td>
      <td>Telecontrol workflow</td>
      <td>Limited</td>
      <td>Medium</td>
      <td>IEC-62351 (TLS profiles)</td>
    </tr>
    <tr>
      <td>MQTT</td>
      <td>Messages on topics</td>
      <td>Brokered pub/sub</td>
      <td>External</td>
      <td>Low-Medium</td>
      <td>TLS + broker policy</td>
    </tr>
    <tr>
      <td>OPC UA</td>
      <td>Typed information model</td>
      <td>Services + subscriptions</td>
      <td>Strong</td>
      <td>High</td>
      <td>Built-in secure channels</td>
    </tr>
    <tr>
      <td>CIP</td>
      <td>Objects + cyclic I/O</td>
      <td>Implicit + explicit</td>
      <td>Strong</td>
      <td>High</td>
      <td>CIP Security (TLS/DTLS)</td>
    </tr>
    <tr>
      <td>BACnet</td>
      <td>Building objects</td>
      <td>Service-oriented</td>
      <td>Strong</td>
      <td>High</td>
      <td>BACnet/SC with TLS 1.3</td>
    </tr>
  </tbody>
</table>
<p>This comparison is not about superiority. It is about architectural fitness.</p>

<h2>How each protocol "thinks"</h2>

<h3>Modbus - "Read this address"</h3>
<p>Modbus models the world as shared memory. A value is a value, nothing more. This makes it easy to implement and trivial to test, but incapable of self-description or native eventing. Security can be added at the transport layer, but the data model remains flat.</p>
<p><strong>Architectural takeaway:</strong> Use Modbus where simplicity and ubiquity outweigh semantic richness.</p>

<h3>DNP3 - "Tell me what changed, and when"</h3>
<p>DNP3 assumes that polling everything is wasteful and fragile. It prioritizes time-stamped events, acknowledgements, and operational discipline. Security extensions fit naturally because command authenticity already mattered.</p>
<p><strong>Architectural takeaway:</strong> DNP3 embeds operational intent directly into protocol behavior.</p>

<h3>S7comm - "Access the PLC internals"</h3>
<p>S7comm is optimized for Siemens tooling, not interoperability. It assumes trusted environments and direct memory access. Security improvements have come later, but they reinforce its closed, privileged nature.</p>
<p><strong>Architectural takeaway:</strong> Treat S7comm as internal plumbing, not an architectural boundary.</p>

<h3>IEC-104 - "Operate the grid safely"</h3>
<p>IEC-104 encodes power-system operations as protocol rules: monitoring, commands, confirmations, sequencing. It formalizes control-room workflow on the wire. Security profiles extend this model without changing its intent.</p>
<p><strong>Architectural takeaway:</strong> IEC-104 is operational process, not generic data exchange.</p>

<h3>MQTT - "Move messages, not meaning"</h3>
<p>MQTT minimizes assumptions. It scales by decoupling producers and consumers. Meaning is imposed by convention, not enforced by protocol rules. Security is delegated to brokers and transport.</p>
<p><strong>Architectural takeaway:</strong> MQTT excels as a distribution layer, not a device model.</p>

<h3>OPC UA - "Make meaning explicit"</h3>
<p>OPC UA assumes interoperability requires shared understanding. Its information model captures structure, relationships, and access rules. Security is integral, not optional. Complexity is the price of clarity.</p>
<p><strong>Architectural takeaway:</strong> OPC UA belongs at system boundaries where meaning must survive change.</p>

<h3>CIP (EtherNet/IP) - "Objects plus real-time behavior"</h3>
<p>CIP unifies object modeling with cyclic real-time exchange. Time-critical I/O and configuration services coexist within one framework. Security enhancements preserve control behavior.</p>
<p><strong>Architectural takeaway:</strong> CIP is a control system architecture, not just a protocol.</p>

<h3>BACnet - "Buildings as structured systems"</h3>
<p>BACnet standardizes building concepts as shared objects. This enables multi-vendor integration at the application level. BACnet/SC modernizes the architecture with TLS-based security.</p>
<p><strong>Architectural takeaway:</strong> BACnet's strength is semantic alignment across building systems.</p>

<h2>A security reality check</h2>
<p>TLS alone does not make systems secure. Effective security depends on identity, certificate lifecycle, roles, segmentation, and operations. Protocols differ mainly in how much of this they standardize versus how much they leave to architecture.</p>

<h2>Why this matters for protocol labs</h2>
<p>Protocol labs should not stop at packet dissection. They should test assumptions:</p>
<ul>
  <li>Polling versus events</li>
  <li>Cyclic versus on-demand</li>
  <li>Flat memory versus semantic models</li>
  <li>Security outside versus inside the protocol</li>
</ul>
<p>A good lab answers one question: What architectural behavior does this protocol encourage?</p>

<h2>Closing perspective</h2>
<p>Industrial protocols do not compete in isolation. They coexist in layers. Understanding protocol philosophy allows engineers to place each protocol where it fits naturally, avoid forcing one protocol to imitate another, and design systems that scale technically and organizationally. That understanding is the foundation of any serious industrial protocol lab and any sustainable OT architecture.</p>
    `,
  },
  {
    slug: "version-control-plant-floor",
    title: "Version Control Comes to the Plant Floor",
    excerpt: "How OT is adopting Git principles for PLC logic, configuration, and change management across major automation vendors.",
    author: "IACS DevOps Team",
    date: "January 14, 2026",
    category: "DevOps",
    readTime: "16 min read",
    tags: ["Version Control", "PLC", "DevOps", "Change Management"],
    content: `
<h2>How OT Is Adopting Git Principles for PLC Logic, Configuration, and Change Management</h2>
<p>For decades, version control in industrial automation meant one thing: "Who has the latest backup?" Projects were tracked through file names, USB drives, and email attachments. Rollbacks depended on tribal knowledge. Merges were avoided entirely. Audit trails were manual at best.</p>
<p>That model no longer survives modern OT reality. As industrial systems become software-heavy, continuously updated, cyber-regulated, and increasingly integrated with IT systems, OT is being forced to adopt IT-grade version control discipline.</p>

<h2>1. Why Git principles matter in OT (not Git itself)</h2>
<p>Before naming tools, it is critical to separate principles from implementations. OT does not need engineers typing <code>git rebase</code> on PLCs. OT does need:</p>
<ul>
  <li>Deterministic history of logic changes</li>
  <li>Diff visibility at logic and configuration level</li>
  <li>Safe rollback to known-good states</li>
  <li>Branch-like workflows for FAT/SAT/hotfixes</li>
  <li>Traceability for compliance (IEC 62443, FDA, ISO)</li>
</ul>
<p>In other words: OT needs outcomes of Git, not Git commands on the shop floor.</p>

<h2>2. Rockwell Automation: VCS Custom Tools (a milestone moment)</h2>
<p>Rockwell's release of VCS (Version Control System) Custom Tools is a strong signal that PLC logic is now treated as source code.</p>
<h3>What VCS Custom Tools actually do</h3>
<ul>
  <li>Integrate Studio 5000 Logix Designer with Git-based repositories</li>
  <li>Serialize PLC projects into diff-friendly artifacts</li>
  <li>Enable change tracking, commit history, rollback, and multi-engineer workflows</li>
</ul>
<p>Git is not exposed directly to controls engineers. It acts as a backend system of record, and Rockwell controls how projects are decomposed and compared. This mirrors how IT tools abstract Git behind IDEs.</p>
<p><strong>Why this is important:</strong> Rockwell historically relied on AssetCentre, proprietary project files, and lock-based workflows. VCS tools represent a philosophical shift: PLC logic is no longer a monolithic binary; it is versioned content.</p>

<h2>3. Siemens: openness first, Git second</h2>
<p>Siemens took a different path. Instead of adding Git inside TIA Portal, Siemens focused on openness of engineering data and external lifecycle tooling.</p>
<h3>Key Siemens elements</h3>
<ul>
  <li><strong>TIA Portal Openness</strong>: APIs for exporting project elements and external scripts for serialization and comparison</li>
  <li><strong>Siemens Automation Toolchain (SAT)</strong>: CI/CD-like pipelines, integration with GitLab/Azure DevOps, PLC code generation</li>
  <li>Structured text increasingly resembles traditional code</li>
</ul>
<p><strong>Philosophy:</strong> Siemens assumes OT teams will integrate into existing IT DevOps ecosystems. Version control is handled externally while engineering tools remain deterministic editors.</p>

<h2>4. Schneider Electric: EcoStruxure and lifecycle traceability</h2>
<p>Schneider's approach focuses on lifecycle management rather than pure Git tooling. Key components include EcoStruxure Control Expert project history, integrations with SVN/Git repositories, and strong emphasis on safety lifecycle and auditability. Schneider treats version control as governance infrastructure, not a developer convenience.</p>

<h2>5. Beckhoff: PLC as software, unapologetically</h2>
<p>Beckhoff is the most IT-native of major PLC vendors. TwinCAT runs on Windows with real-time extensions, PLC projects are text-based, modular, and scriptable, and Git integration is direct and practical. Engineers commonly store TwinCAT projects in Git and use branching strategies similar to software teams.</p>
<p><strong>Philosophy:</strong> Beckhoff does not add IT principles to OT. It assumes them.</p>

<h2>6. ABB and Emerson: controlled evolution</h2>
<p>ABB and Emerson operate in highly regulated, safety-critical domains. Their version control strategies emphasize change authorization, state control, and audit completeness. Git is typically used in engineering support layers, not exposed directly to control logic runtime workflows. This is intentional; customers prioritize predictability over agility and governance over speed.</p>

<h2>7. Comparative view: OT vendors and Git adoption</h2>
<table>
  <thead>
    <tr>
      <th>Vendor</th>
      <th>Git integration style</th>
      <th>Philosophy</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Rockwell</td>
      <td>Embedded VCS tools</td>
      <td>Git abstracted, OT-friendly</td>
    </tr>
    <tr>
      <td>Siemens</td>
      <td>External DevOps integration</td>
      <td>IT-driven lifecycle</td>
    </tr>
    <tr>
      <td>Schneider</td>
      <td>Governance-focused</td>
      <td>Compliance first</td>
    </tr>
    <tr>
      <td>Beckhoff</td>
      <td>Native usage</td>
      <td>PLC = software</td>
    </tr>
    <tr>
      <td>ABB</td>
      <td>Controlled lifecycle</td>
      <td>Safety and audit</td>
    </tr>
    <tr>
      <td>Emerson</td>
      <td>Change management</td>
      <td>Regulated OT</td>
    </tr>
  </tbody>
</table>

<h2>8. What this means for OT engineers</h2>
<p>The shift is irreversible. Future OT workflows will include repositories, not folders; commits, not "final_final_v7"; rollbacks, not emergency reuploads; and parallel development, not tool locking. But this does not turn OT engineers into software developers. It turns PLC logic into managed intellectual property.</p>

<h2>9. Practical guidance for protocol labs and OT testbeds</h2>
<ul>
  <li>Store logic exports, not binaries</li>
  <li>Use Git as single source of truth</li>
  <li>Separate runtime testing from configuration versioning</li>
  <li>Simulate bad commits, rollbacks, and merge conflicts</li>
</ul>
<p>Labs that ignore version control no longer represent real industrial systems.</p>

<h2>10. Closing: OT is not becoming IT - it is maturing</h2>
<p>OT is not copying IT blindly. It is selectively adopting what works: determinism from OT, traceability from IT, governance from safety standards. Git is not the goal.</p>
    `,
  },
  {
    slug: "getting-started-with-docker-for-ot",
    title: "Getting Started with Docker for OT Environments",
    excerpt: "Learn how to use Docker containers to create isolated testing environments for industrial automation protocols without affecting production systems.",
    author: "IACS DevOps Team",
    date: "December 14, 2025",
    category: "Docker",
    readTime: "8 min read",
    tags: ["Docker", "Containers", "OT", "Testing"],
    content: `
<h2>Introduction</h2>
<p>Docker has revolutionized how we develop and test software, and its benefits extend perfectly to operational technology (OT) environments. By using containers, you can create isolated testing environments for industrial protocols without risking production systems.</p>

<h2>Why Docker for Industrial Automation?</h2>
<p>Industrial automation engineers face unique challenges when testing protocol implementations:</p>
<ul>
<li>Production systems can't be taken offline for testing</li>
<li>Setting up physical test environments is expensive</li>
<li>Protocol simulators need consistent, reproducible environments</li>
<li>Team members need identical development setups</li>
</ul>

<h2>Setting Up Your First Container</h2>
<p>Let's start with a simple Modbus simulator container:</p>
<pre><code class="language-bash"># Pull and run a Modbus simulator
docker run -d -p 502:502 --name modbus-sim oitc/modbus-server

# Verify it's running
docker ps

# Connect to logs
docker logs -f modbus-sim</code></pre>

<h2>Creating a Docker Compose Stack</h2>
<p>For more complex setups, use Docker Compose to manage multiple services:</p>
<pre><code class="language-yaml">version: '3.8'
services:
  modbus-server:
    image: oitc/modbus-server
    ports:
      - "502:502"
  
  mqtt-broker:
    image: eclipse-mosquitto:latest
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf

  opcua-server:
    image: open62541/open62541
    ports:
      - "4840:4840"</code></pre>

<h2>Best Practices</h2>
<ol>
<li><strong>Use specific image tags</strong> - Never use <code>:latest</code> in production testing</li>
<li><strong>Document your setup</strong> - Include README with container requirements</li>
<li><strong>Persist data carefully</strong> - Use volumes for configuration files</li>
<li><strong>Network isolation</strong> - Create dedicated Docker networks for protocol testing</li>
</ol>

<h2>Next Steps</h2>
<p>Now that you have a basic Docker environment, explore our protocol labs to start testing Modbus, MQTT, and OPC UA communications in your containerized setup.</p>
    `,
  },
  {
    slug: "wireshark-for-industrial-protocols",
    title: "Analyzing Industrial Protocols with Wireshark",
    excerpt: "Master Wireshark filters and dissectors for capturing and analyzing Modbus TCP, EtherNet/IP, and other industrial protocol traffic.",
    author: "IACS DevOps Team",
    date: "December 08, 2025",
    category: "Wireshark",
    readTime: "12 min read",
    tags: ["Wireshark", "Network Analysis", "Modbus", "EtherNet/IP"],
    content: `
<h2>Introduction</h2>
<p>Wireshark is an essential tool for troubleshooting industrial network communications. This guide covers the key techniques for analyzing Modbus TCP, EtherNet/IP (CIP), and other industrial protocols.</p>

<h2>Setting Up Capture Filters</h2>
<p>Before you start capturing, set appropriate filters to reduce noise:</p>
<pre><code class="language-text"># Capture only Modbus TCP traffic
port 502

# Capture EtherNet/IP traffic
port 44818 or port 2222

# Capture OPC UA traffic
port 4840</code></pre>

<h2>Modbus TCP Analysis</h2>
<p>Wireshark includes a built-in Modbus dissector. Key display filters:</p>
<pre><code class="language-text"># All Modbus traffic
modbus

# Read Holding Registers (function code 3)
modbus.func_code == 3

# Write Single Register (function code 6)
modbus.func_code == 6

# Exception responses
modbus.exception_code</code></pre>

<h3>Common Modbus Issues to Look For</h3>
<ul>
<li><strong>Timeout patterns</strong> - No response packets within expected time</li>
<li><strong>Exception codes</strong> - Device returning error responses</li>
<li><strong>Transaction ID mismatches</strong> - Potential communication issues</li>
</ul>

<h2>EtherNet/IP (CIP) Analysis</h2>
<p>For CIP protocol analysis:</p>
<pre><code class="language-text"># All CIP traffic
cip

# Specific CIP service codes
cip.service == 0x4c  # Read Tag Service
cip.service == 0x4d  # Write Tag Service

# CIP error responses
cip.status != 0</code></pre>

<h2>Creating Custom Columns</h2>
<p>Add useful columns for industrial protocol analysis:</p>
<ol>
<li>Right-click column header and Column Preferences</li>
<li>Add custom columns for function codes, register addresses, or tag names</li>
<li>Save as a profile for quick access</li>
</ol>

<h2>Tips for Effective Analysis</h2>
<ul>
<li>Use time reference to measure response times</li>
<li>Color-code different function codes for quick identification</li>
<li>Export specific conversations for detailed offline analysis</li>
<li>Compare captures before/after configuration changes</li>
</ul>
    `,
  },
  {
    slug: "termshark-industrial-protocol-analysis",
    title: "Analyzing Industrial Protocols with Termshark",
    excerpt: "Use termshark for terminal-based packet analysis of Modbus, OPC UA, DNP3, and other industrial protocols in headless environments.",
    author: "Stanislav Polinovskiy",
    date: "January 10, 2026",
    category: "Packet Analysis",
    readTime: "15 min read",
    tags: ["Termshark", "Packet Analysis", "CLI", "Industrial Protocols", "Docker"],
    content: `
<h2>Why Termshark for Industrial Protocol Analysis?</h2>
<p>Termshark brings Wireshark's powerful packet analysis capabilities to the terminal. This is essential when working with industrial systems where:</p>
<ul>
<li>Servers run headless without GUI access</li>
<li>You're analyzing traffic in Docker containers</li>
<li>Remote SSH sessions are your primary interface</li>
<li>Resources are constrained on embedded systems</li>
</ul>

<h2>Getting Started with Termshark</h2>
<p>In our lab environment, termshark is pre-installed in the diagnostics container:</p>
<pre><code class="language-bash"># Connect to the diagnostics container
docker exec -it diagnostics bash

# Start termshark on the protocol network interface
termshark -i eth0

# Or capture specific protocol traffic
termshark -i eth0 -f "port 502"  # Modbus
termshark -i eth0 -f "port 4840" # OPC UA
termshark -i eth0 -f "port 20000" # DNP3</code></pre>

<h2>Protocol-Specific Filters</h2>
<h3>Modbus TCP (Port 502)</h3>
<pre><code class="language-text"># Capture filter
port 502

# Display filters in termshark
modbus                          # All Modbus traffic
modbus.func_code == 3          # Read Holding Registers
modbus.func_code == 6          # Write Single Register
modbus.func_code == 16         # Write Multiple Registers
modbus.exception_code          # Error responses</code></pre>

<h3>OPC UA (Port 4840)</h3>
<pre><code class="language-text"># Capture filter
port 4840

# Display filters
opcua                           # All OPC UA traffic
opcua.servicenodeid == 631     # Read requests
opcua.servicenodeid == 673     # Write requests
opcua.statuscode != 0          # Error responses</code></pre>

<h3>DNP3 (Port 20000)</h3>
<pre><code class="language-text"># Capture filter
port 20000

# Display filters
dnp3                            # All DNP3 traffic
dnp3.al.func == 0x01           # Read request
dnp3.al.func == 0x81           # Response
dnp3.al.iin.class1             # Class 1 events pending</code></pre>

<h3>IEC 60870-5-104 (Port 2404)</h3>
<pre><code class="language-text"># Capture filter
port 2404

# Display filters
iec60870_104                    # All IEC-104 traffic
iec60870_104.type == 0x64      # Interrogation command
iec60870_104.cause == 0x06     # Activation cause</code></pre>

<h2>Lab Workflow: Protocol Analysis</h2>
<p>The recommended workflow for analyzing industrial protocols in our lab:</p>
<ol>
<li><strong>Open FUXA SCADA</strong> - Access the HMI for the selected protocol</li>
<li><strong>Toggle DO/AO</strong> - Use FUXA to write digital and analog outputs</li>
<li><strong>Read AI values</strong> - Observe analog input readings</li>
<li><strong>Open Diagnostics</strong> - Switch to the diagnostics container</li>
<li><strong>Start termshark</strong> - Capture and analyze the protocol traffic</li>
</ol>

<h2>Practical Example: Modbus Analysis</h2>
<pre><code class="language-bash"># Start capture with Modbus filter
termshark -i eth0 -f "port 502"

# In FUXA, toggle a coil (DO)
# Watch termshark for:
# - Function code 0x05 (Write Single Coil)
# - Address being written
# - Response confirmation

# In FUXA, write to a holding register (AO)
# Watch termshark for:
# - Function code 0x06 (Write Single Register)
# - Register address and value
# - Response echoing the written value</code></pre>

<h2>Saving and Exporting Captures</h2>
<pre><code class="language-bash"># Save capture to pcap file
termshark -i eth0 -w /tmp/modbus_capture.pcap -f "port 502"

# Read saved capture
termshark -r /tmp/modbus_capture.pcap

# Export specific packets (use tshark)
tshark -r /tmp/modbus_capture.pcap -Y "modbus.func_code == 3" -w /tmp/read_only.pcap</code></pre>

<h2>Keyboard Shortcuts</h2>
<table>
<thead>
<tr><th>Key</th><th>Action</th></tr>
</thead>
<tbody>
<tr><td>Tab</td><td>Switch between panes</td></tr>
<tr><td>/</td><td>Set display filter</td></tr>
<tr><td>Enter</td><td>Apply filter</td></tr>
<tr><td>Esc</td><td>Clear filter</td></tr>
<tr><td>q</td><td>Quit termshark</td></tr>
<tr><td>?</td><td>Help</td></tr>
</tbody>
</table>

<h2>Troubleshooting Common Issues</h2>
<ul>
<li><strong>No packets captured</strong> - Check interface name with <code>ip link</code></li>
<li><strong>Permission denied</strong> - Run with sudo or add user to wireshark group</li>
<li><strong>Protocol not decoded</strong> - Check port number matches protocol default</li>
<li><strong>High packet loss</strong> - Reduce capture buffer or use more specific filter</li>
</ul>
    `,
  },
  {
    slug: "python-scripting-for-plc-communication",
    title: "Python Scripting for PLC Communication",
    excerpt: "An introduction to using Python for automating PLC data collection, monitoring, and control across multiple industrial protocols.",
    author: "IACS DevOps Team",
    date: "December 5, 2024",
    category: "Python",
    readTime: "10 min read",
    tags: ["Python", "PLC", "Automation", "Scripting"],
    content: `
<h2>Why Python for Industrial Automation?</h2>
<p>Python has become the go-to language for industrial automation scripting due to its:</p>
<ul>
<li>Rich ecosystem of protocol libraries</li>
<li>Simple, readable syntax ideal for maintenance engineers</li>
<li>Excellent data analysis and visualization capabilities</li>
<li>Cross-platform compatibility</li>
</ul>

<h2>Essential Libraries</h2>
<p>Here are the key Python libraries for PLC communication:</p>
<pre><code class="language-bash"># Install essential libraries
pip install pymodbus      # Modbus TCP/RTU
pip install pycomm3       # Allen-Bradley CIP
pip install opcua         # OPC UA
pip install python-snap7  # Siemens S7</code></pre>

<h2>Basic Modbus Example</h2>
<pre><code class="language-python">from pymodbus.client import ModbusTcpClient

# Connect to Modbus device
client = ModbusTcpClient('192.168.1.100', port=502)
client.connect()

# Read 10 holding registers starting at address 0
result = client.read_holding_registers(0, 10, slave=1)

if not result.isError():
    print(f"Register values: {result.registers}")
else:
    print(f"Error: {result}")

client.close()</code></pre>

<h2>Allen-Bradley Example</h2>
<pre><code class="language-python">from pycomm3 import LogixDriver

# Connect to CompactLogix/ControlLogix
with LogixDriver('192.168.1.50') as plc:
    # Read a tag
    result = plc.read('Program:MainProgram.MyTag')
    print(f"Tag value: {result.value}")
    
    # Write a tag
    plc.write('Program:MainProgram.MyTag', 100)</code></pre>

<h2>Data Collection Script Pattern</h2>
<p>A common pattern for continuous data collection:</p>
<pre><code class="language-python">import time
import csv
from datetime import datetime
from pymodbus.client import ModbusTcpClient

def collect_data(client, registers, interval=1.0):
    with open('plc_data.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp'] + [f'reg_{i}' for i in range(len(registers))])
        
        while True:
            result = client.read_holding_registers(0, len(registers), slave=1)
            if not result.isError():
                row = [datetime.now().isoformat()] + result.registers
                writer.writerow(row)
                f.flush()
            time.sleep(interval)

# Usage
client = ModbusTcpClient('192.168.1.100')
client.connect()
collect_data(client, range(10), interval=5.0)</code></pre>

<h2>Best Practices</h2>
<ol>
<li><strong>Use context managers</strong> - Ensure connections are properly closed</li>
<li><strong>Handle exceptions</strong> - Industrial networks can be unreliable</li>
<li><strong>Rate limit requests</strong> - Don't overwhelm PLCs with rapid polling</li>
<li><strong>Log everything</strong> - Debugging industrial issues requires good logs</li>
</ol>
    `,
  },
  {
    slug: "ot-it-convergence-basics",
    title: "OT/IT Convergence: A Practical Guide",
    excerpt: "Understanding the intersection of operational technology and information technology, and best practices for bridging these worlds safely.",
    author: "IACS DevOps Team",
    date: "November 28, 2024",
    category: "OT/IT",
    readTime: "15 min read",
    tags: ["OT", "IT", "Convergence", "Security", "Best Practices"],
    content: `
<h2>Understanding OT vs IT</h2>
<p>Before diving into convergence, let's clarify the fundamental differences:</p>

<table>
<thead>
<tr><th>Aspect</th><th>IT Systems</th><th>OT Systems</th></tr>
</thead>
<tbody>
<tr><td>Primary Goal</td><td>Data processing and storage</td><td>Physical process control</td></tr>
<tr><td>Update Frequency</td><td>Regular patches, weekly/monthly</td><td>Rare, scheduled downtime</td></tr>
<tr><td>Availability Needs</td><td>99.9% (allows maintenance)</td><td>99.999% (continuous operation)</td></tr>
<tr><td>Lifespan</td><td>3-5 years</td><td>15-25 years</td></tr>
<tr><td>Security Priority</td><td>Confidentiality first</td><td>Availability first</td></tr>
</tbody>
</table>

<h2>The Purdue Model</h2>
<p>The Purdue Enterprise Reference Architecture provides a framework for OT/IT integration:</p>
<ul>
<li><strong>Level 5</strong> - Enterprise Network (IT)</li>
<li><strong>Level 4</strong> - Business Planning and Logistics</li>
<li><strong>Level 3.5</strong> - DMZ (Critical transition zone)</li>
<li><strong>Level 3</strong> - Site Operations</li>
<li><strong>Level 2</strong> - Area Supervisory Control</li>
<li><strong>Level 1</strong> - Basic Control</li>
<li><strong>Level 0</strong> - Physical Process</li>
</ul>

<h2>Key Convergence Challenges</h2>
<h3>1. Protocol Differences</h3>
<p>IT systems use TCP/IP based protocols while OT often uses specialized protocols like Modbus, PROFINET, or DeviceNet.</p>

<h3>2. Security Mindset</h3>
<p>IT focuses on confidentiality; OT prioritizes availability. A security incident that shuts down a process can be more costly than a data breach.</p>

<h3>3. Change Management</h3>
<p>IT can patch systems regularly; OT changes require extensive testing and scheduled downtime.</p>

<h2>Best Practices for Convergence</h2>
<ol>
<li><strong>Network Segmentation</strong> - Use firewalls and VLANs to separate OT and IT networks</li>
<li><strong>Data Diodes</strong> - For critical systems, use unidirectional gateways</li>
<li><strong>Historian Systems</strong> - Aggregate OT data in a secure DMZ for IT access</li>
<li><strong>Unified Monitoring</strong> - Implement SIEM solutions that understand both domains</li>
<li><strong>Cross-functional Teams</strong> - Build teams with both OT and IT expertise</li>
</ol>

<h2>Practical Implementation Steps</h2>
<ol>
<li>Conduct a thorough asset inventory of both OT and IT systems</li>
<li>Map data flows between operational and business systems</li>
<li>Identify and document all connection points</li>
<li>Implement monitoring before making changes</li>
<li>Test changes in isolated environments first</li>
</ol>
    `,
  },
  {
    slug: "modbus-tcp-overview",
    title: "Modbus TCP Protocol Overview",
    excerpt: "Modbus protocol structure, function codes, and common implementation patterns for industrial automation.",
    author: "Stanislav Polinovskiy",
    date: "November 15, 2025",
    category: "Protocols",
    readTime: "10 min read",
    tags: ["Modbus", "TCP", "Protocols", "Industrial"],
    content: `
<h2>Modbus: The "Postal Service" of Industrial Automation</h2>
<p>If industrial communication protocols were cities, Modbus would be an old but incredibly reliable industrial town. It may not have skyscrapers or shiny smart buildings, but nearly every factory road still leads through it. Despite being over 45 years old for RTU and 27 years old for TCP/IP, Modbus remains one of the most widely used protocols in industrial automation.</p>

<h2>A Short History: Born in the PLC Era</h2>
<p>Modbus was introduced in 1979 by Modicon, a pioneer in programmable logic controllers (PLCs). At that time:</p>
<ul>
<li>PLCs were replacing relay logic</li>
<li>Vendors needed a simple way to read and write data</li>
<li>Networks were slow, serial, and expensive</li>
</ul>
<p>Modbus was designed with one goal in mind: Make devices talk to each other with minimal complexity. No discovery mechanisms, no encryption, no abstractions. Just registers, addresses, and values.</p>

<h2>Core Data Model</h2>
<p>Modbus organizes data into four types:</p>
<ul>
<li><strong>Coils</strong> (0xxxx) - Single bit, read/write - Digital outputs</li>
<li><strong>Discrete Inputs</strong> (1xxxx) - Single bit, read-only - Digital inputs</li>
<li><strong>Input Registers</strong> (3xxxx) - 16-bit, read-only - Analog inputs</li>
<li><strong>Holding Registers</strong> (4xxxx) - 16-bit, read/write - Configuration, setpoints</li>
</ul>

<h2>Common Function Codes</h2>
<pre><code class="language-text">FC 01: Read Coils
FC 02: Read Discrete Inputs  
FC 03: Read Holding Registers
FC 04: Read Input Registers
FC 05: Write Single Coil
FC 06: Write Single Register
FC 15: Write Multiple Coils
FC 16: Write Multiple Registers</code></pre>

<h2>Modbus TCP Frame Structure</h2>
<pre><code class="language-text">00 00 00 00 00 06 01 03 00 00 00 1E
AA AA BB BB CC CC DD EE FF FF GG GG

A = 16-bit Transaction Identifier
B = 16-bit Protocol Identifier (typically zero)
C = 16-bit Length of data payload
D = 8-bit Unit / Slave ID
E = 8-bit Modbus Function Code
F = 16-bit Reference Number / Register Base Address
G = 16-bit Word Count / Number of Registers</code></pre>

<h2>Exception Responses</h2>
<p>When errors occur, devices return exception codes:</p>
<ul>
<li><strong>01</strong> - Illegal Function</li>
<li><strong>02</strong> - Illegal Data Address</li>
<li><strong>03</strong> - Illegal Data Value</li>
<li><strong>04</strong> - Slave Device Failure</li>
<li><strong>05</strong> - Acknowledge (processing in progress)</li>
<li><strong>06</strong> - Slave Device Busy</li>
</ul>

<h2>Implementation Tips</h2>
<ol>
<li>Always validate register addresses before reading/writing</li>
<li>Implement appropriate timeouts (typically 1-5 seconds)</li>
<li>Handle disconnections gracefully with automatic reconnection</li>
<li>Rate-limit requests to avoid overwhelming slow devices</li>
<li>Use transaction IDs to match requests with responses</li>
</ol>
    `,
  },
];

const protocols: Protocol[] = [
  {
    id: "modbus",
    name: "Modbus TCP",
    shortDescription: "The industry standard for serial and TCP/IP communication with PLCs, sensors, and I/O devices.",
    overview: `Modbus is the "lingua franca" of industrial automation - a simple, robust protocol that has connected devices for over 45 years. Originally developed by Modicon in 1979, it remains one of the most widely deployed protocols due to its simplicity and reliability.

The protocol uses a master-slave architecture where the master (HMI, SCADA) polls slave devices (PLCs, sensors, I/O modules) for data. Modbus TCP wraps the original serial protocol in TCP/IP, enabling communication over standard Ethernet networks.

Key characteristics: Simple request-response model, no device discovery, no built-in security, supports up to 247 devices per network segment.`,
    transportLayer: {
      type: "TCP/IP",
      port: 502,
      description: "Modbus TCP uses port 502 over standard TCP/IP. Messages include a 7-byte MBAP header (Transaction ID, Protocol ID, Length, Unit ID) followed by the PDU (Function Code + Data). Typical response times: 10-100ms.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/modbus",
      serverPort: 502,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for Modbus",
      "Toggle Digital Outputs (Coils) using FC05/FC15",
      "Write Analog Outputs (Holding Registers) using FC06/FC16",
      "Read Analog Inputs (Input Registers) using FC04",
      "Open diagnostics container",
      "Run termshark with filter: port 502",
      "Analyze Modbus function codes and register values in packets",
    ],
    relatedBlogs: ["modbus-tcp-overview", "wireshark-for-industrial-protocols", "termshark-industrial-protocol-analysis", "python-scripting-for-plc-communication"],
    libraryDocs: [
      { name: "pymodbus", url: "https://pymodbus.readthedocs.io/", language: "Python" },
      { name: "libmodbus", url: "https://libmodbus.org/documentation/", language: "C" },
      { name: "modbus-serial", url: "https://github.com/yaacov/node-modbus-serial", language: "Node.js" },
    ],
    icon: "network",
    guestAccess: true,
  },
  {
    id: "opcua",
    name: "OPC UA",
    shortDescription: "Platform-independent, service-oriented architecture for secure industrial interoperability.",
    overview: `OPC UA (Unified Architecture) is the modern standard for industrial data exchange, designed to replace the Windows-only COM/DCOM-based OPC Classic. Released in 2008, it provides a secure, platform-independent framework for device-to-cloud communication.

Unlike simple polling protocols, OPC UA uses an information model with typed nodes, methods, and events. It supports publish-subscribe patterns, complex data structures, and built-in security (authentication, encryption, signing).

Key characteristics: Platform-independent, built-in security, rich information modeling, supports complex data types, scalable from sensors to enterprise systems.`,
    transportLayer: {
      type: "TCP/IP (Binary) or HTTPS",
      port: 4840,
      description: "OPC UA Binary uses port 4840 over TCP. Supports secure channels with X.509 certificates. Also available over HTTPS (JSON/XML) for web integration. Session-based with configurable timeouts and keep-alive.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/opcua",
      serverPort: 4840,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for OPC UA",
      "Browse the server's address space (nodes)",
      "Write to writable nodes (variables)",
      "Read node values and observe updates",
      "Open diagnostics container",
      "Run termshark with filter: port 4840",
      "Analyze OPC UA service requests and responses",
    ],
    relatedBlogs: ["wireshark-for-industrial-protocols", "termshark-industrial-protocol-analysis", "ot-it-convergence-basics"],
    libraryDocs: [
      { name: "opcua-asyncio", url: "https://github.com/FreeOpcUa/opcua-asyncio", language: "Python" },
      { name: "open62541", url: "https://open62541.org/doc/current/", language: "C" },
      { name: "node-opcua", url: "https://node-opcua.github.io/", language: "Node.js" },
    ],
    icon: "server",
    guestAccess: false,
  },
  {
    id: "cip",
    name: "CIP/EtherNet-IP",
    shortDescription: "Common Industrial Protocol used by Allen-Bradley PLCs for industrial Ethernet communications.",
    overview: `CIP (Common Industrial Protocol) is the application layer protocol used by Rockwell Automation's Allen-Bradley product line. EtherNet/IP encapsulates CIP over standard Ethernet, making it one of the most widely deployed protocols in North American manufacturing.

CIP uses an object-oriented model where devices contain objects (Identity, Connection Manager, Assembly, etc.) that can be accessed via services. It supports both explicit messaging (request-response) and implicit messaging (I/O connections with real-time data exchange).

Key characteristics: Object-oriented architecture, supports real-time I/O, native integration with Allen-Bradley PLCs, producer-consumer model for efficient data distribution.`,
    transportLayer: {
      type: "TCP/IP and UDP",
      port: 44818,
      description: "EtherNet/IP uses TCP port 44818 for explicit messaging and UDP port 2222 for implicit (real-time) I/O. Encapsulation header identifies CIP commands. Supports connected and unconnected messaging modes.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/cip",
      serverPort: 44818,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for CIP/EtherNet-IP",
      "Read tag values from the simulated PLC",
      "Write to output tags",
      "Monitor I/O assembly data",
      "Open diagnostics container",
      "Run termshark with filter: port 44818 or port 2222",
      "Analyze CIP service codes and tag operations",
    ],
    relatedBlogs: ["wireshark-for-industrial-protocols", "termshark-industrial-protocol-analysis", "python-scripting-for-plc-communication"],
    libraryDocs: [
      { name: "pycomm3", url: "https://docs.pycomm3.dev/", language: "Python" },
      { name: "libplctag", url: "https://github.com/libplctag/libplctag", language: "C" },
      { name: "ethernet-ip", url: "https://github.com/cmseaton42/node-ethernet-ip", language: "Node.js" },
    ],
    icon: "cpu",
    guestAccess: false,
  },
  {
    id: "dnp3",
    name: "DNP3",
    shortDescription: "Distributed Network Protocol for utilities and SCADA systems in power and water industries.",
    overview: `DNP3 (Distributed Network Protocol) was developed in the 1990s for the electric utility industry but is now used across water, wastewater, oil/gas, and transportation sectors. It's designed for reliable communication over challenging network conditions.

DNP3 excels at event-driven reporting, time-stamped data, and unsolicited responses - critical for SCADA systems where knowing exactly when an event occurred matters. It includes data integrity checks, error recovery, and support for low-bandwidth links.

Key characteristics: Event-driven with timestamps, built-in data integrity, designed for unreliable networks, supports unsolicited responses, widely used in utilities.`,
    transportLayer: {
      type: "TCP/IP or Serial",
      port: 20000,
      description: "DNP3 over TCP typically uses port 20000. Includes transport layer segmentation for large messages. Supports keep-alive and link-layer error checking. Can operate over serial (RS-232/RS-485) for legacy systems.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/dnp3",
      serverPort: 20000,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for DNP3",
      "Perform integrity poll (Class 0 data)",
      "Write to binary/analog outputs",
      "Trigger event generation and observe unsolicited responses",
      "Open diagnostics container",
      "Run termshark with filter: port 20000",
      "Analyze DNP3 function codes and object groups",
    ],
    relatedBlogs: ["termshark-industrial-protocol-analysis", "ot-it-convergence-basics"],
    libraryDocs: [
      { name: "pydnp3", url: "https://github.com/ChargePoint/pydnp3", language: "Python" },
      { name: "opendnp3", url: "https://dnp3.github.io/", language: "C++" },
      { name: "dnp3-protocol", url: "https://www.npmjs.com/package/dnp3", language: "Node.js" },
    ],
    icon: "zap",
    guestAccess: false,
  },
  {
    id: "iec104",
    name: "IEC 60870-5-104",
    shortDescription: "International standard for telecontrol in electrical engineering and power systems.",
    overview: `IEC 60870-5-104 (often just "IEC-104") is the TCP/IP extension of the IEC 60870-5-101 serial protocol. It's the dominant SCADA protocol in European and Asian power grids, providing reliable communication between control centers and substations.

The protocol uses ASDU (Application Service Data Units) to carry information objects with type identification, cause of transmission, and timestamps. It supports spontaneous transmission, interrogation commands, and clock synchronization.

Key characteristics: Balanced communication mode, time-tagged data, event-driven reporting, designed for power systems, supports control and monitoring.`,
    transportLayer: {
      type: "TCP/IP",
      port: 2404,
      description: "IEC-104 uses TCP port 2404. The protocol includes APCI (Application Protocol Control Information) with control fields for flow control. Supports both balanced and unbalanced modes. T1/T2/T3 timers manage connection health.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/iec104",
      serverPort: 2404,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for IEC-104",
      "Send general interrogation command",
      "Read single/double point information",
      "Send control commands (single/double)",
      "Open diagnostics container",
      "Run termshark with filter: port 2404",
      "Analyze ASDU types and cause of transmission",
    ],
    relatedBlogs: ["termshark-industrial-protocol-analysis", "ot-it-convergence-basics"],
    libraryDocs: [
      { name: "lib60870", url: "https://github.com/mz-automation/lib60870", language: "C" },
      { name: "iec104", url: "https://github.com/mz-automation/lib60870-Python", language: "Python" },
      { name: "node-iec104", url: "https://www.npmjs.com/package/iec-60870-5-104", language: "Node.js" },
    ],
    icon: "radio",
    guestAccess: false,
  },
  {
    id: "mqtt",
    name: "MQTT",
    shortDescription: "Lightweight publish-subscribe messaging protocol ideal for IoT and IIoT applications.",
    overview: `MQTT (Message Queuing Telemetry Transport) was designed in 1999 for bandwidth-constrained networks and resource-limited devices. It has become the de facto standard for IoT and is increasingly used in industrial settings (IIoT) for sensor data collection and edge-to-cloud communication.

Unlike polling protocols, MQTT uses a publish-subscribe model with a central broker. Devices publish messages to topics, and interested clients subscribe to receive them. This decouples publishers from subscribers and enables efficient one-to-many distribution.

Key characteristics: Lightweight (minimal overhead), publish-subscribe model, QoS levels (0, 1, 2), retained messages, last will testament, supports TLS encryption.`,
    transportLayer: {
      type: "TCP/IP",
      port: 1883,
      description: "MQTT uses TCP port 1883 (unencrypted) or 8883 (TLS). Supports WebSocket transport on ports 80/443 for web clients. Fixed header is just 2 bytes minimum. QoS levels control delivery guarantees.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/mqtt",
      serverPort: 1883,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for MQTT",
      "Subscribe to sensor data topics",
      "Publish control messages to output topics",
      "Observe message flow through the broker",
      "Open diagnostics container",
      "Run termshark with filter: port 1883",
      "Analyze MQTT packet types (CONNECT, PUBLISH, SUBSCRIBE)",
    ],
    relatedBlogs: ["getting-started-with-docker-for-ot", "termshark-industrial-protocol-analysis", "ot-it-convergence-basics"],
    libraryDocs: [
      { name: "paho-mqtt", url: "https://eclipse.dev/paho/files/paho.mqtt.python/html/", language: "Python" },
      { name: "mosquitto", url: "https://mosquitto.org/documentation/", language: "C" },
      { name: "mqtt.js", url: "https://github.com/mqttjs/MQTT.js", language: "Node.js" },
    ],
    icon: "wifi",
    guestAccess: false,
  },
  {
    id: "s7",
    name: "S7comm",
    shortDescription: "Proprietary protocol for Siemens S7 series PLCs including S7-300, S7-400, and S7-1200/1500.",
    overview: `S7comm is Siemens' proprietary protocol for communication with S7 series PLCs. While not officially documented, it has been reverse-engineered and is widely used for integrating Siemens PLCs with third-party systems.

The protocol operates over ISO-on-TCP (RFC 1006) and supports reading/writing data blocks, inputs, outputs, and markers. S7-1200 and S7-1500 PLCs use an enhanced version (S7comm-Plus) with additional features and improved security.

Key characteristics: Native to Siemens PLCs, supports all S7 data types, block-oriented access, runs over ISO-on-TCP, requires "optimized block access" to be disabled for external access.`,
    transportLayer: {
      type: "ISO-on-TCP (RFC 1006)",
      port: 102,
      description: "S7comm uses TCP port 102 with ISO-on-TCP (TPKT/COTP) encapsulation. Connection requires specifying rack and slot of the CPU. PDU size negotiation occurs during connection setup. Typical max PDU: 480 bytes.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/s7",
      serverPort: 102,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for S7comm",
      "Read data blocks (DB) and I/O areas",
      "Write to outputs and data block variables",
      "Monitor CPU status and diagnostics",
      "Open diagnostics container",
      "Run termshark with filter: port 102",
      "Analyze S7 PDU function codes and data areas",
    ],
    relatedBlogs: ["termshark-industrial-protocol-analysis", "python-scripting-for-plc-communication"],
    libraryDocs: [
      { name: "python-snap7", url: "https://python-snap7.readthedocs.io/", language: "Python" },
      { name: "snap7", url: "https://snap7.sourceforge.net/", language: "C" },
      { name: "nodes7", url: "https://github.com/plcpeople/nodeS7", language: "Node.js" },
    ],
    icon: "shield",
    guestAccess: false,
  },
  {
    id: "bacnet",
    name: "BACnet",
    shortDescription: "Building Automation and Control network protocol for HVAC, lighting, and building management.",
    overview: `BACnet (Building Automation and Control network) is the ASHRAE/ISO standard for building automation systems. It enables communication between HVAC controllers, lighting systems, access control, fire detection, and other building systems from different vendors.

BACnet uses an object-oriented model where devices contain objects (Analog Input, Binary Output, Schedule, etc.) with properties. It supports multiple network types including IP, MS/TP (serial), and Ethernet.

Key characteristics: Multi-vendor interoperability, object-oriented architecture, supports trending and scheduling, COV (Change of Value) subscriptions, BACnet/IP most common in new installations.`,
    transportLayer: {
      type: "UDP/IP",
      port: 47808,
      description: "BACnet/IP uses UDP port 47808 (0xBAC0). Supports broadcast for device discovery (Who-Is/I-Am). BBMD (BACnet Broadcast Management Device) enables cross-subnet communication. Also available over MS/TP serial and Ethernet.",
    },
    fuxaConfig: {
      enabled: true,
      hmiPath: "/bacnet",
      serverPort: 47808,
    },
    testWorkflow: [
      "Open FUXA SCADA interface for BACnet",
      "Discover devices using Who-Is broadcast",
      "Read object properties (Present-Value, Status-Flags)",
      "Write to controllable objects",
      "Open diagnostics container",
      "Run termshark with filter: port 47808",
      "Analyze BACnet service requests and object references",
    ],
    relatedBlogs: ["termshark-industrial-protocol-analysis", "ot-it-convergence-basics"],
    libraryDocs: [
      { name: "bacpypes", url: "https://bacpypes.readthedocs.io/", language: "Python" },
      { name: "bacnet-stack", url: "https://github.com/bacnet-stack/bacnet-stack", language: "C" },
      { name: "node-bacnet", url: "https://github.com/fh1ch/node-bacnet", language: "Node.js" },
    ],
    icon: "building",
    guestAccess: false,
  },
];

const tools: Tool[] = [
  {
    slug: "wireshark",
    name: "Wireshark",
    description: "Network protocol analyzer for capturing and analyzing industrial protocol traffic.",
    category: "Network Analysis",
    version: "4.0+",
    docsUrl: "https://www.wireshark.org/docs/",
    icon: "activity",
    content: `
<h2>Overview</h2>
<p>Wireshark is the world's most popular network protocol analyzer. It lets you capture and interactively browse network traffic, with deep inspection of hundreds of protocols including industrial protocols.</p>

<h2>Industrial Protocol Support</h2>
<ul>
<li>Modbus TCP/RTU</li>
<li>EtherNet/IP (CIP)</li>
<li>OPC UA</li>
<li>DNP3</li>
<li>IEC 60870-5-104</li>
<li>MQTT</li>
<li>S7comm</li>
<li>BACnet</li>
<li>PROFINET</li>
</ul>

<h2>Getting Started</h2>
<ol>
<li>Download from wireshark.org</li>
<li>Install with industrial protocol dissectors</li>
<li>Start capture on network interface</li>
<li>Apply protocol-specific display filters</li>
</ol>
    `,
  },
  {
    slug: "termshark",
    name: "Termshark",
    description: "Terminal-based packet analyzer for headless environments and Docker containers.",
    category: "Network Analysis",
    version: "2.4+",
    docsUrl: "https://github.com/gcla/termshark",
    icon: "terminal",
    content: `
<h2>Overview</h2>
<p>Termshark is a terminal user interface for tshark, inspired by Wireshark. It provides the same powerful packet analysis capabilities in a terminal environment.</p>

<h2>Use Cases</h2>
<ul>
<li>Analyzing traffic in Docker containers</li>
<li>Remote analysis over SSH</li>
<li>Embedded systems without GUI</li>
<li>Quick command-line captures</li>
</ul>

<h2>Basic Usage</h2>
<pre><code class="language-bash"># Capture on interface
termshark -i eth0

# With capture filter
termshark -i eth0 -f "port 502"

# Read pcap file
termshark -r capture.pcap</code></pre>
    `,
  },
  {
    slug: "docker",
    name: "Docker",
    description: "Container platform for creating isolated industrial protocol testing environments.",
    category: "Infrastructure",
    version: "24.0+",
    docsUrl: "https://docs.docker.com/",
    icon: "box",
    content: `
<h2>Overview</h2>
<p>Docker enables you to create isolated, reproducible testing environments for industrial protocols without affecting production systems.</p>

<h2>Benefits for Industrial Testing</h2>
<ul>
<li>Isolated test environments</li>
<li>Reproducible setups</li>
<li>Easy protocol simulator deployment</li>
<li>Network isolation for security testing</li>
</ul>

<h2>Docker Compose Example</h2>
<pre><code class="language-yaml">version: '3.8'
services:
  fuxa:
    image: frangoteam/fuxa
    ports:
      - "1881:1881"
  modbus-server:
    image: oitc/modbus-server
    ports:
      - "502:502"</code></pre>
    `,
  },
];

class MemStorage implements IStorage {
  async getBlogPosts(): Promise<BlogPost[]> {
    return blogPosts;
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return blogPosts.find((post) => post.slug === slug);
  }

  async getProtocols(): Promise<Protocol[]> {
    return protocols;
  }

  async getProtocol(id: string): Promise<Protocol | undefined> {
    return protocols.find((protocol) => protocol.id === id);
  }

  async getTools(): Promise<Tool[]> {
    return tools;
  }

  async getTool(slug: string): Promise<Tool | undefined> {
    return tools.find((tool) => tool.slug === slug);
  }
}

export const storage = new MemStorage();
