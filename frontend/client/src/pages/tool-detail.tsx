import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { MarkdownContent } from "@/components/markdown-content";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Tool } from "@shared/schema";

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-5 w-48 mb-6" />
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-full max-w-lg mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const { data: tool, isLoading, error } = useQuery<Tool>({
    queryKey: ["/api/tools", slug],
  });

  const copyInstallCommand = () => {
    if (tool?.installCommand) {
      navigator.clipboard.writeText(tool.installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="page-tool-detail-error">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Tool Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The tool you're looking for doesn't exist.
            </p>
            <Link href="/tools">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" data-testid="page-tool-detail">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Tools", href: "/tools" },
            { label: tool.name },
          ]}
        />

        <header className="mb-8 pb-8 border-b">
          <div className="flex flex-wrap items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  {tool.name}
                </h1>
                {tool.version && (
                  <Badge variant="outline">v{tool.version}</Badge>
                )}
              </div>
              <Badge variant="secondary">{tool.category}</Badge>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-4">{tool.description}</p>
          
          {tool.installCommand && (
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
              <code className="flex-1 overflow-x-auto">{tool.installCommand}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyInstallCommand}
                className="flex-shrink-0"
                data-testid="button-copy-install"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          {tool.docsUrl && (
            <a
              href={tool.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
              data-testid="link-official-docs"
            >
              <ExternalLink className="h-4 w-4" />
              Official Documentation
            </a>
          )}
        </header>

        <MarkdownContent content={tool.content} />

        <div className="mt-8">
          <Link href="/tools">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
