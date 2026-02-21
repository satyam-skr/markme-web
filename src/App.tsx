import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminHome from "./pages/admin/AdminHome";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminFacultyAttendance from "./pages/admin/AdminFacultyAttendance";
import AdminSettings from "./pages/admin/AdminSettings";
import CreateStudent from "./pages/admin/CreateStudent";
import EditStudent from "./pages/admin/EditStudent";
import CreateFaculty from "./pages/admin/CreateFaculty";
import EditFaculty from "./pages/admin/EditFaculty";
import FacultyAssignment from "./pages/admin/FacultyAssignment";
import StudentRegistration from "./pages/admin/StudentRegistration";

// Student Pages
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentAttendanceDetails from "./pages/student/StudentAttendanceDetails";
import StudentHome from "./pages/student/StudentHome";
import StudentCourses from "./pages/student/StudentCourses";

// Faculty Pages
import FacultyProfile from "./pages/faculty/FacultyProfile";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyCourseAttendance from "./pages/faculty/FacultyCourseAttendance";
import FacultyHome from "./pages/faculty/FacultyHome";
import FacultyCourses from "./pages/faculty/FacultyCourses";
import FacultySessions from "./pages/faculty/FacultySessions";
import FacultyTakeAttendance from "./pages/faculty/FacultyTakeAttendance";

// Attendance Dashboard Pages
import FacultyAttendanceDashboard from "./pages/faculty/FacultyAttendanceDashboard";
import AdminAttendanceDashboard from "./pages/admin/AdminAttendanceDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Attendance Dashboard Routes */}
              <Route path="/attendance-sessions" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminAttendanceDashboard />
                </ProtectedRoute>
              } />
              <Route path="/me" element={
                <ProtectedRoute allowedRoles={["FACULTY"]}>
                  <FacultyAttendanceDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Dashboard Routes */}
              <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<AdminHome />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="faculty" element={<AdminFaculty />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="faculty-assignment" element={<FacultyAssignment />} />
                <Route path="student-registration" element={<StudentRegistration />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="attendance/faculty/:facultyId/course/:courseId" element={<AdminFacultyAttendance />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/dashboard/admin/students/create" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreateStudent />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/students/edit/:id" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EditStudent />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/faculty/create" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreateFaculty />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/admin/faculty/edit/:id" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EditFaculty />
                </ProtectedRoute>
              } />
              
              {/* Student Dashboard Routes */}
              <Route path="/dashboard/student" element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<StudentHome />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>
              
              {/* Student Attendance Detail Route */}
              <Route path="/student/attendance/:courseId" element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentAttendanceDetails />
                </ProtectedRoute>
              } />
              
              {/* Faculty Dashboard Routes */}
              <Route path="/dashboard/faculty" element={
                <ProtectedRoute allowedRoles={["FACULTY"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<FacultyHome />} />
                <Route path="courses" element={<FacultyCourses />} />
                <Route path="attendance" element={<FacultyAttendance />} />
                <Route path="attendance/course/:courseId" element={<FacultyCourseAttendance />} />
                <Route path="sessions" element={<FacultySessions />} />
                <Route path="take-attendance" element={<FacultyTakeAttendance />} />
                <Route path="profile" element={<FacultyProfile />} />
              </Route>

              {/* Legacy routes for backward compatibility */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/faculty" element={
                <ProtectedRoute allowedRoles={["FACULTY"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
