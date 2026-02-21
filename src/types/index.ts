// Attendance Session interfaces based on the Prisma schema
export interface AttendanceSession {
  id: number;
  facultyId: number;
  courseId: number;
  sessionDate: string;
  room: string | null;
  classes: {
    classes: {
      branch: string;
      section: string;
    }[];
  };
  supabaseImage: string | null;
  mlStatus: 'pending' | 'running' | 'processed' | 'failed';
  mlResult: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSessionsResponse {
  sessions: AttendanceSession[];
}

export interface AttendanceSessionFilters {
  facultyId?: number;
  startDate?: string;
  endDate?: string;
  room?: string;
}

export interface Faculty {
  id: number;
  name: string;
  email: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
}