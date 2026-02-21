import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, UserX, Trash2, Shield, Info, BookOpen } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { courseAssignmentApi } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Faculty {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  legalName?: string;
  department: string;
  designation?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  status: "ACTIVE" | "VIEW_ONLY" | "DISABLED";
  hasProfile: boolean;
  user?: any;
}

// Fallback mock data for development when API is not available
const mockFaculty: Faculty[] = [
  { id: "1", email: "dr.smith@markme.edu", firstName: "Dr. Sarah", lastName: "Smith", legalName: "Dr. Sarah Smith", department: "CSE", designation: "Professor", status: "ACTIVE", hasProfile: true },
  { id: "2", email: "dr.johnson@markme.edu", firstName: "Dr. Michael", lastName: "Johnson", legalName: "Dr. Michael Johnson", department: "ECE", designation: "Associate Professor", status: "ACTIVE", hasProfile: true },
  { id: "3", email: "prof.williams@markme.edu", firstName: "Prof. Emily", lastName: "Williams", legalName: "Prof. Emily Williams", department: "BS", designation: "Assistant Professor", status: "VIEW_ONLY", hasProfile: true },
  { id: "4", email: "dr.brown@markme.edu", firstName: "Dr. James", lastName: "Brown", legalName: "Dr. James Brown", department: "CSE", designation: "Professor", status: "ACTIVE", hasProfile: false },
];

