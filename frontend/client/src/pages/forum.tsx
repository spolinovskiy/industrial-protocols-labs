import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, Bell } from "lucide-react";

export default function Forum() {
  return (
    <div className="min-h-screen py-12" data-testid="page-forum">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
              <MessageSquare className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Forum Coming Soon</h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
              We're building a community forum where industrial automation engineers 
              can discuss protocols, share knowledge, and help each other solve problems.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Button disabled className="gap-2">
                <Bell className="h-4 w-4" />
                Notify When Ready
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
