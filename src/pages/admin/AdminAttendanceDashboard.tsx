import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Image, RefreshCw, User } from 'lucide-react';
import { attendanceSessionsApi, facultyApi } from '@/lib/api';
import { AttendanceSession, Faculty } from '@/types';
import { useToast } from '@/hooks/use-toast';

const AdminAttendanceDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<AttendanceSession[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [roomFilter, setRoomFilter] = useState('');
  
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const filters = {
        ...(selectedFacultyId && { facultyId: parseInt(selectedFacultyId) }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(roomFilter && { room: roomFilter }),
      };

      const response = await attendanceSessionsApi.getAllAttendanceSessions(filters);
      
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

  const fetchFaculties = async () => {
    try {
      setLoadingFaculties(true);
      const response = await facultyApi.getAll();
      
      if (response.success) {
        setFaculties(response.data.faculties || []);
      } else {
        console.error('Failed to fetch faculties');
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoadingFaculties(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [selectedFacultyId, startDate, endDate, roomFilter]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedFacultyId('');
    setRoomFilter('');
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

  const getFacultyName = (facultyId: number) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : `Faculty ${facultyId}`;
  };

  // Get unique rooms for room filter
  const uniqueRooms = Array.from(new Set(sessions.map(session => session.room).filter(Boolean)));

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
        <h1 className="text-3xl font-bold">All Attendance Sessions</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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
              <Label>Faculty</Label>
              <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {!loadingFaculties && faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueRooms.map((room) => (
                    <SelectItem key={room} value={room!}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{filteredSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {filteredSessions.filter(s => s.mlStatus === 'processed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">
                  {filteredSessions.filter(s => s.mlStatus === 'running').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {filteredSessions.filter(s => s.mlStatus === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No attendance sessions found</h3>
            <p className="text-muted-foreground">
              {sessions.length === 0 
                ? "No attendance sessions have been created yet."
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
                  <User className="h-4 w-4 mr-2" />
                  {getFacultyName(session.facultyId)}
                </div>

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
                    {session.classes.classes.map((classInfo, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {classInfo.branch} - {classInfo.section}
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

export default AdminAttendanceDashboard;