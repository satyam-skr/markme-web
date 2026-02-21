import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, GraduationCap, BookOpen, Users, Calendar, MoreHorizontal } from 'lucide-react';
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
import { type CourseRegistration } from '../../lib/api';
import RegisterStudentModal from '../../components/admin/RegisterStudentModal';
import ViewCoursesModal from '../../components/admin/ViewCoursesModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface StudentWithRegistrations {
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
  registrationCount: number;
  registrations: CourseRegistration[];
}

export default function StudentRegistration() {
  const [students, setStudents] = useState<StudentWithRegistrations[]>([]);
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRegistrations | null>(null);
  
  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all students and registrations using session-based auth
      const [studentsResponse, registrationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/student?source=web`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/course/registration/?source=web`, {
          credentials: "include",
        })
      ]);

      // Parse responses
      const studentsData = await studentsResponse.json();
      const registrationsData = await registrationsResponse.json();

      if (studentsResponse.ok && registrationsResponse.ok && studentsData.success && registrationsData.success) {
        const students = studentsData.data;
        const registrations = registrationsData.data.registrations;
        
        // Count registrations for each student
        const studentsWithRegistrations: StudentWithRegistrations[] = students.map((student: any) => {
          const studentRegistrations = registrations.filter(
            (registration: CourseRegistration) => registration.studentId === student.id
          );
          
          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            legalName: student.legalName,
            rollNumber: student.rollNumber,
            contactNumber: student.contactNumber,
            branch: student.branch,
            section: student.section || '',
            subsection: student.subsection || '',
            user: student.user || {
              id: student.userId || 0,
              email: student.email || '',
              role: student.role || 'student',
              status: student.status || 'active'
            },
            registrationCount: studentRegistrations.length,
            registrations: studentRegistrations,
          };
        });

        setStudents(studentsWithRegistrations);
        setRegistrations(registrations);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch student registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterStudent = (student: StudentWithRegistrations) => {
    setSelectedStudent(student);
    setShowRegisterModal(true);
  };

  const handleViewCourses = (student: StudentWithRegistrations) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    setSelectedStudent(null);
    fetchData();
    toast({
      title: 'Success',
      description: 'Student registered successfully',
    });
  };

  // Get unique branches and sections for filters
  const branches = [...new Set(students.map(s => s.branch))];
  const sections = [...new Set(students.map(s => s.section))];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = branchFilter === 'all' || student.branch === branchFilter;
    const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
    
    return matchesSearch && matchesBranch && matchesSection;
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
          <h1 className="text-3xl font-bold tracking-tight">Student Course Registrations</h1>
          <p className="text-muted-foreground">
            Manage course registrations for students
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
              <p className="text-2xl font-bold">{registrations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Registered Students</p>
              <p className="text-2xl font-bold">{students.filter(s => s.registrationCount > 0).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map(branch => (
              <SelectItem key={branch} value={branch}>{branch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map(section => (
              <SelectItem key={section} value={section}>{section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Student Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Course Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Branch-Section</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{student.rollNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {student.user?.email || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {student.branch}-{student.section}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {student.contactNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                      {student.registrationCount} Course{student.registrationCount !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.user?.status === 'active' ? 'default' : 'secondary'}>
                      {student.user?.status || 'N/A'}
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
                          onClick={() => handleViewCourses(student)}
                          disabled={student.registrationCount === 0}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Courses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegisterStudent(student)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Register Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No students found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || branchFilter !== 'all' || sectionFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No students available.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <RegisterStudentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        student={selectedStudent}
        onSuccess={handleRegisterSuccess}
      />

      <ViewCoursesModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        student={selectedStudent}
        registrations={selectedStudent?.registrations || []}
        onRefresh={fetchData}
      />
    </div>
  );
}