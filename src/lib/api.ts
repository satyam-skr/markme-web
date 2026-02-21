const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { AttendanceSession, AttendanceSessionsResponse, AttendanceSessionFilters } from '../types';

// Types
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
}

interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: string;
  status?: string;
}

interface CreateStudentRequest {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  rollNumber: string;
  contactNumber: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  branch: string;
  section: string;
  subsection: string;
}

interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  legalName?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfAdmission?: string;
  branch?: string;
  section?: string;
  subsection?: string;
}

interface CreateFacultyRequest {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  contactNumber: string;
  dateOfBirth: string;
  dateOfJoining: string;
  department: string;
}

interface UpdateFacultyRequest {
  firstName?: string;
  lastName?: string;
  legalName?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  department?: string;
}

interface Course {
  id: number;
  courseName: string;
  credits: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCourseRequest {
  id?: number;
  courseName: string;
  credits: number;
  description?: string;
}

interface UpdateCourseRequest {
  courseName?: string;
  credits?: number;
  description?: string;
}

interface CourseAssignment {
  assignmentId: number;
  academicYear: string;
  isEvenSemester: boolean;
  facultyId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  faculty: {
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
  };
  course: {
    id: number;
    courseName: string;
    credits: number;
    description?: string;
  };
}

interface CreateCourseAssignmentRequest {
  assignmentId?: number;
  academicYear: string;
  isEvenSemester: boolean;
  facultyId: number;
  courseId: number;
}

interface UpdateCourseAssignmentRequest {
  academicYear?: string;
  isEvenSemester?: boolean;
  facultyId?: number;
  courseId?: number;
}

interface CourseRegistration {
  registrationId: number;
  academicYear: string;
  isEvenSemester: boolean;
  studentId: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  student: {
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
  };
  course: {
    id: number;
    courseName: string;
    credits: number;
    description?: string;
  };
}

interface CreateCourseRegistrationRequest {
  registrationId?: number;
  academicYear: string;
  isEvenSemester: boolean;
  studentId: number;
  courseId: number;
}

interface UpdateCourseRegistrationRequest {
  academicYear?: string;
  isEvenSemester?: boolean;
  studentId?: number;
  courseId?: number;
}

// Utility function to get token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('markme_token');
}

