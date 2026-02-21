import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginModal } from "@/components/auth/LoginModal";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "STUDENT":
        return "/dashboard/student";
      case "FACULTY":
        return "/dashboard/faculty";
      default:
        return "/";
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">M</span>
              </div>
              <span className="font-heading font-semibold text-xl text-foreground">MarkME</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to={getDashboardPath()}>
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLogin(true)}>Login</Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </a>
                <div className="px-4 pt-2">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <Link to={getDashboardPath()} onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Dashboard</Button>
                      </Link>
                      <Button variant="outline" onClick={handleLogout} className="w-full">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => { setShowLogin(true); setIsOpen(false); }} className="w-full">
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
