import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users, BookOpen, Calendar, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { facultyApi, courseApi, courseAssignmentApi } from "@/lib/api";

interface Faculty {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  department: string;
  user: {
    email: string;
  };
}

interface Course {
  id: number;
  courseName: string;
  credits: number;
  description: string;
}

interface CourseAssignment {
  assignmentId: number;
  academicYear: string;
  isEvenSemester: boolean;
  facultyId: number;
  courseId: number;
  faculty: Faculty;
  course: Course;
  isActive: boolean;
}

export default function AdminAttendance() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all faculties
      const facultiesData = await facultyApi.getAllFaculties();
      setFaculties(facultiesData.data || []);

      // Fetch all courses
      const coursesData = await courseApi.getAllCourses();
      setCourses(coursesData.data.courses || []);

      // Fetch all course assignments
      const assignmentsData = await courseAssignmentApi.getAllAssignments();
      setAssignments(assignmentsData.data.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter assignments based on selected faculty and course
  const filteredAssignments = assignments.filter(assignment => {
    if (selectedFaculty !== "all" && assignment.facultyId !== parseInt(selectedFaculty)) {
      return false;
    }
    if (selectedCourse !== "all" && assignment.courseId !== parseInt(selectedCourse)) {
      return false;
    }
    return true;
  });

  // Group assignments by faculty
  const groupedAssignments = filteredAssignments.reduce((groups, assignment) => {
    const facultyId = assignment.facultyId;
    if (!groups[facultyId]) {
      groups[facultyId] = {
        faculty: assignment.faculty,
        assignments: [],
      };
    }
    groups[facultyId].assignments.push(assignment);
    return groups;
  }, {} as { [key: number]: { faculty: Faculty; assignments: CourseAssignment[] } });

  const handleAttendanceClick = (facultyId: number, courseId: number) => {
    navigate(`/dashboard/admin/attendance/faculty/${facultyId}/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Attendance Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading attendance data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Attendance Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Attendance Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View and manage attendance records for all faculty and courses
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Filter Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Faculty</label>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Faculties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.firstName} {faculty.lastName} ({faculty.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.courseName} ({course.credits} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Assignments by Faculty */}
      {Object.keys(groupedAssignments).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No course assignments found matching the selected filters.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedAssignments).map(([facultyId, data]) => (
          <Card key={facultyId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      {data.faculty.firstName} {data.faculty.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {data.faculty.department} | {data.faculty.user.email}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {data.assignments.length} course{data.assignments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.assignments.map((assignment) => (
                  <div
                    key={assignment.assignmentId}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                    onClick={() => handleAttendanceClick(assignment.facultyId, assignment.courseId)}
                  >
                    <div className="flex items-center space-x-4">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {assignment.course.courseName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.course.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Credits: {assignment.course.credits} | 
                          Academic Year: {assignment.academicYear} |
                          Semester: {assignment.isEvenSemester ? 'Even' : 'Odd'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:border-primary group-hover:text-primary transition-colors"
                      >
                        View Attendance
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Stats */}
      {assignments.length > 0 && (
        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Faculties</p>
              <p className="text-3xl font-bold text-foreground">{faculties.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-3xl font-bold text-foreground">{courses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Active Assignments</p>
              <p className="text-3xl font-bold text-foreground">{assignments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Filtered Results</p>
              <p className="text-3xl font-bold text-foreground">{filteredAssignments.length}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}