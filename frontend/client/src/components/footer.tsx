import { Link } from "wouter";
import { Github, Container, Mail, Linkedin } from "lucide-react";

const protocols = [
  { name: "Modbus", href: "/labs/modbus" },
  { name: "CIP/EtherNet-IP", href: "/labs/cip" },
  { name: "OPC UA", href: "/labs/opcua" },
  { name: "MQTT", href: "/labs/mqtt" },
  { name: "S7comm", href: "/labs/s7comm" },
  { name: "DNP3", href: "/labs/dnp3" },
  { name: "BACnet", href: "/labs/bacnet" },
  { name: "IEC-104", href: "/labs/iec104" },
];

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Protocol Labs", href: "/labs" },
  { name: "Blog", href: "/blog" },
  { name: "Tools & Libraries", href: "/tools" },
  { name: "About", href: "/about" },
];

const resources = [
  { name: "GitHub", href: "https://github.com/spolinovskiy/industrial-protocols-labs", icon: Github },
  { name: "Docker Hub", href: "https://hub.docker.com/repository/docker/polinovskiy/iacs-lab-repo/general", icon: Container },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/stanislavpolinovskiy/", icon: Linkedin },
  { name: "Contact", href: "mailto:contact@example.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-footer-home">
              <img
                src="/images/iacs-logo.svg"
                alt="IACS DevOps Labs and Experiments logo"
                className="h-9 w-9"
              />
              <div className="flex flex-col">
                <span className="text-lg font-semibold leading-tight">IACS DevOps Labs</span>
                <span className="text-xs text-muted-foreground leading-tight">and Experiments</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A comprehensive platform for studying industrial automation protocol behaviors. 
              Access live labs, analyze traffic patterns, and explore technical resources.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Protocol Labs</h3>
            <ul className="space-y-2">
              {protocols.map((protocol) => (
                <li key={protocol.name}>
                  <Link
                    href={protocol.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-protocol-${protocol.name.toLowerCase().replace(/[\/\s]+/g, '-')}`}
                  >
                    {protocol.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    target={resource.href.startsWith("http") ? "_blank" : undefined}
                    rel={resource.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-resource-${resource.name.toLowerCase()}`}
                  >
                    <resource.icon className="h-4 w-4" />
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Built for Industrial Automation Security Research
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} IACS DevOps Labs and Experiments. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
