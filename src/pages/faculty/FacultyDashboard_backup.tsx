import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import {
  User,
  Calendar,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user || user.role !== "FACULTY") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">M</span>
              </div>
              <span className="font-heading font-semibold text-lg text-foreground">MarkME</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <Link
              to="/dashboard/faculty/profile"
              className={cn(
                "py-4 px-2 border-b-2 transition-colors font-medium text-sm",
                location.pathname === "/dashboard/faculty/profile" || location.pathname === "/dashboard/faculty"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-4 w-4 inline mr-2" />
              Profile
            </Link>
            <Link
              to="/dashboard/faculty/attendance"
              className={cn(
                "py-4 px-2 border-b-2 transition-colors font-medium text-sm",
                location.pathname === "/dashboard/faculty/attendance"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

interface FacultyProfile {
  firstName: string;
  lastName: string;
  legalName: string;
  email: string;
  department: string;
  designation?: string;
  dateOfJoining: string;
  contactNumber: string;
  dateOfBirth: string;
}

// Mock data for development fallback
const mockProfile = {
  firstName: "Dr. Jane",
  lastName: "Smith",
  legalName: "Dr. Jane Smith",
  email: "dr.jane@markme.edu",
  department: "Computer Science",
  designation: "Professor",
  dateOfJoining: "2018-06-15",
  contactNumber: "9876543210",
  dateOfBirth: "1980-03-15",
};

const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<FacultyProfile>(mockProfile);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user || user.role !== "FACULTY") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await facultyApi.getProfile();
        
        if (response.success && response.data.faculty) {
          const facultyData = response.data.faculty;
          setProfile({
            firstName: facultyData.firstName,
            lastName: facultyData.lastName,
            legalName: facultyData.legalName,
            email: facultyData.user?.email || user.email,
            department: facultyData.department,
            designation: facultyData.designation,
            dateOfJoining: facultyData.dateOfJoining,
            contactNumber: facultyData.contactNumber,
            dateOfBirth: facultyData.dateOfBirth,
          });
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Failed to load faculty profile:", error);
        // Fallback to default profile with user data
        setProfile({
          ...mockProfile,
          email: user.email,
          firstName: user.firstName || "Dr. Faculty",
          lastName: user.lastName || "User",
          legalName: `${user.firstName || "Dr. Faculty"} ${user.lastName || "User"}`,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const mockCourses = [
    { code: "CS101", name: "Data Structures", students: 45, avgAttendance: 92 },
    { code: "CS102", name: "Algorithms", students: 38, avgAttendance: 88 },
    { code: "CS201", name: "Operating Systems", students: 42, avgAttendance: 90 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">M</span>
              </div>
              <span className="font-heading font-semibold text-lg text-foreground">MarkME</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "py-4 px-2 border-b-2 transition-colors font-medium text-sm",
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-4 w-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={cn(
                "py-4 px-2 border-b-2 transition-colors font-medium text-sm",
                activeTab === "attendance"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "profile" ? (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-accent/50 border border-border rounded-lg">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  To modify your profile or reset your password, please contact administration.
                </p>
                <Button variant="link" className="h-auto p-0 text-primary text-sm">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading profile...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { label: "First Name", value: profile.firstName },
                      { label: "Last Name", value: profile.lastName },
                      { label: "Legal Name", value: profile.legalName },
                      { label: "Email", value: profile.email },
                      { label: "Department", value: profile.department },
                      { label: "Designation", value: profile.designation || "Faculty" },
                      { label: "Date of Joining", value: new Date(profile.dateOfJoining).toLocaleDateString() },
                      { label: "Contact Number", value: profile.contactNumber },
                      { label: "Date of Birth", value: new Date(profile.dateOfBirth).toLocaleDateString() },
                    ].map((field, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm text-muted-foreground">{field.label}</p>
                        <p className="font-medium text-foreground">{field.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Courses Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCourses.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">{course.code}</Badge>
                          <p className="font-medium text-foreground">{course.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.students} students enrolled
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                          <p className="font-medium text-foreground">{course.avgAttendance}%</p>
                        </div>
                        <Button size="sm">
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Mark
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary">3</p>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground">125</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground">90%</p>
                  <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
