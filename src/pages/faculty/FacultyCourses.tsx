import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Course {
  id: number;
  courseName: string;
  description: string;
  credits: number;
}

interface Faculty {
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
}

interface CourseAssignment {
  assignmentId: number;
  academicYear: string;
  isEvenSemester: boolean;
  facultyId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  faculty: Faculty;
  course: Course;
}

export default function FacultyCourses() {
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const formatAcademicYear = (academicYear: string) => {
    const date = new Date(academicYear);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    // If month is July (7) or later, it's the start of academic year
    // Otherwise, it's the end of previous academic year
    if (month >= 7) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const fetchCourseAssignments = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/faculty/me/course?source=web`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourseAssignments(data.data);
      } else {
        throw new Error('Failed to fetch course assignments');
      }
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!courseAssignments.length && !loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No courses assigned</h3>
              <p className="mt-1 text-sm text-muted-foreground">No courses have been assigned to you yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const facultyInfo = courseAssignments.length > 0 ? courseAssignments[0].faculty : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Course Assignments</h1>
          <p className="text-muted-foreground">
            View your assigned courses and teaching responsibilities
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold">{courseAssignments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="text-2xl font-bold">{facultyInfo?.department || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
              <p className="text-2xl font-bold">{courseAssignments.length > 0 ? formatAcademicYear(courseAssignments[0].academicYear) : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseAssignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Assigned Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseAssignments.map((assignment) => (
                  <TableRow key={assignment.assignmentId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.course.courseName}</div>
                        <div className="text-xs text-muted-foreground">ID: {assignment.course.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground truncate">
                        {assignment.course.description || 'No description available'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{assignment.course.credits} Credits</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatAcademicYear(assignment.academicYear)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.isEvenSemester ? "default" : "outline"}>
                        {assignment.isEvenSemester ? 'Even' : 'Odd'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No courses assigned</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No courses have been assigned to you yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}