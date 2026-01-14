import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12" data-testid="page-about">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">About</h1>
          <p className="text-lg text-muted-foreground">
            The IACS DevOps Labs and Experiments platform is an educational resource for industrial automation engineers and security researchers.
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">About the Author</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                I'm Stanislav Polinovskiy, an industrial automation engineer with over 15 years of experience 
                in Oil & Gas, energy, and large-scale industrial infrastructure projects.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My journey started with PLC, DCS, and SCADA systems, commissioning pump stations, substations, 
                and process facilities across safety-critical environments. Today, I work at the intersection 
                of Industrial Automation and DevOps, where OT meets modern IT practices.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">Industrial Automation</Badge>
                <Badge variant="secondary">DevOps</Badge>
                <Badge variant="secondary">Industry 4.0</Badge>
                <Badge variant="secondary">OT Cybersecurity</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">What I Work On</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Industrial Automation DevOps</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Applying DevOps principles—automation, version control, CI/CD, observability—to traditionally static OT systems.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Industry 4.0 & Digital Transformation</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Moving from isolated control systems toward connected, data-driven, and analytics-ready industrial platforms.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Industrial Networking & Protocols</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      EtherNet/IP (CIP), OPC UA, Modbus, DNP3, MQTT, S7, and how they behave in real networks.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium">OT Cybersecurity & Resilience</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Network segmentation, secure architectures, protocol hardening, and pragmatic security aligned with operational constraints.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">About This Platform</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This platform bridges a recurring gap I've observed throughout my career:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Automation engineers often lack exposure to modern IT and DevOps tooling
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  IT engineers often underestimate or misunderstand the constraints of OT systems
                </li>
              </ul>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">
                Here you'll find practical explanations of industrial protocols, hands-on labs and test 
                environments, clear distinctions between theory and what works in the field, and notes 
                on digitalization and long-term system evolution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">My Philosophy</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-1">Simple, testable architectures</p>
                  <p className="text-sm text-muted-foreground">Complexity should serve a purpose</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-1">Documentation engineers read</p>
                  <p className="text-sm text-muted-foreground">Clear and practical over verbose</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-1">Automation over manual work</p>
                  <p className="text-sm text-muted-foreground">Repeatable and reliable processes</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-1">Learning by building</p>
                  <p className="text-sm text-muted-foreground">Hands-on experience matters most</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-4 italic">
                If something cannot be explained clearly, it is probably not understood well enough.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Connect</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.linkedin.com/in/stanislavpolinovskiy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
                <a
                  href="https://github.com/spolinovskiy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
                <a href="mailto:contact@example.com">
                  <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {[
                  "Learning", "Industrial Automation", "DevOps", "Industry 4.0",
                  "Digital Twins", "SCADA & PLC", "Industrial Networking",
                  "Cybersecurity", "Linux", "Containers", "Protocols",
                  "Systems Architecture", "OT/IT Integration"
                ].map((interest) => (
                  <Badge key={interest} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