// Utility function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    headers,
    credentials: 'include', // Include cookies in requests
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: async (credentials: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest('/auth/register?source=web', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest('/auth/login?source=web', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiRequest('/auth/logout?source=web', {
      method: 'POST',
    });
    
    // Clear token from localStorage after successful logout
    localStorage.removeItem('markme_token');
    localStorage.removeItem('markme_user');
    
    return response as ApiResponse<{ success: boolean }>;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/user/me?source=web');
  },

  updateProfile: async (data: Partial<UpdateUserRequest>): Promise<ApiResponse<any>> => {
    return apiRequest('/user/me?source=web', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getAllUsers: async (params?: { role?: string }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    if (params?.role) searchParams.append('role', params.role);
    
    const endpoint = `/user?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getUser: async (id: string): Promise<ApiResponse<{ user: any }>> => {
    return apiRequest(`/user/${id}?source=web`);
  },

  createUser: async (data: CreateUserRequest): Promise<ApiResponse<{ user: any }>> => {
    return apiRequest('/user?source=web', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<{ user: any }>> => {
    return apiRequest(`/user/${id}?source=web`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ user: any }>> => {
    return apiRequest(`/user/${id}?source=web`, {
      method: 'DELETE',
    });
  },
};

// Student API
export const studentApi = {
  getProfile: async (): Promise<ApiResponse<{ student: any }>> => {
    return apiRequest('/student/me?source=web');
  },

  getAllStudents: async (params?: { 
    branch?: string;
    section?: string; 
    subsection?: string;
    batch?: number;
  }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    if (params?.branch) searchParams.append('branch', params.branch);
    if (params?.section) searchParams.append('section', params.section);
    if (params?.subsection) searchParams.append('subsection', params.subsection);
    if (params?.batch) searchParams.append('batch', params.batch.toString());
    
    const endpoint = `/student?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getStudent: async (id: string): Promise<ApiResponse<{ student: any }>> => {
    return apiRequest(`/student/${id}?source=web`);
  },

  createStudent: async (data: CreateStudentRequest): Promise<ApiResponse<{ student: any }>> => {
    return apiRequest('/student?source=web', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStudent: async (id: string, data: UpdateStudentRequest): Promise<ApiResponse<{ student: any }>> => {
    return apiRequest(`/student/${id}?source=web`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStudent: async (id: string): Promise<ApiResponse<{ student: any }>> => {
    return apiRequest(`/student/${id}?source=web`, {
      method: 'DELETE',
    });
  },
};

// Faculty API
export const facultyApi = {
  getProfile: async (): Promise<ApiResponse<{ faculty: any }>> => {
    return apiRequest('/faculty/me?source=web');
  },

  getCourses: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest('/faculty/me/course?source=web');
  },

  getAttendance: async (params: {
    courseId: number;
    from?: string;
    to?: string;
  }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    searchParams.append('courseId', params.courseId.toString());
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    
    const endpoint = `/faculty/me/attendance?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getAllFaculties: async (params?: { department?: string }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    if (params?.department) searchParams.append('department', params.department);
    
    const endpoint = `/faculty?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getFaculty: async (id: string): Promise<ApiResponse<{ faculty: any }>> => {
    return apiRequest(`/faculty/${id}?source=web`);
  },

  createFaculty: async (data: CreateFacultyRequest): Promise<ApiResponse<{ faculty: any }>> => {
    return apiRequest('/faculty?source=web', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFaculty: async (id: string, data: UpdateFacultyRequest): Promise<ApiResponse<{ faculty: any }>> => {
    return apiRequest(`/faculty/${id}?source=web`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFaculty: async (id: string): Promise<ApiResponse<{ faculty: any }>> => {
    return apiRequest(`/faculty/${id}?source=web`, {
      method: 'DELETE',
    });
  },
};

// Course API
export const courseApi = {
  getAllCourses: async (params?: { 
    courseName?: string;
    credits?: number;
  }): Promise<ApiResponse<{ courses: Course[] }>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    if (params?.courseName) searchParams.append('courseName', params.courseName);
    if (params?.credits) searchParams.append('credits', params.credits.toString());
    
    const endpoint = `/course?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getCourse: async (id: number): Promise<ApiResponse<{ course: Course }>> => {
    return apiRequest(`/course/${id}?source=web`);
  },

  createCourse: async (data: CreateCourseRequest): Promise<ApiResponse<{ course: Course }>> => {
    return apiRequest('/course?source=web', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCourse: async (id: number, data: UpdateCourseRequest): Promise<ApiResponse<Course>> => {
    return apiRequest(`/course/${id}?source=web`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCourse: async (id: number): Promise<ApiResponse<{}>> => {
    return apiRequest(`/course/${id}?source=web`, {
      method: 'DELETE',
    });
  },
};

// Course Assignment API
export const courseAssignmentApi = {
  getAllAssignments: async (params?: {
    facultyId?: number;
    courseId?: number;
    academicYear?: string;
    isEvenSemester?: boolean;
  }): Promise<ApiResponse<{ assignments: CourseAssignment[] }>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    if (params?.facultyId) searchParams.append('facultyId', params.facultyId.toString());
    if (params?.courseId) searchParams.append('courseId', params.courseId.toString());
    if (params?.academicYear) searchParams.append('academicYear', params.academicYear);
    if (params?.isEvenSemester !== undefined) searchParams.append('isEvenSemester', params.isEvenSemester.toString());

    const endpoint = `/course/assignment/?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getAssignment: async (id: number): Promise<ApiResponse<{ assignment: CourseAssignment }>> => {
    return apiRequest(`/course/assignment/${id}?source=web`);
  },

  create: async (data: CreateCourseAssignmentRequest): Promise<ApiResponse<{ assignment: CourseAssignment }>> => {
    return apiRequest('/course/assignment/?source=web', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (assignmentId: number, data: UpdateCourseAssignmentRequest): Promise<ApiResponse<{ assignment: CourseAssignment }>> => {
    return apiRequest(`/course/assignment/${assignmentId}?source=web`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAssignment: async (id: number): Promise<ApiResponse<{}>> => {
    return apiRequest(`/course/assignment/${id}?source=web`, {
      method: 'DELETE',
    });
  },
};

// Course Registration API
export const courseRegistrationApi = {
  getAllRegistrations: async (params?: {
    studentId?: number;
    courseId?: number;
    academicYear?: string;
    isEvenSemester?: boolean;
  }): Promise<ApiResponse<{ registrations: CourseRegistration[] }>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    if (params?.studentId) searchParams.append('studentId', params.studentId.toString());
    if (params?.courseId) searchParams.append('courseId', params.courseId.toString());
    if (params?.academicYear) searchParams.append('academicYear', params.academicYear);
    if (params?.isEvenSemester !== undefined) searchParams.append('isEvenSemester', params.isEvenSemester.toString());

    const endpoint = `/course/registration/?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  getRegistration: async (id: number): Promise<ApiResponse<{ registration: CourseRegistration }>> => {
    return apiRequest(`/course/registration/${id}?source=web`);
  },

  createRegistration: async (data: CreateCourseRegistrationRequest): Promise<ApiResponse<{ registration: CourseRegistration }>> => {
    return apiRequest('/course/registration/?source=web', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRegistration: async (id: number, data: UpdateCourseRegistrationRequest): Promise<ApiResponse<{ registration: CourseRegistration }>> => {
    return apiRequest(`/course/registration/${id}?source=web`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRegistration: async (id: number): Promise<ApiResponse<{}>> => {
    return apiRequest(`/course/registration/${id}?source=web`, {
      method: 'DELETE',
    });
  },
};

// Admin Faculty Attendance API
export const adminAttendanceApi = {
  getFacultyAttendance: async (params: {
    facultyId: number;
    courseId: number;
    from?: string;
    to?: string;
  }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams({ source: 'web' });
    searchParams.append('facultyId', params.facultyId.toString());
    searchParams.append('courseId', params.courseId.toString());
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    
    const endpoint = `/faculty/attendance?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },
};

// Student Photos API
export const studentPhotoApi = {
  getPhotos: async (studentId: number): Promise<ApiResponse<any[]>> => {
    return apiRequest(`/photos/students/${studentId}/photos?source=web`);
  },

  uploadPhoto: async (studentId: number, rollNumber: string, file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('rollNumber', rollNumber);
    formData.append('source', 'web');

    const response = await fetch(`${API_BASE_URL}/photos/students/${studentId}/photos?source=web`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  deletePhoto: async (photoId: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/photos/students/photos/${photoId}?source=web`, {
      method: 'DELETE',
    });
  },

  deleteAllPhotos: async (studentId: number): Promise<ApiResponse<any>> => {
    return apiRequest(`/photos/students/${studentId}/photos?source=web`, {
      method: 'DELETE',
    });
  },

  checkFolder: async (rollNumber: string): Promise<ApiResponse<any>> => {
    return apiRequest(`/photos/students/${rollNumber}/folder?source=web`);
  },
};

// Attendance Sessions API
export const attendanceSessionsApi = {
  // Get attendance sessions for faculty (authenticated user)
  getMyAttendanceSessions: async (): Promise<ApiResponse<AttendanceSessionsResponse>> => {
    return apiRequest('/attendanceSessions/me?source=web');
  },

  // Get all attendance sessions (admin) with filters
  getAllAttendanceSessions: async (filters?: AttendanceSessionFilters): Promise<ApiResponse<AttendanceSessionsResponse>> => {
    const params = new URLSearchParams();
    
    if (filters?.facultyId) {
      params.append('facultyId', filters.facultyId.toString());
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.room) {
      params.append('room', filters.room);
    }

    const queryString = params.toString();
    const url = queryString ? `/attendanceSessions?${queryString}` : '/attendanceSessions';
    
    return apiRequest(url);
  },
};

// Export types for use in components
export type {
  ApiResponse,
  ApiError,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseAssignment,
  CreateCourseAssignmentRequest,
  UpdateCourseAssignmentRequest,
  CourseRegistration,
  CreateCourseRegistrationRequest,
  UpdateCourseRegistrationRequest,
};