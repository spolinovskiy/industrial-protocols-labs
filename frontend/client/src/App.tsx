import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import Home from "@/pages/home";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Labs from "@/pages/labs";
import ProtocolTest from "@/pages/protocol-test";
import Tools from "@/pages/tools";
import About from "@/pages/about";
import ToolDetail from "@/pages/tool-detail";
import Forum from "@/pages/forum";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/labs" component={Labs} />
      <Route path="/labs/:protocol" component={ProtocolTest} />
      <Route path="/tools" component={Tools} />
      <Route path="/tools/:slug" component={ToolDetail} />
      <Route path="/about" component={About} />
      <Route path="/forum" component={Forum} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="iacs-devops-theme">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
