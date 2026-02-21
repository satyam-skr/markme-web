import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type UserRole = "ADMIN" | "STUDENT" | "FACULTY";
export type AccountStatus = "ACTIVE" | "VIEW_ONLY" | "DISABLED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string, role: "STUDENT" | "FACULTY") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check authentication status using cookies by calling /user/me
        const response = await fetch(`${API_BASE_URL}/user/me?source=web`, {
          credentials: "include", // Include cookies in request
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUser(data.data);
          }
        }
        // If response is not ok or no data, user is not authenticated
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Network error or server unavailable, user remains unauthenticated
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login?source=web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const userData = data.data.user || data.data || data.user;
        setUser(userData as User);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.firstName || userData.email}!`,
        });
        
        return { success: true };
      } else {
        const errorMessage = data.message || data.error || "Login failed";
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Network error. Please check your connection.";
      toast({
        title: "Connection Error", 
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role: "STUDENT" | "FACULTY") => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register?source=web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const userData = data.data.user || data.data || data.user;
        setUser(userData as User);
        
        toast({
          title: "Registration Successful",
          description: `Welcome, ${userData.firstName || userData.email}!`,
        });
        
        return { success: true };
      } else {
        const errorMessage = data.message || data.error || "Registration failed";
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Network error. Please check your connection.";
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout?source=web`, {
        method: "POST",
        credentials: "include", // Include cookies
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
