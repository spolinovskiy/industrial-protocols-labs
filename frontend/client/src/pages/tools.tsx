import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolCard } from "@/components/tool-card";
import { Wrench, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import type { Tool } from "@shared/schema";

function LoadingCards() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-12 w-full mb-3" />
                <Skeleton className="h-8 w-full mb-3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: tools, isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const filteredTools = useMemo(() => {
    if (!tools) return [];
    if (!searchQuery.trim()) return tools;
    
    const query = searchQuery.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    );
  }, [tools, searchQuery]);

  const categories = useMemo(() => {
    if (!tools) return [];
    const cats = [...new Set(tools.map((t) => t.category))];
    return cats.sort();
  }, [tools]);

  return (
    <div className="min-h-screen py-12" data-testid="page-tools">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">Tools & Libraries</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            Documentation and guides for Python libraries and tools used in industrial 
            automation. Learn how to use Pymodbus, pycomm3, python-opcua, Snap7, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-tools"
              />
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSearchQuery(category)}
                    className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingCards />
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tools found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search query" 
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
