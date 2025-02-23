import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <a className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SpaceCourse
                </span>
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className="text-foreground/80 hover:text-foreground">Home</a>
            </Link>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <a className="text-foreground/80 hover:text-foreground">Admin</a>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}