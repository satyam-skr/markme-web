import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
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

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  rollNumber: string;
  contactNumber: string;
  branch: string;
  section: string;
  subsection: string;
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
}

interface CourseRegistration {
  registrationId: number;
  academicYear: string;
  isEvenSemester: boolean;
  studentId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  student: Student;
  course: Course;
}

export default function StudentCourses() {
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/student/me/course?source=web`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRegistrations(data.data);
      } else {
        throw new Error('Failed to fetch student data');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!loading && registrations.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No courses registered</h3>
              <p className="mt-1 text-sm text-muted-foreground">You haven't registered for any courses yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCredits = registrations.reduce((sum, reg) => sum + reg.course.credits, 0);
  const studentInfo = registrations.length > 0 ? registrations[0].student : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Registered Courses</h1>
          <p className="text-muted-foreground">
            View your enrolled courses and academic progress
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{registrations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
              <p className="text-2xl font-bold">{totalCredits}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Branch</p>
              <p className="text-2xl font-bold">{studentInfo?.branch || '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Section</p>
              <p className="text-2xl font-bold">{studentInfo ? `${studentInfo.section}-${studentInfo.subsection}` : '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration ID</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.registrationId}>
                    <TableCell className="font-medium">{registration.registrationId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{registration.course.courseName}</div>
                          <div className="text-sm text-muted-foreground">{registration.course.description || 'No description available'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-600 text-blue-600">
                        {registration.course.credits} Credits
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(registration.academicYear).getFullYear()}-{new Date(registration.academicYear).getFullYear() + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={registration.isEvenSemester ? "default" : "outline"}>
                        {registration.isEvenSemester ? "Even" : "Odd"} Semester
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Enrolled</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No courses registered</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven't registered for any courses yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}