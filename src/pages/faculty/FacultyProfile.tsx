import { useState, useEffect } from "react";
import { Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  department: "CSE",
  designation: "Professor",
  dateOfJoining: "2018-06-15",
  contactNumber: "9876543210",
  dateOfBirth: "1980-03-15",
};

export default function FacultyProfile() {
  const [profile, setProfile] = useState<FacultyProfile>(mockProfile);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/faculty/me?source=web`, {
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data.faculty) {
          const facultyData = data.data.faculty;
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
          setUsingDemoData(false);
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
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Failure Message */}
      {usingDemoData && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to the server. Displaying demo profile data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      )}

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
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.firstName} {profile.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Legal Name</p>
                <p className="font-medium">{profile.legalName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{profile.contactNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{profile.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{profile.designation || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Joining</p>
                <p className="font-medium">{new Date(profile.dateOfJoining).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}