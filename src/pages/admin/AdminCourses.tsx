import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, BookOpen, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useToast } from '../../hooks/use-toast';
import { courseApi, type Course } from '../../lib/api';
import CreateCourseModal from '../../components/admin/CreateCourseModal';
import ViewCourseModal from '../../components/admin/ViewCourseModal';
import EditCourseModal from '../../components/admin/EditCourseModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses();
      if (response.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const response = await courseApi.getAllCourses({ courseName: searchTerm });
        if (response.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error searching courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to search courses',
          variant: 'destructive',
        });
      }
    } else {
      fetchCourses();
    }
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDelete = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchCourses();
    toast({
      title: 'Success',
      description: 'Course created successfully',
    });
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCourse(null);
    fetchCourses();
    toast({
      title: 'Success',
      description: 'Course updated successfully',
    });
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedCourse(null);
    fetchCourses();
    toast({
      title: 'Success',
      description: 'Course deleted successfully',
    });
  };

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
          <p className="text-muted-foreground">
            Manage course information, credits, and descriptions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
          Search
        </Button>
        <Button onClick={fetchCourses} variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
          Clear
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {course.courseName}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground truncate">
                      {course.description || 'No description available'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                      {course.credits} Credits
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(course)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(course)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(course)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCourses.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No courses found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new course.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ViewCourseModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        course={selectedCourse}
      />

      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        course={selectedCourse}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (selectedCourse) {
            try {
              await courseApi.deleteCourse(selectedCourse.id);
              handleDeleteSuccess();
            } catch (error) {
              console.error('Error deleting course:', error);
              toast({
                title: 'Error',
                description: 'Failed to delete course',
                variant: 'destructive',
              });
            }
          }
        }}
        title="Delete Course"
        description={`Are you sure you want to delete "${selectedCourse?.courseName}"? This action cannot be undone.`}
      />
    </div>
  );
}