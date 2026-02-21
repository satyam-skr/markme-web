import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, UserX, Trash2, Shield, Info, BookOpen, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeactivateModal } from "./DeactivateModal";
import { DeleteUserModal } from "./DeleteConfirmModal";
import { ChangeRoleModal } from "./ChangeRoleModal";
import { ViewProfileModal } from "./ViewProfileModal";
import ViewCoursesModal from "./ViewCoursesModal";
import { ManagePhotosModal } from "./ManagePhotosModal";
import { toast } from "@/hooks/use-toast";
import { courseRegistrationApi } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  legalName?: string;
  rollNumber: string;
  branch: string;
  section: string;
  subsection?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfAdmission?: string;
  status: "ACTIVE" | "VIEW_ONLY" | "DISABLED";
  hasProfile: boolean;
  user?: any;
}

// Fallback mock data for development when API is not available
const mockStudents: Student[] = [
  { id: "1", email: "john.doe@markme.edu", firstName: "John", lastName: "Doe", legalName: "John Doe", rollNumber: "2025CS001", branch: "CSE", section: "A", subsection: "1", status: "ACTIVE", hasProfile: true },
  { id: "2", email: "jane.smith@markme.edu", firstName: "Jane", lastName: "Smith", legalName: "Jane Smith", rollNumber: "2025ECE002", branch: "ECE", section: "B", subsection: "2", status: "ACTIVE", hasProfile: true },
  { id: "3", email: "bob.wilson@markme.edu", firstName: "Bob", lastName: "Wilson", legalName: "Bob Wilson", rollNumber: "2025AIML001", branch: "AIML", section: "C", subsection: "3", status: "VIEW_ONLY", hasProfile: true },
  { id: "4", email: "alice.johnson@markme.edu", firstName: "Alice", lastName: "Johnson", legalName: "Alice Johnson", rollNumber: "2025HCIGT001", branch: "HCIGT", section: "A", subsection: "1", status: "ACTIVE", hasProfile: false },
  { id: "5", email: "charlie.brown@markme.edu", firstName: "Charlie", lastName: "Brown", legalName: "Charlie Brown", rollNumber: "2025DSA003", branch: "DSA", section: "B", subsection: "2", status: "DISABLED", hasProfile: true },
];

