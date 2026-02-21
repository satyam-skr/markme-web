import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { facultyApi } from "@/lib/api";

interface Course {
  id: number;
  courseName: string;
  credits: number;
  description: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  rollNumber: string;
  branch: string;
  section: string;
  subsection: string;
}

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

interface Session {
  id: number;
  sessionDate: string;
  room: string;
  classes: string;
  mlStatus: string;
}

interface AttendanceRecord {
  attendanceId: number;
  sessionId: number;
  attendanceDate: string;
  isPresent: boolean;
  facultyId: number;
  studentId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  session: Session;
  faculty: Faculty;
  course: Course;
  student: Student;
}

interface AttendanceData {
  attendanceByDate: {
    [date: string]: {
      date: string;
      session: Session;
      students: {
        student: Student;
        isPresent: boolean;
      }[];
    };
  };
  studentStats: {
    student: Student;
    totalClasses: number;
    presentCount: number;
    attendancePercentage: string;
  }[];
  overallStats: {
    totalSessions: number;
    totalAttendanceRecords: number;
    totalPresent: number;
    overallAttendancePercentage: number;
  };
}

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceDetail: {
    student: Student;
    date: string;
    isPresent: boolean;
    faculty: Faculty;
    session: Session;
  } | null;
}

function AttendanceDetailModal({ isOpen, onClose, attendanceDetail }: AttendanceDetailModalProps) {
  if (!attendanceDetail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Student</Label>
            <p className="text-sm text-muted-foreground">
              {attendanceDetail.student.firstName} {attendanceDetail.student.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              Roll: {attendanceDetail.student.rollNumber} | 
              {attendanceDetail.student.branch} - {attendanceDetail.student.section}
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Date</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(attendanceDetail.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              })}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Badge 
              className={`ml-2 ${attendanceDetail.isPresent 
                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                : 'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              {attendanceDetail.isPresent ? 'Present' : 'Absent'}
            </Badge>
          </div>

          {attendanceDetail.faculty && attendanceDetail.faculty.firstName && (
            <div>
              <Label className="text-sm font-medium">Marked By</Label>
              <p className="text-sm text-muted-foreground">
                {attendanceDetail.faculty.firstName} {attendanceDetail.faculty.lastName}
              </p>
              {attendanceDetail.faculty.department && (
                <p className="text-xs text-muted-foreground">
                  {attendanceDetail.faculty.department}
                  {attendanceDetail.faculty.user?.email && ` | ${attendanceDetail.faculty.user.email}`}
                </p>
              )}
            </div>
          )}

          {attendanceDetail.session && (
            <div>
              <Label className="text-sm font-medium">Session Details</Label>
              <p className="text-sm text-muted-foreground">
                {attendanceDetail.session.room && `Room: ${attendanceDetail.session.room}`}
                {attendanceDetail.session.classes && ` | Classes: ${attendanceDetail.session.classes}`}
              </p>
              {attendanceDetail.session.sessionDate && (
                <p className="text-xs text-muted-foreground">
                  Session Date: {new Date(attendanceDetail.session.sessionDate).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FacultyCourseAttendance() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [onlyMarkedByMe, setOnlyMarkedByMe] = useState(false);

  // Modal state
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    attendanceDetail: any;
  }>({ isOpen: false, attendanceDetail: null });

  const fetchAttendanceData = async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await facultyApi.getAttendance({
        courseId: parseInt(courseId),
      });
      
      // Transform the backend response to match our frontend structure
      const transformedData = {
        attendanceByDate: data.data.attendanceByDate || {},
        studentStats: data.data.studentStats || [],
        overallStats: data.data.overallStats || {
          totalSessions: 0,
          totalAttendanceRecords: 0,
          totalPresent: 0,
          overallAttendancePercentage: 0,
        },
      };
      
      setAttendanceData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseInfo = async () => {
    try {
      const data = await facultyApi.getCourses();
      const foundCourse = data.data.find((c: Course) => c.id === parseInt(courseId!));
      setCourse(foundCourse || null);
    } catch (err) {
      console.error("Failed to fetch course info:", err);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseInfo();
      fetchAttendanceData();
    }
  }, [courseId]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!attendanceData) return { batches: [], branches: [], sections: [] };

    const batches = new Set<string>();
    const branches = new Set<string>();
    const sections = new Set<string>();

    attendanceData.studentStats.forEach(stat => {
      // Extract batch from roll number - look for 'BT' followed by year digits
      const rollNumber = stat.student.rollNumber;
      const btMatch = rollNumber.match(/BT(\d{2})/i); // Match BT followed by 2 digits
      if (btMatch) {
        const year = btMatch[1]; // Extract the year part (e.g., '23' from 'BT23')
        batches.add(`20${year}`); // Convert to full year (e.g., '2023')
      }
      branches.add(stat.student.branch);
      sections.add(stat.student.section);
    });

    return {
      batches: Array.from(batches).sort(),
      branches: Array.from(branches).sort(),
      sections: Array.from(sections).sort(),
    };
  }, [attendanceData]);

  // Filter students based on selected filters
  const filteredStudents = useMemo(() => {
    if (!attendanceData) return [];

    return attendanceData.studentStats.filter(stat => {
      // Extract batch from roll number - look for 'BT' followed by year digits
      const rollNumber = stat.student.rollNumber;
      const btMatch = rollNumber.match(/BT(\d{2})/i);
      const studentBatch = btMatch ? `20${btMatch[1]}` : '';
      
      if (selectedBatch !== "all" && studentBatch !== selectedBatch) return false;
      if (selectedBranch !== "all" && stat.student.branch !== selectedBranch) return false;
      if (selectedSection !== "all" && stat.student.section !== selectedSection) return false;
      
      return true;
    });
  }, [attendanceData, selectedBatch, selectedBranch, selectedSection]);

  // Get sorted dates
  const sortedDates = useMemo(() => {
    if (!attendanceData) return [];
    return Object.keys(attendanceData.attendanceByDate).sort();
  }, [attendanceData]);

  // Create attendance matrix
  const attendanceMatrix = useMemo(() => {
    if (!attendanceData || !filteredStudents.length) return {};

    const matrix: { [studentId: number]: { [date: string]: { isPresent: boolean; faculty: Faculty; session: Session; student: Student } | null } } = {};

    filteredStudents.forEach(stat => {
      matrix[stat.student.id] = {};
      sortedDates.forEach(date => {
        matrix[stat.student.id][date] = null;
      });
    });

    // Fill the matrix with attendance data
    Object.entries(attendanceData.attendanceByDate).forEach(([date, dateData]) => {
      dateData.students.forEach(studentAttendance => {
        const studentId = studentAttendance.student.id;
        if (matrix[studentId]) {
          matrix[studentId][date] = {
            isPresent: studentAttendance.isPresent,
            faculty: studentAttendance.faculty || dateData.faculty || {} as Faculty,
            session: dateData.session,
            student: studentAttendance.student,
          };
        }
      });
    });

    // Apply "marked by me" filter if needed
    if (onlyMarkedByMe) {
      // Implementation for filtering by current faculty would go here
      // This requires the current faculty ID from auth context
    }

    return matrix;
  }, [attendanceData, filteredStudents, sortedDates, onlyMarkedByMe]);

  const handleCellClick = (student: Student, date: string, attendance: any) => {
    if (!attendance) return;
    
    setDetailModal({
      isOpen: true,
      attendanceDetail: {
        student: attendance.student || student,
        date,
        isPresent: attendance.isPresent,
        faculty: attendance.faculty,
        session: attendance.session,
      },
    });
  };

  const exportToCSV = () => {
    if (!attendanceData || !filteredStudents.length) {
      toast({
        title: "No Data",
        description: "No attendance data available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Roll Number",
      "Student Name",
      "Branch",
      "Section",
      ...sortedDates.map(date => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })),
      "Total Present",
      "Total Classes",
      "Attendance %",
    ];

    const rows = filteredStudents.map(stat => {
      const studentMatrix = attendanceMatrix[stat.student.id] || {};
      const attendanceRow = sortedDates.map(date => {
        const attendance = studentMatrix[date];
        return attendance ? (attendance.isPresent ? "P" : "A") : "";
      });

      return [
        stat.student.rollNumber,
        `${stat.student.firstName} ${stat.student.lastName}`,
        stat.student.branch,
        stat.student.section,
        ...attendanceRow,
        stat.presentCount,
        stat.totalClasses,
        stat.attendancePercentage + "%",
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${course?.courseName?.replace(/\s+/g, '_') || 'course'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `Attendance data exported for ${filteredStudents.length} students`,
    });
  };

  // Group students by branch for display
  const groupedStudents = useMemo(() => {
    const groups: { [branch: string]: typeof filteredStudents } = {};
    
    filteredStudents.forEach(stat => {
      if (!groups[stat.student.branch]) {
        groups[stat.student.branch] = [];
      }
      groups[stat.student.branch].push(stat);
    });

    return groups;
  }, [filteredStudents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchAttendanceData()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/faculty/attendance")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {course?.courseName || "Course Attendance"}
            </h1>
            <p className="text-muted-foreground">
              {course?.description} ({course?.credits} credits)
            </p>
          </div>
        </div>
        <Button onClick={exportToCSV} className="space-x-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {filterOptions.batches.map(batch => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {filterOptions.branches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {filterOptions.sections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="marked-by-me"
                checked={onlyMarkedByMe}
                onCheckedChange={setOnlyMarkedByMe}
              />
              <Label htmlFor="marked-by-me" className="text-sm">
                Only marked by me
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Matrix */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px] border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-background z-10">
                <tr>
                  <th className="border border-border p-3 text-left min-w-[120px] bg-background sticky left-0 z-20">
                    Roll Number
                  </th>
                  <th className="border border-border p-3 text-left min-w-[200px] bg-background sticky left-[120px] z-20">
                    Student Name
                  </th>
                  {sortedDates.map(date => (
                    <th key={date} className="border border-border p-3 text-center min-w-[80px] bg-background">
                      {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                    </th>
                  ))}
                  <th className="border border-border p-3 text-center min-w-[100px] bg-background">
                    Present
                  </th>
                  <th className="border border-border p-3 text-center min-w-[100px] bg-background">
                    Total
                  </th>
                  <th className="border border-border p-3 text-center min-w-[100px] bg-background">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedStudents).map(([branch, students]) => (
                  <React.Fragment key={branch}>
                    {students.map((stat, index) => {
                      const studentMatrix = attendanceMatrix[stat.student.id] || {};
                      
                      return (
                        <tr key={stat.student.id} className="hover:bg-muted/50">
                          <td className="border border-border p-3 sticky left-0 bg-background font-mono text-sm">
                            {stat.student.rollNumber}
                          </td>
                          <td className="border border-border p-3 sticky left-[120px] bg-background">
                            <div>
                              <p className="font-medium">
                                {stat.student.firstName} {stat.student.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {stat.student.branch} - {stat.student.section}
                              </p>
                            </div>
                          </td>
                          {sortedDates.map(date => {
                            const attendance = studentMatrix[date];
                            return (
                              <td 
                                key={date}
                                className="border border-border p-3 text-center relative group cursor-pointer"
                                onClick={() => handleCellClick(stat.student, date, attendance)}
                              >
                                {attendance ? (
                                  <span
                                    className={`inline-block w-6 h-6 leading-6 rounded text-white text-sm font-bold ${
                                      attendance.isPresent 
                                        ? 'bg-blue-500' 
                                        : 'bg-red-500'
                                    }`}
                                  >
                                    {attendance.isPresent ? 'P' : 'A'}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                                {attendance && (
                                  <Eye className="absolute top-2 right-2 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-border p-3 text-center font-medium">
                            {stat.presentCount}
                          </td>
                          <td className="border border-border p-3 text-center font-medium">
                            {stat.totalClasses}
                          </td>
                          <td className="border border-border p-3 text-center font-bold">
                            {stat.attendancePercentage}%
                          </td>
                        </tr>
                      );
                    })}
                    {/* Add gap between branches */}
                    <tr>
                      <td colSpan={sortedDates.length + 5} className="h-4"></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      {attendanceData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-3xl font-bold">{attendanceData.overallStats.totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{filteredStudents.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Present</p>
              <p className="text-3xl font-bold text-blue-600">{attendanceData.overallStats.totalPresent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Overall %</p>
              <p className="text-3xl font-bold text-green-600">
                {attendanceData.overallStats.overallAttendancePercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Detail Modal */}
      <AttendanceDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, attendanceDetail: null })}
        attendanceDetail={detailModal.attendanceDetail}
      />
    </div>
  );
}