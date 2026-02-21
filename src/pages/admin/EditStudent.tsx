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
const BRANCHES = ["CSE", "ECE", "AIML", "HCIGT", "DSA", "IOT"];
const SECTIONS = ["A", "B", "C"];
const SUBSECTIONS = ["1", "2", "3"];

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  legalName?: string;
  rollNumber?: string;
  branch?: string;
  section?: string;
  subsection?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfAdmission?: string;
  user?: {
    id: string;
    email: string;
  };
}

export default function EditStudent() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User form data
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });
  
  // Student form data
  const [studentForm, setStudentForm] = useState({
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
  
  // Track which fields are being edited
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  
  // Track changed fields for submission
  const [changedUserFields, setChangedUserFields] = useState<Set<string>>(new Set());
  const [changedStudentFields, setChangedStudentFields] = useState<Set<string>>(new Set());

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/student/${id}?source=web`, {
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.data?.student) {
        const studentData = data.data.student;
        setStudent(studentData);
        
        // Set user form data
        setUserForm({
          email: studentData.user?.email || studentData.email || "",
          password: "",
        });
        
        // Set student form data
        setStudentForm({
          firstName: studentData.firstName || "",
          lastName: studentData.lastName || "",
          legalName: studentData.legalName || "",
          rollNumber: studentData.rollNumber || "",
          contactNumber: studentData.contactNumber || "",
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString().split('T')[0] : "",
          dateOfAdmission: studentData.dateOfAdmission ? new Date(studentData.dateOfAdmission).toISOString().split('T')[0] : "",
          branch: studentData.branch || "",
          section: studentData.section || "",
          subsection: studentData.subsection || "",
        });
      } else {
        throw new Error(data.message || "Failed to load student");
      }
    } catch (error: any) {
      console.error("Failed to load student:", error);
      toast({
        title: "Error",
        description: "Failed to load student data.",
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

  const handleStudentFieldChange = (field: string, value: string) => {
    setStudentForm(prev => ({ ...prev, [field]: value }));
    setChangedStudentFields(prev => new Set([...prev, field]));
    
    // Auto-generate legal name from first and last name
    if (field === "firstName" || field === "lastName") {
      const firstName = field === "firstName" ? value : studentForm.firstName;
      const lastName = field === "lastName" ? value : studentForm.lastName;
      const legalName = `${firstName} ${lastName}`.trim();
      setStudentForm(prev => ({ ...prev, legalName }));
      setChangedStudentFields(prev => new Set([...prev, "legalName"]));
    }
  };

  const handleSubmit = async () => {
    if (!student) return;
    
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
      
      // Update student fields if any changed
      if (changedStudentFields.size > 0) {
        const studentUpdateData: any = {};
        changedStudentFields.forEach(field => {
          const value = studentForm[field as keyof typeof studentForm];
          if (value !== undefined && value !== "") {
            if (field === "dateOfBirth" || field === "dateOfAdmission") {
              studentUpdateData[field] = new Date(value).toISOString();
            } else {
              studentUpdateData[field] = value;
            }
          }
        });
        
        if (Object.keys(studentUpdateData).length > 0) {
          const studentResponse = await fetch(`${API_BASE_URL}/student/${id}?source=web`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(studentUpdateData),
          });
          
          if (!studentResponse.ok) {
            const errorData = await studentResponse.json();
            throw new Error(errorData.message || "Failed to update student");
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Student updated successfully.",
      });
      
      // Reset tracking
      setChangedUserFields(new Set());
      setChangedStudentFields(new Set());
      setEditingFields(new Set());
      
      // Reload data
      await loadStudent();
      
    } catch (error: any) {
      console.error("Failed to update student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student.",
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

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/dashboard/admin/students" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="font-heading font-semibold text-lg text-foreground">
                  Student Not Found
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Student with ID {id} not found.</p>
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
              <Link to="/dashboard/admin/students" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-heading font-semibold text-lg text-foreground">
                Edit Student: {student.firstName} {student.lastName}
              </h1>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (changedUserFields.size === 0 && changedStudentFields.size === 0)}
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

          {/* Student Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Student Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderEditableField("First Name", "firstName", studentForm.firstName, handleStudentFieldChange)}
                  {renderEditableField("Last Name", "lastName", studentForm.lastName, handleStudentFieldChange)}
                  {renderEditableField("Legal Name", "legalName", studentForm.legalName, handleStudentFieldChange)}
                  {renderEditableField("Contact Number", "contactNumber", studentForm.contactNumber, handleStudentFieldChange)}
                  {renderEditableField("Date of Birth", "dateOfBirth", studentForm.dateOfBirth, handleStudentFieldChange, "date")}
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderEditableField("Roll Number", "rollNumber", studentForm.rollNumber, handleStudentFieldChange)}
                  {renderEditableField("Date of Admission", "dateOfAdmission", studentForm.dateOfAdmission, handleStudentFieldChange, "date")}
                  {renderEditableField("Branch", "branch", studentForm.branch, handleStudentFieldChange, "text", BRANCHES)}
                  {renderEditableField("Section", "section", studentForm.section, handleStudentFieldChange, "text", SECTIONS)}
                  {renderEditableField("Subsection", "subsection", studentForm.subsection, handleStudentFieldChange, "text", SUBSECTIONS)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}