export function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deactivateStudent, setDeactivateStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [changeRoleStudent, setChangeRoleStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [viewCoursesStudent, setViewCoursesStudent] = useState<Student | null>(null);
  const [managePhotosStudent, setManagePhotosStudent] = useState<Student | null>(null);
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === "all" || student.branch === branchFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Load students data on component mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/student?source=web`;
        if (branchFilter !== "all") {
          url += `&branch=${branchFilter}`;
        }
        
        const response = await fetch(url, {
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Transform API response to match component interface
          const transformedStudents = data.data.map((s: any) => ({
            id: s.id?.toString() || s.user?.id?.toString(),
            email: s.user?.email || s.email,
            firstName: s.firstName,
            lastName: s.lastName,
            legalName: s.legalName,
            rollNumber: s.rollNumber,
            branch: s.branch,
            section: s.section,
            subsection: s.subsection,
            contactNumber: s.contactNumber,
            dateOfBirth: s.dateOfBirth,
            dateOfAdmission: s.dateOfAdmission,
            status: s.user?.status || "ACTIVE",
            hasProfile: true, // API data implies profile exists
            user: s.user,
          }));
          setStudents(transformedStudents);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Failed to load students:", error);
        // Fallback to mock data for development
        setStudents(mockStudents);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [branchFilter]);

  const handleDeactivate = async (status: "VIEW_ONLY" | "DISABLED") => {
    if (!deactivateStudent) return;

    try {
      const userId = deactivateStudent.user?.id || deactivateStudent.id;
      await fetch(`${API_BASE_URL}/user/${userId}?source=web`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      setStudents((prev) =>
        prev.map((s) => (s.id === deactivateStudent.id ? { ...s, status } : s))
      );
      
      toast({
        title: "Status updated",
        description: `${deactivateStudent.firstName} ${deactivateStudent.lastName}'s account has been ${status === "VIEW_ONLY" ? "set to view-only" : "deactivated"}.`,
      });
    } catch (error) {
      console.error("Failed to update student status:", error);
      toast({
        title: "Error",
        description: "Failed to update student status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeactivateStudent(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteStudent) return;

    try {
      const response = await fetch(`${API_BASE_URL}/student/${deleteStudent.id}?source=web`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student");
      }
      
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudent.id));
      
      toast({
        title: "Student deleted",
        description: `${deleteStudent.firstName} ${deleteStudent.lastName} has been permanently deleted.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteStudent(null);
    }
  };

  const handleRoleChange = async (newRole: "FACULTY" | "ADMIN") => {
    if (!changeRoleStudent) return;

    try {
      // First delete the student profile
      const deleteResponse = await fetch(`${API_BASE_URL}/student/${changeRoleStudent.id}?source=web`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || "Failed to delete student profile");
      }
      
      // Then change the user role
      const userId = changeRoleStudent.user?.id || changeRoleStudent.id;
      const updateResponse = await fetch(`${API_BASE_URL}/user/${userId}?source=web`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Failed to update user role");
      }
      
      setStudents((prev) => prev.filter((s) => s.id !== changeRoleStudent.id));
      
      toast({
        title: "Role changed",
        description: `${changeRoleStudent.firstName} ${changeRoleStudent.lastName}'s role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Failed to change role:", error);
      toast({
        title: "Error",
        description: "Failed to change role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangeRoleStudent(null);
    }
  };

  const handleViewCourses = async (student: Student) => {
    try {
      setViewCoursesStudent(student);
      // Fetch registrations for this student
      const response = await courseRegistrationApi.getAllRegistrations({ studentId: parseInt(student.id) });
      if (response.success) {
        setStudentRegistrations(response.data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course registrations.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>;
      case "VIEW_ONLY":
        return <Badge variant="secondary">View Only</Badge>;
      case "DISABLED":
        return <Badge variant="destructive">Disabled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* API Failure Message */}
      {usingDemoData && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to the server. Displaying demo student data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">{filteredStudents.length} students found</p>
        </div>
        <Link to="/dashboard/admin/students/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or roll number..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
            <SelectItem value="ECE">Electronics & Communication</SelectItem>
            <SelectItem value="AIML">AI & Machine Learning</SelectItem>
            <SelectItem value="HCIGT">Human Computer Interaction & Game Technology</SelectItem>
            <SelectItem value="DSA">Data Science & Analytics</SelectItem>
            <SelectItem value="IOT">Internet of Things</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="VIEW_ONLY">View Only</SelectItem>
            <SelectItem value="DISABLED">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Roll Number</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Branch</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Profile</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Loading student data...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {student.firstName} {student.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{student.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {student.branch} - {student.section}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(student.status)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {student.hasProfile ? (
                        <Badge variant="outline" className="text-primary border-primary/30">Has Profile</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">No Profile</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewStudent(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewCourses(student)}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Courses
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setManagePhotosStudent(student)}>
                            <Camera className="h-4 w-4 mr-2" />
                            Manage Photos
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/admin/students/edit/${student.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setChangeRoleStudent(student)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeactivateStudent(student)}>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteStudent(student)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      <DeactivateModal
        open={!!deactivateStudent}
        onOpenChange={() => setDeactivateStudent(null)}
        userName={deactivateStudent ? `${deactivateStudent.firstName} ${deactivateStudent.lastName}` : ""}
        onConfirm={handleDeactivate}
      />
      <DeleteUserModal
        open={!!deleteStudent}
        onOpenChange={() => setDeleteStudent(null)}
        userName={deleteStudent ? `${deleteStudent.firstName} ${deleteStudent.lastName}` : ""}
        onConfirm={handleDelete}
      />
      <ChangeRoleModal
        open={!!changeRoleStudent}
        onOpenChange={() => setChangeRoleStudent(null)}
        userName={changeRoleStudent ? `${changeRoleStudent.firstName} ${changeRoleStudent.lastName}` : ""}
        currentRole="STUDENT"
        onConfirm={handleRoleChange}
      />
      <ViewProfileModal
        open={!!viewStudent}
        onOpenChange={() => setViewStudent(null)}
        person={viewStudent}
        type="student"
      />
      <ViewCoursesModal
        isOpen={!!viewCoursesStudent}
        onClose={() => setViewCoursesStudent(null)}
        student={viewCoursesStudent}
        registrations={studentRegistrations}
        onRefresh={() => {
          if (viewCoursesStudent) {
            handleViewCourses(viewCoursesStudent);
          }
        }}
      />
      <ManagePhotosModal
        open={!!managePhotosStudent}
        onOpenChange={() => setManagePhotosStudent(null)}
        student={managePhotosStudent}
      />
    </div>
  );
}
