import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { BookOpen, Calendar, Trash2, GraduationCap, UserCheck } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { courseAssignmentApi, courseRegistrationApi, type CourseAssignment, type CourseRegistration } from '../../lib/api';
import DeleteConfirmModal from './DeleteConfirmModal';

interface FacultyData {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  department: string;
}

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  rollNumber: string;
  branch: string;
  section: string;
  subsection: string;
}

interface ViewCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty?: FacultyData | null;
  student?: StudentData | null;
  assignments?: CourseAssignment[];
  registrations?: CourseRegistration[];
  onRefresh: () => void;
}

export default function ViewCoursesModal({ 
  isOpen, 
  onClose, 
  faculty, 
  student, 
  assignments = [], 
  registrations = [], 
  onRefresh 
}: ViewCoursesModalProps) {
  const [deleteItem, setDeleteItem] = useState<{type: 'assignment' | 'registration', id: number, name: string} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();

  const isFacultyView = !!faculty;
  const isStudentView = !!student;

  const handleDelete = async (type: 'assignment' | 'registration', id: number, courseName: string) => {
    setDeleteItem({ type, id, name: courseName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === 'assignment') {
        await courseAssignmentApi.deleteAssignment(deleteItem.id);
      } else {
        await courseRegistrationApi.deleteRegistration(deleteItem.id);
      }

      setShowDeleteModal(false);
      setDeleteItem(null);
      onRefresh();
      
      toast({
        title: 'Success',
        description: `${deleteItem.type === 'assignment' ? 'Assignment' : 'Registration'} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: `Failed to delete ${deleteItem.type}`,
        variant: 'destructive',
      });
    }
  };

  if (!isOpen || (!faculty && !student)) return null;

  const coursesToShow = isFacultyView ? assignments : registrations;
  const personName = isFacultyView ? `${faculty!.firstName} ${faculty!.lastName}` : `${student!.firstName} ${student!.lastName}`;
  const title = isFacultyView ? 'Faculty Course Assignments' : 'Student Course Registrations';
  const emptyMessage = isFacultyView ? 'No courses assigned to this faculty member' : 'No courses registered for this student';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isFacultyView ? <UserCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
              {title}
            </DialogTitle>
            <DialogDescription>
              View and manage courses for {personName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Person Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{personName}</CardTitle>
                    <CardDescription className="mt-1">
                      {isFacultyView ? (
                        <>Department: {faculty!.department}</>
                      ) : (
                        <>Roll: {student!.rollNumber} • {student!.branch}-{student!.section}-{student!.subsection}</>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {coursesToShow.length} Course{coursesToShow.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Courses List */}
            {coursesToShow.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {isFacultyView ? 'Assigned Courses' : 'Registered Courses'}
                </h3>
                
                <div className="grid gap-4">
                  {coursesToShow.map((item) => {
                    const course = item.course;
                    const isAssignment = 'facultyId' in item;
                    
                    return (
                      <Card key={isAssignment ? (item as CourseAssignment).assignmentId : (item as CourseRegistration).registrationId} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {course.courseName}
                              </CardTitle>
                              <CardDescription>
                                Course ID: {course.id} • {course.credits} Credits
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(
                                isAssignment ? 'assignment' : 'registration',
                                isAssignment ? (item as CourseAssignment).assignmentId : (item as CourseRegistration).registrationId,
                                course.courseName
                              )}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {course.description && (
                            <p className="text-sm text-muted-foreground">
                              {course.description}
                            </p>
                          )}
                          
                          <Separator />
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Academic Year:</span>
                              <p className="font-medium">
                                {item.academicYear}-{parseInt(item.academicYear) + 1}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Semester:</span>
                              <p className="font-medium">
                                {item.isEvenSemester ? 'Even' : 'Odd'}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {isAssignment ? 'Assigned' : 'Registered'} On:
                              </span>
                              <p className="font-medium">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Updated:</span>
                              <p className="font-medium">
                                {new Date(item.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No Courses Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {emptyMessage}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteItem?.type === 'assignment' ? 'Course Assignment' : 'Course Registration'}`}
        description={
          deleteItem 
            ? `Are you sure you want to remove "${deleteItem.name}" from ${personName}? This action cannot be undone.`
            : ''
        }
        requireConfirmation={false}
      />
    </>
  );
}