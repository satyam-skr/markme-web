import { useState, useEffect } from "react";
import { Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface StudentProfile {
  firstName: string;
  lastName: string;
  legalName: string;
  email: string;
  rollNumber: string;
  branch: string;
  section: string;
  subsection: string;
  dateOfAdmission: string;
  contactNumber: string;
  dateOfBirth: string;
}

// Mock data for development fallback
const mockProfile = {
  firstName: "John",
  lastName: "Doe",
  legalName: "John Doe",
  email: "john.doe@markme.edu",
  rollNumber: "2025CS001",
  branch: "CSE",
  section: "A",
  subsection: "1",
  dateOfAdmission: "2025-08-01",
  contactNumber: "9876543210",
  dateOfBirth: "2003-04-20",
};

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(mockProfile);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/student/me?source=web`, {
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data.student) {
          const studentData = data.data.student;
          setProfile({
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            legalName: studentData.legalName,
            email: studentData.user?.email || user.email,
            rollNumber: studentData.rollNumber,
            branch: studentData.branch,
            section: studentData.section,
            subsection: studentData.subsection,
            dateOfAdmission: studentData.dateOfAdmission,
            contactNumber: studentData.contactNumber,
            dateOfBirth: studentData.dateOfBirth,
          });
          setUsingDemoData(false);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Failed to load student profile:", error);
        // Fallback to default profile with user data
        setProfile({
          ...mockProfile,
          email: user.email,
          firstName: user.firstName || "Student",
          lastName: user.lastName || "User",
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
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{profile.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{profile.contactNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{profile.branch}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium">{profile.section}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subsection</p>
                <p className="font-medium">{profile.subsection}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Admission</p>
                <p className="font-medium">{new Date(profile.dateOfAdmission).toLocaleDateString()}</p>
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