import { Link, useLocation } from "wouter";
import { Menu, X, Server, Github, Container, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Labs", href: "/labs" },
  { name: "Blog", href: "/blog" },
  { name: "Tools", href: "/tools" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (firstName[0] || user.email?.[0] || "U").toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Server className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight leading-tight">IACS Behavior</span>
              <span className="text-xs text-muted-foreground leading-tight">Analysis Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={location === item.href || (item.href !== "/" && location.startsWith(item.href)) ? "secondary" : "ghost"}
                  className="text-sm font-medium"
                  data-testid={`link-nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/spolinovskiy/industrial-protocols-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
              data-testid="link-github"
            >
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
            <a
              href="https://hub.docker.com/repository/docker/polinovskiy/iacs-lab-repo/general"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
              data-testid="link-dockerhub"
            >
              <Button variant="ghost" size="icon">
                <Container className="h-5 w-5" />
                <span className="sr-only">Docker Hub</span>
              </Button>
            </a>
            <ThemeToggle />
            
            {!isLoading && (
              isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {(user.firstName || user.lastName) && (
                          <p className="font-medium">{`${user.firstName || ""} ${user.lastName || ""}`.trim()}</p>
                        )}
                        {user.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex items-center cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a href="/api/login">
                  <Button variant="default" size="sm" className="gap-2" data-testid="button-login">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </a>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location === item.href || (item.href !== "/" && location.startsWith(item.href)) ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm font-medium"
                  data-testid={`link-mobile-nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            <div className="flex gap-2 pt-2 border-t mt-2">
              <a href="https://github.com/spolinovskiy/industrial-protocols-labs" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
              <a href="https://hub.docker.com/repository/docker/polinovskiy/iacs-lab-repo/general" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Container className="h-4 w-4" />
                  Docker
                </Button>
              </a>
            </div>
            {!isLoading && !isAuthenticated && (
              <div className="pt-2 border-t mt-2">
                <a href="/api/login">
                  <Button className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </a>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
