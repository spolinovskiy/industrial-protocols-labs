import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Wrench, Terminal, Code, Database, Globe, FileCode } from "lucide-react";
import type { Tool } from "@shared/schema";

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pymodbus: Package,
  pycomm3: Code,
  opcua: Database,
  paho: Globe,
  snap7: Terminal,
  pydnp3: FileCode,
  iec104: Wrench,
  docker: Terminal,
  wireshark: Wrench,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = toolIcons[tool.slug] || Package;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card
        className="h-full hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group"
        data-testid={`card-tool-${tool.slug}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-lg bg-muted">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                {tool.version && (
                  <Badge variant="outline" className="text-xs">
                    v{tool.version}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="text-xs mb-2">
                {tool.category}
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {tool.description}
              </p>
              {tool.installCommand && (
                <div className="bg-muted rounded-md p-2 mb-3 font-mono text-xs overflow-x-auto">
                  <code className="text-muted-foreground">{tool.installCommand}</code>
                </div>
              )}
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 group-hover:gap-2 transition-all">
                View Docs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
