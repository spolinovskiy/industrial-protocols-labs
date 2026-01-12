import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical, BookOpen, Shield, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.2),transparent_50%)]" />
      
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
            <Activity className="h-4 w-4" />
            Industrial Control Systems Security Research
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            IACS{" "}
            <span className="text-primary">Behavior Analysis</span>{" "}
            Platform
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            A comprehensive platform for studying industrial automation protocol behaviors. 
            Access live protocol labs, analyze traffic patterns, and explore technical resources 
            for Modbus, OPC UA, CIP, DNP3, IEC-104, MQTT, S7, and BACnet.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/labs">
              <Button size="lg" className="gap-2" data-testid="button-hero-labs">
                <FlaskConical className="h-5 w-5" />
                {isAuthenticated ? "Access All Labs" : "Try Modbus Lab"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-hero-blog">
                <BookOpen className="h-5 w-5" />
                Technical Resources
              </Button>
            </Link>
            {!isAuthenticated && (
              <a href="/api/login">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-hero-signin">
                  <Shield className="h-5 w-5" />
                  Sign In for Full Access
                </Button>
              </a>
            )}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              {isAuthenticated ? "8 Protocol Labs" : "1 Guest Protocol Lab"}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              FUXA HMI Integration
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              Live Traffic Analysis
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Guest Access:</span> Try the Modbus lab without signing in. 
                Sign in with Google, GitHub, Apple, X, or email to unlock all 8 protocol labs.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
