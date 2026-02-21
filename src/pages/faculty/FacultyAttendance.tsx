import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { facultyApi } from "@/lib/api";

interface Course {
  id: number;
  courseName: string;
  credits: number;
  description: string;
  courseCode?: string;
}

interface FacultyCourseAssignment {
  id: number;
  course: Course;
  assignedAt: string;
  isActive: boolean;
}

export default function FacultyAttendance() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<FacultyCourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await facultyApi.getCourses();
      setCourses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch your courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (courseId: number) => {
    navigate(`/dashboard/faculty/attendance/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading your courses...</span>
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
            <CardTitle className="font-heading">My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchCourses}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Courses Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            My Courses
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any course to view detailed attendance records
          </p>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No courses assigned to you yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => handleCourseClick(assignment.course.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {assignment.course.courseCode || `COURSE-${assignment.course.id}`} - {assignment.course.courseName}
                      </h3>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assignment.course.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Credits: {assignment.course.credits} | 
                      Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
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
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {courses.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-3xl font-bold text-foreground">{courses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-3xl font-bold text-foreground">
                {courses.filter(c => c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-3xl font-bold text-foreground">
                {courses.reduce((sum, c) => sum + c.course.credits, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}