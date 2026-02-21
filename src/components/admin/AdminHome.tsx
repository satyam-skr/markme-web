import { useState, useEffect } from "react";
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  todaysAttendance: number;
}

// Mock data for development fallback
const mockStats = {
  totalUsers: 1284,
  totalStudents: 1156,
  totalFaculty: 128,
  todaysAttendance: 94.2,
};

const recentActivity = [
  { action: "New student registered", user: "John Smith", time: "2 minutes ago" },
  { action: "Attendance marked", user: "Dr. Sarah Wilson", time: "15 minutes ago" },
  { action: "Profile updated", user: "Emily Chen", time: "1 hour ago" },
  { action: "New faculty added", user: "Admin", time: "2 hours ago" },
  { action: "Report generated", user: "Admin", time: "3 hours ago" },
];

export function AdminHome() {
  const [stats, setStats] = useState<Stats>(mockStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Load data concurrently from multiple APIs
        const [usersResponse, studentsResponse, facultyResponse] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/users?source=web`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/students?source=web`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/faculty?source=web`, { credentials: "include" }),
        ]);

        const newStats = { ...mockStats };

        // Process users data
        if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
          const usersData = await usersResponse.value.json();
          if (usersData.success) {
            newStats.totalUsers = usersData.data.length;
          }
        }

        // Process students data
        if (studentsResponse.status === 'fulfilled' && studentsResponse.value.ok) {
          const studentsData = await studentsResponse.value.json();
          if (studentsData.success) {
            newStats.totalStudents = studentsData.data.length;
          }
        }

        // Process faculty data
        if (facultyResponse.status === 'fulfilled' && facultyResponse.value.ok) {
          const facultyData = await facultyResponse.value.json();
          if (facultyData.success) {
            newStats.totalFaculty = facultyData.data.length;
          }
        }

        setStats(newStats);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
        // Keep mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsConfig = [
    {
      label: "Total Users",
      value: loading ? "..." : stats.totalUsers.toLocaleString(),
      change: "+12%",
      trend: "up" as const,
      icon: Users,
    },
    {
      label: "Students",
      value: loading ? "..." : stats.totalStudents.toLocaleString(),
      change: "+8%",
      trend: "up" as const,
      icon: GraduationCap,
    },
    {
      label: "Faculty",
      value: loading ? "..." : stats.totalFaculty.toLocaleString(),
      change: "+3%",
      trend: "up" as const,
      icon: BookOpen,
    },
    {
      label: "Today's Attendance",
      value: loading ? "..." : `${stats.todaysAttendance}%`,
      change: "-1.2%",
      trend: "down" as const,
      icon: Calendar,
    },
  ];
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span
                      className={stat.trend === "up" ? "text-green-500 text-sm" : "text-destructive text-sm"}
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground text-sm">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Computer Science", students: 324, attendance: 96 },
                { name: "Electrical Engineering", students: 256, attendance: 94 },
                { name: "Mechanical Engineering", students: 198, attendance: 92 },
                { name: "Civil Engineering", students: 167, attendance: 95 },
                { name: "Information Technology", students: 211, attendance: 93 },
              ].map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">{dept.students} students</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${dept.attendance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {dept.attendance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