export function FacultyList() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deactivateFaculty, setDeactivateFaculty] = useState<Faculty | null>(null);
  const [deleteFaculty, setDeleteFaculty] = useState<Faculty | null>(null);
  const [changeRoleFaculty, setChangeRoleFaculty] = useState<Faculty | null>(null);
  const [viewFaculty, setViewFaculty] = useState<Faculty | null>(null);
  const [viewCoursesFaculty, setViewCoursesFaculty] = useState<Faculty | null>(null);
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.firstName.toLowerCase().includes(search.toLowerCase()) ||
      f.lastName.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "all" || f.department === deptFilter;
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Load faculty data on component mount
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/faculty?source=web&department=${deptFilter !== "all" ? deptFilter : ""}`, {
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Transform API response to match component interface
          const transformedFaculty = data.data.map((f: any) => ({
            id: f.id?.toString() || f.user?.id?.toString(),
            email: f.user?.email || f.email,
            firstName: f.firstName,
            lastName: f.lastName,
            legalName: f.legalName,
            department: f.department,
            designation: f.designation || "Faculty",
            contactNumber: f.contactNumber,
            dateOfBirth: f.dateOfBirth,
            dateOfJoining: f.dateOfJoining,
            status: f.user?.status || "ACTIVE",
            hasProfile: true, // API data implies profile exists
            user: f.user,
          }));
          setFaculty(transformedFaculty);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Failed to load faculty:", error);
        // Fallback to mock data for development
        setFaculty(mockFaculty);
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    loadFaculty();
  }, [deptFilter]);

  const handleDeactivate = async (status: "VIEW_ONLY" | "DISABLED") => {
    if (!deactivateFaculty) return;

    try {
      const userId = deactivateFaculty.user?.id || deactivateFaculty.id;
      await fetch(`${API_BASE_URL}/user/${userId}?source=web`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      setFaculty((prev) =>
        prev.map((f) => (f.id === deactivateFaculty.id ? { ...f, status } : f))
      );
      
      toast({
        title: "Status updated",
        description: `${deactivateFaculty.firstName} ${deactivateFaculty.lastName}'s account has been ${status === "VIEW_ONLY" ? "set to view-only" : "deactivated"}.`,
      });
    } catch (error) {
      console.error("Failed to update faculty status:", error);
      toast({
        title: "Error",
        description: "Failed to update faculty status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeactivateFaculty(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteFaculty) return;

    try {
      const response = await fetch(`${API_BASE_URL}/faculty/${deleteFaculty.id}?source=web`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete faculty");
      }
      
      setFaculty((prev) => prev.filter((f) => f.id !== deleteFaculty.id));
      
      toast({
        title: "Faculty deleted",
        description: `${deleteFaculty.firstName} ${deleteFaculty.lastName} has been permanently deleted.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to delete faculty:", error);
      toast({
        title: "Error",
        description: "Failed to delete faculty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteFaculty(null);
    }
  };

  const handleRoleChange = async (newRole: "STUDENT" | "ADMIN") => {
    if (!changeRoleFaculty) return;

    try {
      // First delete the faculty profile
      const deleteResponse = await fetch(`${API_BASE_URL}/faculty/${changeRoleFaculty.id}?source=web`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || "Failed to delete faculty profile");
      }
      
      // Then change the user role
      const userId = changeRoleFaculty.user?.id || changeRoleFaculty.id;
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
      
      setFaculty((prev) => prev.filter((f) => f.id !== changeRoleFaculty.id));
      
      toast({
        title: "Role changed",
        description: `${changeRoleFaculty.firstName} ${changeRoleFaculty.lastName}'s role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Failed to change role:", error);
      toast({
        title: "Error",
        description: "Failed to change role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangeRoleFaculty(null);
    }
  };

  const handleViewCourses = async (faculty: Faculty) => {
    try {
      setViewCoursesFaculty(faculty);
      // Fetch assignments for this faculty
      const response = await courseAssignmentApi.getAllAssignments({ facultyId: parseInt(faculty.id) });
      if (response.success) {
        setFacultyAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course assignments.",
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
            Unable to connect to the server. Displaying demo faculty data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">Faculty</h2>
          <p className="text-sm text-muted-foreground">{filteredFaculty.length} faculty members found</p>
        </div>
        <Link to="/dashboard/admin/faculty/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
            <SelectItem value="ECE">Electronics & Communication</SelectItem>
            <SelectItem value="BS">Basic Sciences</SelectItem>
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
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Designation</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Profile</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Loading faculty data...
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {f.firstName} {f.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{f.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {f.department}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {f.designation || 'Faculty'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(f.status)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {f.hasProfile ? (
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
                          <DropdownMenuItem onClick={() => setViewFaculty(f)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewCourses(f)}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Courses
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/admin/faculty/edit/${f.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setChangeRoleFaculty(f)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeactivateFaculty(f)}>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteFaculty(f)}
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

        {!loading && filteredFaculty.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No faculty members found matching your criteria.</p>
          </div>
        )}
      </div>

      <DeactivateModal
        open={!!deactivateFaculty}
        onOpenChange={() => setDeactivateFaculty(null)}
        userName={deactivateFaculty ? `${deactivateFaculty.firstName} ${deactivateFaculty.lastName}` : ""}
        onConfirm={handleDeactivate}
      />
      <DeleteUserModal
        open={!!deleteFaculty}
        onOpenChange={() => setDeleteFaculty(null)}
        userName={deleteFaculty ? `${deleteFaculty.firstName} ${deleteFaculty.lastName}` : ""}
        onConfirm={handleDelete}
      />
      <ChangeRoleModal
        open={!!changeRoleFaculty}
        onOpenChange={() => setChangeRoleFaculty(null)}
        userName={changeRoleFaculty ? `${changeRoleFaculty.firstName} ${changeRoleFaculty.lastName}` : ""}
        currentRole="FACULTY"
        onConfirm={handleRoleChange}
      />
      <ViewProfileModal
        open={!!viewFaculty}
        onOpenChange={() => setViewFaculty(null)}
        person={viewFaculty}
        type="faculty"
      />
      <ViewCoursesModal
        isOpen={!!viewCoursesFaculty}
        onClose={() => setViewCoursesFaculty(null)}
        faculty={viewCoursesFaculty}
        assignments={facultyAssignments}
        onRefresh={() => {
          if (viewCoursesFaculty) {
            handleViewCourses(viewCoursesFaculty);
          }
        }}
      />
    </div>
  );
}
