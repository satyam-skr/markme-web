import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Users, BookOpen, UserCheck, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import AssignCourseModal from '../../components/admin/AssignCourseModal';
import ViewCoursesModal from '../../components/admin/ViewCoursesModal';
import { type CourseAssignment } from '../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FacultyWithAssignments {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  contactNumber: string;
  department: string;
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
  assignmentCount: number;
  assignments: CourseAssignment[];
}

export default function FacultyAssignment() {
  const [faculties, setFaculties] = useState<FacultyWithAssignments[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWithAssignments | null>(null);
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all faculties and assignments using session-based auth
      const [facultiesResponse, assignmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/faculty?source=web`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/course/assignment/?source=web`, {
          credentials: "include",
        })
      ]);

      // Parse responses
      const facultiesData = await facultiesResponse.json();
      const assignmentsData = await assignmentsResponse.json();

      if (facultiesResponse.ok && assignmentsData && facultiesData.success && assignmentsData.success) {
        const faculties = facultiesData.data;
        const assignments = assignmentsData.data.assignments;
        
        // Count assignments for each faculty
        const facultiesWithAssignments: FacultyWithAssignments[] = faculties.map((faculty: any) => {
          const facultyAssignments = assignments.filter(
            (assignment: CourseAssignment) => assignment.facultyId === faculty.id
          );
          
          return {
            id: faculty.id,
            firstName: faculty.firstName,
            lastName: faculty.lastName,
            legalName: faculty.legalName,
            contactNumber : faculty.contactNumber,
            user: faculty.user || {},
            department: faculty.department,
            designation: faculty.designation || 'Faculty',
            assignmentCount: facultyAssignments.length,
            assignments: facultyAssignments,
          };
        });

        setFaculties(facultiesWithAssignments);
        setAssignments(assignments);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch faculty assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    // Search functionality is handled by filtering below
  };

  const handleAssignCourse = (faculty: FacultyWithAssignments) => {
    setSelectedFaculty(faculty);
    setShowAssignModal(true);
  };

  const handleViewCourses = (faculty: FacultyWithAssignments) => {
    setSelectedFaculty(faculty);
    setShowViewModal(true);
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedFaculty(null);
    fetchData();
    toast({
      title: 'Success',
      description: 'Course assigned successfully',
    });
  };

  // Get unique departments for filter
  const departments = [...new Set(faculties.map(f => f.department))];

  // Filter faculties
  const filteredFaculties = faculties.filter(faculty => {
    const matchesSearch = 
      faculty.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || faculty.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Course Assignments</h1>
          <p className="text-muted-foreground">
            Manage course assignments for faculty members
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold">{faculties.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Assigned Faculty</p>
              <p className="text-2xl font-bold">{faculties.filter(f => f.assignmentCount > 0).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Faculty Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Faculty Course Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{faculty.firstName} {faculty.lastName}</p>
                        <p className="text-sm text-muted-foreground">{faculty.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {faculty.user?.email || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{faculty.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {faculty.contactNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                      {faculty.assignmentCount} Course{faculty.assignmentCount !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={faculty.user?.status === 'active' ? 'default' : 'secondary'}>
                      {faculty.user?.status || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleViewCourses(faculty)}
                          disabled={faculty.assignmentCount === 0}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Courses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignCourse(faculty)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Assign Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFaculties.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No faculty found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || departmentFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No faculty members available.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AssignCourseModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        faculty={selectedFaculty}
        onSuccess={handleAssignSuccess}
      />

      <ViewCoursesModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        faculty={selectedFaculty}
        assignments={selectedFaculty?.assignments || []}
        onRefresh={fetchData}
      />
    </div>
  );
}