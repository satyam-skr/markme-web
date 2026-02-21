import { useState } from "react";
import { ExternalLink, User, Mail, Phone, Calendar, GraduationCap, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

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
  status: "ACTIVE" | "VIEW_ONLY" | "DISABLED";
}

interface Faculty {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  legalName?: string;
  department?: string;
  designation?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  status: "ACTIVE" | "VIEW_ONLY" | "DISABLED";
}

interface ViewProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Student | Faculty | null;
  type: "student" | "faculty";
}

export function ViewProfileModal({ open, onOpenChange, person, type }: ViewProfileModalProps) {
  if (!person) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>;
      case "VIEW_ONLY":
        return <Badge variant="secondary">View Only</Badge>;
      case "DISABLED":
        return <Badge variant="destructive">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isStudent = type === "student";
  const student = isStudent ? person as Student : null;
  const faculty = !isStudent ? person as Faculty : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg">{person.firstName} {person.lastName}</h3>
                <p className="text-sm text-muted-foreground capitalize">{type} Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(person.status)}
              <Link to={`/dashboard/admin/${type === "student" ? "students" : "faculty"}/edit/${person.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Page
                </Button>
              </Link>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                </div>
                <p className="text-sm pl-6">{person.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Legal Name:</span>
                </div>
                <p className="text-sm pl-6">{person.legalName || "Not provided"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Contact:</span>
                </div>
                <p className="text-sm pl-6">{person.contactNumber || "Not provided"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date of Birth:</span>
                </div>
                <p className="text-sm pl-6">{formatDate(person.dateOfBirth)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Student/Faculty Specific Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {isStudent ? "Academic Information" : "Professional Information"}
            </h4>
            
            {isStudent && student ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Roll Number:</span>
                  </div>
                  <p className="text-sm pl-6">{student.rollNumber || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Branch:</span>
                  </div>
                  <p className="text-sm pl-6">{student.branch || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Section:</span>
                  </div>
                  <p className="text-sm pl-6">{student.section || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Subsection:</span>
                  </div>
                  <p className="text-sm pl-6">{student.subsection || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date of Admission:</span>
                  </div>
                  <p className="text-sm pl-6">{formatDate(student.dateOfAdmission)}</p>
                </div>
              </div>
            ) : faculty ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Department:</span>
                  </div>
                  <p className="text-sm pl-6">{faculty.department || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Designation:</span>
                  </div>
                  <p className="text-sm pl-6">{faculty.designation || "Not provided"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date of Joining:</span>
                  </div>
                  <p className="text-sm pl-6">{formatDate(faculty.dateOfJoining)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}