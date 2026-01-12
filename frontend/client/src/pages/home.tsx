import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Hero } from "@/components/hero";
import { BlogCard } from "@/components/blog-card";
import { ToolCard } from "@/components/tool-card";
import { ArrowRight, FlaskConical, BookOpen, Wrench, GraduationCap, Shield, Activity, Network, Server, Cpu, Wifi, Zap, Radio, Building, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { BlogPost, Protocol, Tool } from "@shared/schema";

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

function SectionHeader({ 
  title, 
  description, 
  href, 
  linkText,
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  linkText: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">{title}</span>
        </div>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </div>
      <Link href={href}>
        <Button variant="outline" className="gap-2 flex-shrink-0">
          {linkText}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function LoadingCards({ count, type }: { count: number; type: "blog" | "protocol" | "tool" }) {
  return (
    <div className={`grid gap-6 ${
      type === "protocol" 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
        : type === "tool"
        ? "grid-cols-1 lg:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-6 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  
  const { data: posts, isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const { data: protocols, isLoading: protocolsLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const { data: tools, isLoading: toolsLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const featuredPosts = posts?.slice(0, 3);
  const featuredProtocols = protocols?.slice(0, 4);
  const featuredTools = tools?.slice(0, 4);

  return (
    <div className="min-h-screen" data-testid="page-home">
      <Hero />

      {isAuthenticated && user && (
        <section className="py-8 bg-primary/5 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Welcome back,</p>
                  <p className="font-semibold">{user.firstName || user.email || "Researcher"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
                  <Activity className="h-4 w-4" />
                  Full Access Enabled
                </div>
                <span className="text-muted-foreground">8 Protocol Labs Available</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Protocol Labs"
            description={isAuthenticated 
              ? "Full access to all 8 industrial protocol labs with live HMI integration and traffic analysis."
              : "Hands-on labs for industrial protocols. Sign in to unlock all 8 protocols beyond the guest Modbus lab."
            }
            href="/labs"
            linkText="View All Labs"
            icon={FlaskConical}
          />
          
          {protocolsLoading ? (
            <LoadingCards count={4} type="protocol" />
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProtocols?.map((protocol) => {
                const Icon = protocolIcons[protocol.icon] || Network;
                return (
                  <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                          </div>
                          {protocol.guestAccess ? (
                            <Badge variant="secondary" className="text-xs">Guest Access</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Lock className="h-3 w-3" />
                              Auth
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{protocol.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          Port {protocol.transportLayer.port}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
                          {protocol.shortDescription}
                        </p>
                        <Link href={`/labs/${protocol.id}`}>
                          <Button variant="outline" className="w-full gap-2">
                            Open Lab
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Learning Resources"
            description="Technical articles on industrial protocols, network analysis, Python scripting, and OT/IT integration."
            href="/blog"
            linkText="View All Posts"
            icon={BookOpen}
          />
          
          {postsLoading ? (
            <LoadingCards count={3} type="blog" />
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts?.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Tools & Libraries"
            description="Documentation and guides for Python libraries and tools used in industrial automation research."
            href="/tools"
            linkText="View All Tools"
            icon={Wrench}
          />
          
          {toolsLoading ? (
            <LoadingCards count={4} type="tool" />
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {featuredTools?.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
                <CardTitle>Interactive Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Step-by-step guided tutorials for each protocol with interactive exercises and assessments.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
                <CardTitle>Traffic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Real-time protocol traffic visualization with packet capture and behavioral analysis tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
                <CardTitle>Security Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Hands-on security testing scenarios demonstrating common vulnerabilities and hardening techniques.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
