import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, BookOpen, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Course {
  id: number;
  courseName: string;
  description: string;
  credits: number;
}

interface CourseRegistration {
  registrationId: number;
  academicYear: string;
  isEvenSemester: boolean;
  studentId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  course: Course;
}

interface AttendanceStats {
  totalAttendance: number;
  totalPresent: number;
  attendancePercentage: number;
}

interface CourseAttendance {
  course: Course;
  stats: AttendanceStats;
}

export default function StudentAttendance() {
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  const [courseAttendances, setCourseAttendances] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    totalPresent: 0,
    overallPercentage: 0
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/me/course?source=web`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourseRegistrations(data.data);
        return data.data;
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course registrations',
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchAttendanceForCourse = async (courseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/me/attendance?courseId=${courseId}&source=web`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data.stats;
      } else {
        console.warn(`Failed to fetch attendance for course ${courseId}`);
        return {
          totalAttendance: 0,
          totalPresent: 0,
          attendancePercentage: 0
        };
      }
    } catch (error) {
      console.warn(`Error fetching attendance for course ${courseId}:`, error);
      return {
        totalAttendance: 0,
        totalPresent: 0,
        attendancePercentage: 0
      };
    }
  };

  const fetchAllAttendances = async () => {
    try {
      setLoading(true);
      
      // First fetch all courses
      const courses = await fetchCourses();
      
      if (courses.length > 0) {
        // Fetch attendance for each course
        const attendancePromises = courses.map(async (registration: CourseRegistration) => {
          const stats = await fetchAttendanceForCourse(registration.courseId);
          return {
            course: registration.course,
            stats
          };
        });

        const attendances = await Promise.all(attendancePromises);
        setCourseAttendances(attendances);

        // Calculate overall stats
        const totalClasses = attendances.reduce((sum, att) => sum + att.stats.totalAttendance, 0);
        const totalPresent = attendances.reduce((sum, att) => sum + att.stats.totalPresent, 0);
        const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100) : 0;

        setOverallStats({
          totalClasses,
          totalPresent,
          overallPercentage: Math.round(overallPercentage * 100) / 100
        });
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendances();
  }, []);

  const handleCourseClick = (courseId: number) => {
    navigate(`/student/attendance/${courseId}`);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">
            Track your attendance across all registered courses
          </p>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
              <p className="text-3xl font-bold text-foreground">{overallStats.overallPercentage}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Classes Attended</p>
              <p className="text-3xl font-bold text-foreground">{overallStats.totalPresent}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
              <p className="text-3xl font-bold text-foreground">{overallStats.totalClasses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course-wise Attendance */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course-wise Attendance
        </h2>
        
        {courseAttendances.length > 0 ? (
          <div className="space-y-3">
            {courseAttendances.map((attendance, index) => (
              <div 
                key={attendance.course.id} 
                className="py-3 px-4 cursor-pointer transition-colors rounded-md space-y-2"
                onClick={() => handleCourseClick(attendance.course.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{attendance.course.courseName}</span>
                      <span className="text-blue-600 hover:text-blue-800 text-sm ">View more &#8594;</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={attendance.stats.attendancePercentage >= 75 ? "default" : "destructive"}
                          className="text-sm font-medium"
                        >
                          {attendance.stats.attendancePercentage}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {attendance.course.credits} Credits
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {attendance.stats.totalPresent}/{attendance.stats.totalAttendance} classes
                      </p>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={attendance.stats.attendancePercentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No attendance data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No attendance records found for your courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}