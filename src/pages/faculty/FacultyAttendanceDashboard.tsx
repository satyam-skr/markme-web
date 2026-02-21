import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Image, RefreshCw } from 'lucide-react';
import { attendanceSessionsApi } from '@/lib/api';
import { AttendanceSession } from '@/types';
import { useToast } from '@/hooks/use-toast';

const FacultyAttendanceDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await attendanceSessionsApi.getMyAttendanceSessions();
      
      if (response.success) {
        setSessions(response.data.sessions);
        setFilteredSessions(response.data.sessions);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch attendance sessions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, startDate, endDate]);

  const filterSessions = () => {
    let filtered = [...sessions];

    if (startDate) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.sessionDate);
        const filterStartDate = new Date(startDate);
        return sessionDate >= filterStartDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.sessionDate);
        const filterEndDate = new Date(endDate);
        // Set end date to end of day for inclusive filtering
        filterEndDate.setHours(23, 59, 59, 999);
        return sessionDate <= filterEndDate;
      });
    }

    setFilteredSessions(filtered);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'processed':
        return 'default';
      case 'running':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Completed';
      case 'running':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading attendance sessions...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Attendance Sessions</h1>
        <Button onClick={fetchSessions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No attendance sessions found</h3>
            <p className="text-muted-foreground">
              {sessions.length === 0 
                ? "You haven't created any attendance sessions yet."
                : "No sessions match your current filters."
              }
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Session #{session.id}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(session.mlStatus)}>
                    {getStatusLabel(session.mlStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(session.sessionDate)}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(session.sessionDate)}
                </div>

                {session.room && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {session.room}
                  </div>
                )}

                <div className="flex items-start text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {session.classes.classes.map((className, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                  </div>
                </div>

                {session.supabaseImage && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Image className="h-4 w-4 mr-2" />
                    <span className="truncate">Image captured</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(session.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyAttendanceDashboard;