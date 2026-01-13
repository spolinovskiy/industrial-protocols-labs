import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, 
  ExternalLink, 
  Play, 
  Network, 
  Server, 
  Cpu, 
  Wifi, 
  Shield, 
  Zap, 
  Radio, 
  Building,
  BookOpen,
  FileCode,
  CheckCircle,
  Lock,
  Terminal
} from "lucide-react";
import type { Protocol, BlogPost } from "@shared/schema";

const protocolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  network: Network,
  server: Server,
  cpu: Cpu,
  wifi: Wifi,
  shield: Shield,
  zap: Zap,
  radio: Radio,
  building: Building,
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-48 mb-6" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-lg mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProtocolTest() {
  const { protocol: protocolId } = useParams<{ protocol: string }>();
  const { user } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [statusTimestamp, setStatusTimestamp] = useState<string | null>(null);

  const { data: protocol, isLoading, error } = useQuery<Protocol>({
    queryKey: ["/api/protocols", protocolId],
    enabled: !!protocolId,
  });

  const { data: blogs } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const { data: labAccess } = useQuery<{ protocols: string[]; isAuthenticated: boolean }>({
    queryKey: ["/api/lab/protocols"],
  });

  const Icon = protocol?.icon ? protocolIcons[protocol.icon] || Network : Network;
  const canAccess = protocol?.guestAccess || labAccess?.isAuthenticated;
  const relatedBlogPosts = blogs?.filter(blog => protocol?.relatedBlogs.includes(blog.slug)) || [];
  const isActive = protocol?.id && activeProtocol === protocol.id;
  const guestBase = import.meta.env.VITE_LAB_GUEST_URL || import.meta.env.VITE_LAB_BACKEND_URL || "";
  const adminBase = import.meta.env.VITE_LAB_ADMIN_URL || import.meta.env.VITE_LAB_BACKEND_URL || "";
  const hmiBase = (labAccess?.isAuthenticated ? adminBase : guestBase).replace(/\/$/, "");
  const rawPath = protocol?.fuxaConfig.hmiPath || "";
  const hmiPath = rawPath.startsWith("/lab") ? rawPath : "/lab";
  const normalizedPath = hmiPath ? (hmiPath.startsWith("/") ? hmiPath : `/${hmiPath}`) : "";
  const hmiUrl = hmiBase ? `${hmiBase}${normalizedPath}` : null;

  useEffect(() => {
    const source = new EventSource("/api/lab/stream");
    source.addEventListener("status", (event) => {
      try {
        const data = JSON.parse(event.data);
        setActiveProtocol(data.active ?? null);
        setStatusTimestamp(data.timestamp ?? null);
      } catch {
        setActiveProtocol(null);
      }
    });
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, []);

  const handleStartLab = async () => {
    if (!protocol) return;
    setSwitchError(null);
    setSwitching(true);
    try {
      const response = await fetch("/api/lab/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocol: protocol.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSwitchError(data?.error || data?.message || "Failed to start lab");
      }
    } catch (error) {
      setSwitchError("Failed to reach lab controller");
    } finally {
      setSwitching(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="page-protocol-test-error">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Protocol Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The protocol you're looking for doesn't exist.
            </p>
            <Link href="/labs">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Labs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" data-testid="page-protocol-test">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Labs", href: "/labs" },
            { label: protocol.name },
          ]}
        />

        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">{protocol.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">Port {protocol.transportLayer.port}</Badge>
                <Badge variant={protocol.guestAccess ? "secondary" : "default"}>
                  {protocol.guestAccess ? "Guest Access" : "Authenticated Only"}
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">{protocol.shortDescription}</p>
        </header>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Launch FUXA SCADA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canAccess ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Access the FUXA HMI interface to interact with the {protocol.name} server.
                    Toggle digital outputs, write analog values, and monitor inputs in real-time.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" className="gap-2" onClick={handleStartLab} disabled={switching}>
                      <Play className="h-4 w-4" />
                      {switching ? "Starting lab..." : "Start Lab"}
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2" asChild disabled={!hmiUrl}>
                      <a href={hmiUrl || "#"} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Open FUXA Interface
                      </a>
                    </Button>
                    {isActive && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  {switchError && (
                    <div className="p-3 rounded-md border border-destructive/30 text-sm text-destructive">
                      {switchError}
                    </div>
                  )}
                  {statusTimestamp && (
                    <p className="text-xs text-muted-foreground">
                      Last status update: {new Date(statusTimestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Authentication Required</p>
                      <p className="text-sm text-muted-foreground">
                        Sign in to access {protocol.name} lab. Guest users can only access the Modbus lab.
                      </p>
                    </div>
                  </div>
                  <Link href="/login">
                    <Button className="gap-2">
                      Sign In for Full Access
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protocol Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {protocol.overview.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transport Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 mb-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                  <p className="font-medium">{protocol.transportLayer.type}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Default Port</p>
                  <p className="font-medium">{protocol.transportLayer.port}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Server Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
              <p className="text-muted-foreground">{protocol.transportLayer.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Test Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {protocol.testWorkflow.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {relatedBlogPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Related Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedBlogPosts.map((blog) => (
                    <Link key={blog.slug} href={`/blog/${blog.slug}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium">{blog.title}</p>
                          <p className="text-sm text-muted-foreground">{blog.readTime}</p>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Library Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {protocol.libraryDocs.map((lib) => (
                  <a
                    key={lib.name}
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{lib.name}</p>
                      <p className="text-sm text-muted-foreground">{lib.language}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/labs">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Protocols
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
