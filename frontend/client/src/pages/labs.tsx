import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { 
  FlaskConical, 
  Network, 
  Server, 
  Cpu, 
  Wifi, 
  Shield, 
  Zap, 
  Radio, 
  Building,
  ExternalLink,
  Lock,
  ArrowRight
} from "lucide-react";
import type { Protocol } from "@shared/schema";

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

function LoadingCards() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ProtocolCardProps {
  protocol: Protocol;
  isAuthenticated: boolean;
}

function ProtocolCard({ protocol, isAuthenticated }: ProtocolCardProps) {
  const Icon = protocolIcons[protocol.icon] || Network;
  const canAccess = protocol.guestAccess || isAuthenticated;

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
                Auth Required
              </Badge>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-1">{protocol.name}</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Port {protocol.transportLayer.port} / {protocol.transportLayer.type}
          </p>
          <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
            {protocol.shortDescription}
          </p>
          
          <Link href={`/labs/${protocol.id}`}>
            <Button 
              variant={canAccess ? "default" : "outline"} 
              className="w-full gap-2"
            >
              {canAccess ? (
                <>
                  Open Lab
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In to Access
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Labs() {
  const { user } = useAuth();
  
  const { data: protocols, isLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const { data: labAccess } = useQuery<{ protocols: string[]; isAuthenticated: boolean }>({
    queryKey: ["/api/lab/protocols"],
  });

  const isAuthenticated = labAccess?.isAuthenticated || false;

  return (
    <div className="min-h-screen py-12" data-testid="page-labs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FlaskConical className="h-6 w-6" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">Protocol Labs</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mb-4">
            Hands-on labs for industrial automation protocols. Each protocol provides 
            direct access to FUXA SCADA for real-time interaction with simulated devices.
          </p>
          {!isAuthenticated && (
            <div className="p-4 bg-muted/50 rounded-lg border max-w-2xl">
              <p className="text-sm">
                <strong>Guest Access:</strong> Try the Modbus lab without signing in. 
                Sign in with Google, GitHub, Apple, X, or email to unlock all 8 protocol labs.
              </p>
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingCards />
        ) : protocols?.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No labs available</h3>
            <p className="text-muted-foreground">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {protocols?.map((protocol) => (
              <ProtocolCard 
                key={protocol.id} 
                protocol={protocol} 
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        <div className="mt-16 p-8 bg-muted/50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Workflow</h2>
          <p className="text-muted-foreground mb-6">
            Each protocol lab follows a consistent workflow for hands-on testing:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="p-4 bg-background rounded-lg border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mb-2">1</div>
              <h3 className="font-medium mb-1">Open FUXA</h3>
              <p className="text-sm text-muted-foreground">
                Launch the HMI interface
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mb-2">2</div>
              <h3 className="font-medium mb-1">Toggle DO/AO</h3>
              <p className="text-sm text-muted-foreground">
                Write digital and analog outputs
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mb-2">3</div>
              <h3 className="font-medium mb-1">Read AI</h3>
              <p className="text-sm text-muted-foreground">
                Monitor analog input values
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mb-2">4</div>
              <h3 className="font-medium mb-1">Diagnostics</h3>
              <p className="text-sm text-muted-foreground">
                Open the diagnostics container
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mb-2">5</div>
              <h3 className="font-medium mb-1">Termshark</h3>
              <p className="text-sm text-muted-foreground">
                Analyze protocol packets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
