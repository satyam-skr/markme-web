import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Schema-based options
const BRANCHES = ["CSE", "ECE", "AIML", "HCIGT", "DSA", "IOT"];
const SECTIONS = ["A", "B", "C"];
const SUBSECTIONS = ["1", "2", "3"];

export default function CreateStudent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: User credentials
    email: "",
    password: "",
    
    // Step 2: Student profile
    firstName: "",
    lastName: "",
    legalName: "",
    rollNumber: "",
    contactNumber: "",
    dateOfBirth: "",
    dateOfAdmission: "",
    branch: "",
    section: "",
    subsection: "",
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate legal name from first and last name
    if (field === "firstName" || field === "lastName") {
      const firstName = field === "firstName" ? value : formData.firstName;
      const lastName = field === "lastName" ? value : formData.lastName;
      setFormData(prev => ({
        ...prev,
        legalName: `${firstName} ${lastName}`.trim()
      }));
    }
  };

  const handleStep1Submit = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password.length < 8) {
      toast({
        title: "Validation Error", 
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/user?source=web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "STUDENT"
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Extract userId from the nested response structure
        const userId = data.data?.user?.id || 
                      data.data?.id || 
                      data.data?.userId ||
                      data.id || 
                      data.userId || 
                      data.user?.id;
        
        console.log("User creation response:", data);
        console.log("Extracted userId:", userId);
        
        if (!userId) {
          throw new Error("User ID not found in response");
        }
        
        setUserId(userId);
        toast({
          title: "User Created",
          description: "User account created successfully. Now create the student profile."
        });
        setStep(2);
      } else {
        const errorMessage = data.message || data.error || "Failed to create user";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Failed to create user:", error);
      toast({
        title: "Error",
        description: error.message || "Network error. Failed to create user account.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async () => {
    // Validation
    const requiredFields = ['firstName', 'lastName', 'rollNumber', 'contactNumber', 'dateOfBirth', 'dateOfAdmission', 'branch', 'section', 'subsection'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please start over.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestBody = {
        id: userId, // Backend expects 'id' not 'userId'
        firstName: formData.firstName,
        lastName: formData.lastName,
        legalName: formData.legalName,
        rollNumber: formData.rollNumber,
        contactNumber: formData.contactNumber,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        dateOfAdmission: new Date(formData.dateOfAdmission).toISOString(),
        branch: formData.branch,
        section: formData.section,
        subsection: formData.subsection,
      };
      
      console.log("Creating student with userId:", userId);
      console.log("Student request body:", requestBody);
      
      const response = await fetch(`${API_BASE_URL}/student?source=web`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Student Created",
          description: `${formData.firstName} ${formData.lastName} has been created successfully.`
        });
        navigate("/dashboard/admin/students");
      } else {
        const errorMessage = data.message || data.error || "Failed to create student";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Failed to create student:", error);
      toast({
        title: "Error",
        description: error.message || "Network error. Failed to create student profile.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/admin/students" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-heading font-semibold text-lg text-foreground">
                Create New Student - Step {step} of 2
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <User className="h-4 w-4" /> : '1'}
            </div>
            <div className={`flex-1 h-1 rounded ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">
                {step === 1 ? "User Account Details" : "Student Profile Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.edu"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Link to="/dashboard/admin/students">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleStep1Submit} disabled={isSubmitting}>
                      {isSubmitting ? "Creating User..." : "Next: Create Profile"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("firstName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="legalName">Legal Name</Label>
                      <Input
                        id="legalName"
                        placeholder="Full legal name"
                        value={formData.legalName}
                        onChange={(e) => handleInputChange("legalName", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled from first and last name</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number *</Label>
                        <Input
                          id="contactNumber"
                          placeholder="1234567890"
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Academic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber">Roll Number *</Label>
                        <Input
                          id="rollNumber"
                          placeholder="2025CS001"
                          value={formData.rollNumber}
                          onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfAdmission">Date of Admission *</Label>
                        <Input
                          id="dateOfAdmission"
                          type="date"
                          value={formData.dateOfAdmission}
                          onChange={(e) => handleInputChange("dateOfAdmission", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch *</Label>
                        <Select value={formData.branch} onValueChange={(value: string) => handleInputChange("branch", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANCHES.map(branch => (
                              <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section *</Label>
                        <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTIONS.map(section => (
                              <SelectItem key={section} value={section}>{section}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subsection">Subsection *</Label>
                        <Select value={formData.subsection} onValueChange={(value) => handleInputChange("subsection", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subsection" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBSECTIONS.map(subsection => (
                              <SelectItem key={subsection} value={subsection}>{subsection}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back to User Details
                    </Button>
                    <div className="flex gap-3">
                      <Link to="/dashboard/admin/students">
                        <Button variant="ghost">Cancel</Button>
                      </Link>
                      <Button onClick={handleStep2Submit} disabled={isSubmitting}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Creating Student..." : "Create Student"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}