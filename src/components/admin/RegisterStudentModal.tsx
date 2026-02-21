import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { courseApi, courseRegistrationApi, type CreateCourseRegistrationRequest, type Course } from '../../lib/api';

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

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData | null;
  onSuccess: () => void;
}

export default function RegisterStudentModal({ isOpen, onClose, student, onSuccess }: RegisterStudentModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<CreateCourseRegistrationRequest>({
    academicYear: new Date().getFullYear().toString(),
    isEvenSemester: true,
    studentId: 0,
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

  // Update student ID when student changes
  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId: student.id,
      }));
    }
  }, [student]);

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
    
    if (!student) return;
    
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
      
      const registrationData: CreateCourseRegistrationRequest = {
        academicYear: formData.academicYear,
        isEvenSemester: formData.isEvenSemester,
        studentId: student.id,
        courseId: formData.courseId,
      };

      await courseRegistrationApi.createRegistration(registrationData);
      
      // Reset form
      setFormData({
        academicYear: new Date().getFullYear().toString(),
        isEvenSemester: true,
        studentId: student.id,
        courseId: 0,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error registering student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register student',
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
        studentId: 0,
        courseId: 0,
      });
      onClose();
    }
  };

  if (!student) return null;

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
          <DialogTitle>Register Student in Course</DialogTitle>
          <DialogDescription>
            Register {student.firstName} {student.lastName} in a course for the selected academic period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
            <p><strong>Roll Number:</strong> {student.rollNumber}</p>
            <p><strong>Branch:</strong> {student.branch}-{student.section}-{student.subsection}</p>
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
              {loading ? 'Registering...' : 'Register Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}