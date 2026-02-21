import { useState } from "react";
import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import {
  Home,
  BookOpen,
  Calendar,
  User,
  LogOut,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "", label: "Home", icon: Home, path: "/dashboard/student" },
  { id: "courses", label: "Registered Courses", icon: BookOpen, path: "/dashboard/student/courses" },
  { id: "attendance", label: "Attendance", icon: Calendar, path: "/dashboard/student/attendance" },
  { id: "profile", label: "Profile", icon: User, path: "/dashboard/student/profile" },
];

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user || user.role !== "STUDENT") {
    return <Navigate to="/" replace />;
  }

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(item =>
      location.pathname === item.path ||
      (item.id && location.pathname.startsWith(`/dashboard/student/${item.id}`))
    );
    return currentItem?.label || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 md:w-16",
          !sidebarOpen && "overflow-hidden md:overflow-visible"
        )}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className={cn("p-4 border-b border-sidebar-border", !sidebarOpen && "md:px-3")}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sidebar-primary-foreground font-heading font-bold text-sm">M</span>
              </div>
              {sidebarOpen && (
                <span className="font-heading font-semibold text-lg text-sidebar-foreground">MarkME</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id || "home"}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  location.pathname === item.path || 
                  (item.id && location.pathname.startsWith(`/dashboard/student/${item.id}`))
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-sidebar-border space-y-1">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              {sidebarOpen && <span className="text-sm font-medium">Toggle theme</span>}
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background px-4 flex items-center justify-between sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg text-foreground">
              {getCurrentPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-medium">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
