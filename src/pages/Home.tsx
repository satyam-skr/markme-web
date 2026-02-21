import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Users, Calendar, BarChart3, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Calendar,
    title: "Easy Attendance",
    description: "Mark and track attendance with just a few clicks. Streamlined for speed and accuracy.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description: "Generate comprehensive reports with insights on attendance patterns and trends.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Secure access control for admins, faculty, and students with appropriate permissions.",
  },
  {
    icon: Shield,
    title: "Admin Console",
    description: "Powerful management tools to handle users, profiles, and system settings effortlessly.",
  },
];

const benefits = [
  "Real-time attendance tracking",
  "Automated report generation",
  "Student & faculty management",
  "Secure data handling",
  "Mobile-friendly interface",
  "Export to multiple formats",
];

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Attendance Made{" "}
                  <span className="text-primary">Simple</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                  Streamline your institution's attendance management with our modern, 
                  intuitive platform. Track, report, and manage—all in one place.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" asChild className="group">
                    <Link to={getDashboardPath()}>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setShowLogin(true)} className="group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative animate-fade-in">
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 md:p-12">
                <div className="bg-card rounded-xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-foreground">Today's Attendance</h3>
                    <span className="text-sm text-muted-foreground">Dec 1, 2025</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-primary">94%</p>
                      <p className="text-sm text-muted-foreground">Present</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-foreground">256</p>
                      <p className="text-sm text-muted-foreground">Students</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {["CS101 - Data Structures", "CS102 - Algorithms", "CS103 - Database Systems"].map((course, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-foreground">{course}</span>
                        <span className="text-sm font-medium text-primary">{92 + i * 2}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete suite of tools designed to make attendance management effortless for your institution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Built for Modern Institutions
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              MarkME was designed with accessibility and simplicity in mind. Whether you're managing 
              a small department or an entire university, our platform scales to meet your needs 
              while keeping the user experience intuitive and efficient.
            </p>
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to={getDashboardPath()}>Go to Dashboard</Link>
              </Button>
            ) : (
              <Button size="lg" onClick={() => setShowLogin(true)}>
                Start Using MarkME
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-xs">M</span>
              </div>
              <span className="font-heading font-medium text-foreground">MarkME</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MarkME. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );
}
