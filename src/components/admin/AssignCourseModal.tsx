import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { courseApi, courseAssignmentApi, type CreateCourseAssignmentRequest, type Course } from '../../lib/api';

interface FacultyData {
  id: number;
  firstName: string;
  lastName: string;
  legalName: string;
  department: string;
}

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: FacultyData | null;
  onSuccess: () => void;
}

export default function AssignCourseModal({ isOpen, onClose, faculty, onSuccess }: AssignCourseModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<CreateCourseAssignmentRequest>({
    academicYear: new Date().getFullYear().toString(),
    isEvenSemester: true,
    facultyId: 0,
    courseId: 0,
  });
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const { toast } = useToast();

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Update faculty ID when faculty changes
  useEffect(() => {
    if (faculty) {
      setFormData(prev => ({
        ...prev,
        facultyId: faculty.id,
      }));
    }
  }, [faculty]);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
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
      setCoursesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faculty) return;
    
    if (formData.courseId === 0) {
      toast({
        title: 'Error',
        description: 'Please select a course',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.academicYear) {
      toast({
        title: 'Error',
        description: 'Please enter academic year',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const assignmentData: CreateCourseAssignmentRequest = {
        academicYear: formData.academicYear,
        isEvenSemester: formData.isEvenSemester,
        facultyId: faculty.id,
        courseId: formData.courseId,
      };

      await courseAssignmentApi.create(assignmentData);
      
      // Reset form
      setFormData({
        academicYear: new Date().getFullYear().toString(),
        isEvenSemester: true,
        facultyId: faculty.id,
        courseId: 0,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error assigning course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        academicYear: new Date().getFullYear().toString(),
        isEvenSemester: true,
        facultyId: 0,
        courseId: 0,
      });
      onClose();
    }
  };

  if (!faculty) return null;

  // Generate academic year options (current year ± 2 years)
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    academicYears.push(year.toString());
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Course to Faculty</DialogTitle>
          <DialogDescription>
            Assign a course to {faculty.firstName} {faculty.lastName} for the selected academic period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p><strong>Faculty:</strong> {faculty.firstName} {faculty.lastName}</p>
            <p><strong>Department:</strong> {faculty.department}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">
              Course <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.courseId.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: parseInt(value) }))}
              disabled={coursesLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.courseName} ({course.credits} credits)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">
              Academic Year <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.academicYear}
              onValueChange={(value) => setFormData(prev => ({ ...prev, academicYear: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}-{parseInt(year) + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="semester"
              checked={formData.isEvenSemester}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEvenSemester: checked }))}
              disabled={loading}
            />
            <Label htmlFor="semester">
              Even Semester (uncheck for Odd Semester)
            </Label>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
            <p><strong>Academic Period:</strong> {formData.academicYear}-{parseInt(formData.academicYear) + 1}</p>
            <p><strong>Semester:</strong> {formData.isEvenSemester ? 'Even' : 'Odd'}</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || coursesLoading || formData.courseId === 0}
            >
              {loading ? 'Assigning...' : 'Assign Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}