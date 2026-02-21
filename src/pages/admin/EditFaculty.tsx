import { useState, useEffect } from "react";
import { Navigate, useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Schema-based options
const DEPARTMENTS = ["CSE", "ECE", "BS"];

interface Faculty {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  legalName?: string;
  department?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  user?: {
    id: string;
    email: string;
  };
}

export default function EditFaculty() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User form data
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });
  
  // Faculty form data
  const [facultyForm, setFacultyForm] = useState({
    firstName: "",
    lastName: "",
    legalName: "",
    contactNumber: "",
    dateOfBirth: "",
    dateOfJoining: "",
    department: "",
  });
  
  // Track which fields are being edited
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  
  // Track changed fields for submission
  const [changedUserFields, setChangedUserFields] = useState<Set<string>>(new Set());
  const [changedFacultyFields, setChangedFacultyFields] = useState<Set<string>>(new Set());

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  useEffect(() => {
    if (id) {
      loadFaculty();
    }
  }, [id]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/faculty/${id}?source=web`, {
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.data?.faculty) {
        const facultyData = data.data.faculty;
        setFaculty(facultyData);
        
        // Set user form data
        setUserForm({
          email: facultyData.user?.email || facultyData.email || "",
          password: "",
        });
        
        // Set faculty form data
        setFacultyForm({
          firstName: facultyData.firstName || "",
          lastName: facultyData.lastName || "",
          legalName: facultyData.legalName || "",
          contactNumber: facultyData.contactNumber || "",
          dateOfBirth: facultyData.dateOfBirth ? new Date(facultyData.dateOfBirth).toISOString().split('T')[0] : "",
          dateOfJoining: facultyData.dateOfJoining ? new Date(facultyData.dateOfJoining).toISOString().split('T')[0] : "",
          department: facultyData.department || "",
        });
      } else {
        throw new Error(data.message || "Failed to load faculty");
      }
    } catch (error: any) {
      console.error("Failed to load faculty:", error);
      toast({
        title: "Error",
        description: "Failed to load faculty data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEditField = (field: string) => {
    const newEditingFields = new Set(editingFields);
    if (editingFields.has(field)) {
      newEditingFields.delete(field);
    } else {
      newEditingFields.add(field);
    }
    setEditingFields(newEditingFields);
  };

  const handleUserFieldChange = (field: string, value: string) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
    setChangedUserFields(prev => new Set([...prev, field]));
  };

  const handleFacultyFieldChange = (field: string, value: string) => {
    setFacultyForm(prev => ({ ...prev, [field]: value }));
    setChangedFacultyFields(prev => new Set([...prev, field]));
    
    // Auto-generate legal name from first and last name
    if (field === "firstName" || field === "lastName") {
      const firstName = field === "firstName" ? value : facultyForm.firstName;
      const lastName = field === "lastName" ? value : facultyForm.lastName;
      const legalName = `${firstName} ${lastName}`.trim();
      setFacultyForm(prev => ({ ...prev, legalName }));
      setChangedFacultyFields(prev => new Set([...prev, "legalName"]));
    }
  };

  const handleSubmit = async () => {
    if (!faculty) return;
    
    try {
      setIsSubmitting(true);
      
      // Update user fields if any changed
      if (changedUserFields.size > 0) {
        const userUpdateData: any = {};
        if (changedUserFields.has("email") && userForm.email.trim()) {
          userUpdateData.email = userForm.email.trim();
        }
        if (changedUserFields.has("password") && userForm.password.trim()) {
          userUpdateData.password = userForm.password.trim();
        }
        
        if (Object.keys(userUpdateData).length > 0) {
          const userResponse = await fetch(`${API_BASE_URL}/user/me?source=web`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userUpdateData),
          });
          
          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.message || "Failed to update user");
          }
        }
      }
      
      // Update faculty fields if any changed
      if (changedFacultyFields.size > 0) {
        const facultyUpdateData: any = {};
        changedFacultyFields.forEach(field => {
          const value = facultyForm[field as keyof typeof facultyForm];
          if (value !== undefined && value !== "") {
            if (field === "dateOfBirth" || field === "dateOfJoining") {
              facultyUpdateData[field] = new Date(value).toISOString();
            } else {
              facultyUpdateData[field] = value;
            }
          }
        });
        
        if (Object.keys(facultyUpdateData).length > 0) {
          const facultyResponse = await fetch(`${API_BASE_URL}/faculty/${id}?source=web`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(facultyUpdateData),
          });
          
          if (!facultyResponse.ok) {
            const errorData = await facultyResponse.json();
            throw new Error(errorData.message || "Failed to update faculty");
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Faculty updated successfully.",
      });
      
      // Reset tracking
      setChangedUserFields(new Set());
      setChangedFacultyFields(new Set());
      setEditingFields(new Set());
      
      // Reload data
      await loadFaculty();
      
    } catch (error: any) {
      console.error("Failed to update faculty:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update faculty.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/dashboard/admin/faculty" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="font-heading font-semibold text-lg text-foreground">
                  Faculty Not Found
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Faculty with ID {id} not found.</p>
        </main>
      </div>
    );
  }

  const renderEditableField = (
    label: string,
    field: string,
    value: string,
    onChange: (field: string, value: string) => void,
    type: "text" | "email" | "password" | "date" = "text",
    options?: string[]
  ) => {
    const isEditing = editingFields.has(field);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field}>{label}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleEditField(field)}
            className="h-6 w-6 p-0"
          >
            {isEditing ? <X className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
          </Button>
        </div>
        {isEditing ? (
          options ? (
            <Select value={value} onValueChange={(val) => onChange(field, val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field}
              type={type}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )
        ) : (
          <div className="px-3 py-2 bg-muted/50 rounded-md text-sm">
            {type === "password" ? (value ? "••••••••" : "Not set") : (value || "Not provided")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/admin/faculty" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-heading font-semibold text-lg text-foreground">
                Edit Faculty: {faculty.firstName} {faculty.lastName}
              </h1>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (changedUserFields.size === 0 && changedFacultyFields.size === 0)}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                User Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableField("Email Address", "email", userForm.email, handleUserFieldChange, "email")}
                {renderEditableField("Password", "password", userForm.password, handleUserFieldChange, "password")}
              </div>
            </CardContent>
          </Card>

          {/* Faculty Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Faculty Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderEditableField("First Name", "firstName", facultyForm.firstName, handleFacultyFieldChange)}
                  {renderEditableField("Last Name", "lastName", facultyForm.lastName, handleFacultyFieldChange)}
                  {renderEditableField("Legal Name", "legalName", facultyForm.legalName, handleFacultyFieldChange)}
                  {renderEditableField("Contact Number", "contactNumber", facultyForm.contactNumber, handleFacultyFieldChange)}
                  {renderEditableField("Date of Birth", "dateOfBirth", facultyForm.dateOfBirth, handleFacultyFieldChange, "date")}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderEditableField("Department", "department", facultyForm.department, handleFacultyFieldChange, "text", DEPARTMENTS)}
                  {renderEditableField("Date of Joining", "dateOfJoining", facultyForm.dateOfJoining, handleFacultyFieldChange, "date")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}