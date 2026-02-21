import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Filter, CheckCircle, XCircle, User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Session {
  id: number;
  sessionDate: string;
  room: string;
  classes: number;
  mlStatus: string;
  createdAt: string;
  updatedAt: string;
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

interface AttendanceStats {
  totalAttendance: number;
  totalPresent: number;
  attendancePercentage: number;
}

interface AttendanceData {
  attendanceRecords: AttendanceRecord[];
  stats: AttendanceStats;
}

export default function StudentAttendanceDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent">("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAttendanceDetails = async () => {
    try {
      setLoading(true);
      
      let url = `${API_BASE_URL}/student/me/attendance?courseId=${courseId}&source=web`;
      
      // Add date filters if provided
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      
      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAttendanceData(data.data);
        setFilteredRecords(data.data.attendanceRecords);
      } else {
        throw new Error('Failed to fetch attendance details');
      }
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!attendanceData) return;

    let filtered = [...attendanceData.attendanceRecords];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => 
        statusFilter === "present" ? record.isPresent : !record.isPresent
      );
    }

    setFilteredRecords(filtered);
  };

  const handleDateFilter = () => {
    fetchAttendanceDetails();
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("all");
    fetchAttendanceDetails();
  };

  useEffect(() => {
    if (courseId) {
      fetchAttendanceDetails();
    }
  }, [courseId]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, attendanceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!attendanceData || !attendanceData.attendanceRecords.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/student/attendance")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No attendance records</h3>
              <p className="mt-1 text-sm text-muted-foreground">No attendance data found for this course.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const courseName = attendanceData.attendanceRecords[0]?.course?.courseName || "Course";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/student/attendance")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
            <p className="text-muted-foreground">Detailed attendance records</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
              <p className="text-2xl font-bold">{attendanceData.stats.totalAttendance}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Present</p>
              <p className="text-2xl font-bold">{attendanceData.stats.totalPresent}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold">{attendanceData.stats.totalAttendance - attendanceData.stats.totalPresent}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Filter className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Percentage</p>
              <p className="text-2xl font-bold">{attendanceData.stats.attendancePercentage}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value: "all" | "present" | "absent") => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="present">Present Only</SelectItem>
                  <SelectItem value="absent">Absent Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleDateFilter}>Apply Date Filter</Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>Clear All</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Session Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.attendanceId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {new Date(record.attendanceDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.session.sessionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.isPresent ? "default" : "destructive"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {record.isPresent ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {record.isPresent ? "Present" : "Absent"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {record.faculty.firstName} {record.faculty.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.faculty.department}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {record.session.room || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeof record.session.classes === 'number' ? record.session.classes : 1} class{(typeof record.session.classes === 'number' ? record.session.classes : 1) !== 1 ? 'es' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(record.session.sessionDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}