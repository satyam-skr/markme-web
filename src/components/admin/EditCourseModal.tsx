import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { courseApi, type Course, type UpdateCourseRequest } from '../../lib/api';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess: () => void;
}

export default function EditCourseModal({ isOpen, onClose, course, onSuccess }: EditCourseModalProps) {
  const [formData, setFormData] = useState<UpdateCourseRequest>({
    courseName: '',
    credits: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Update form data when course changes
  useEffect(() => {
    if (course) {
      setFormData({
        courseName: course.courseName,
        credits: course.credits,
        description: course.description || '',
      });
    }
  }, [course]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course) return;

    if (!formData.courseName?.trim()) {
      toast({
        title: 'Error',
        description: 'Course name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.credits || formData.credits <= 0) {
      toast({
        title: 'Error',
        description: 'Credits must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit: UpdateCourseRequest = {
        courseName: formData.courseName.trim(),
        credits: formData.credits,
        description: formData.description?.trim() || undefined,
      };

      await courseApi.updateCourse(course.id, dataToSubmit);
      onSuccess();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the course information. Make changes and save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">
              Course Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="courseName"
              name="courseName"
              value={formData.courseName || ''}
              onChange={handleInputChange}
              placeholder="Enter course name"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">
              Credits <span className="text-red-500">*</span>
            </Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              min="1"
              max="10"
              value={formData.credits || ''}
              onChange={handleInputChange}
              placeholder="Enter course credits"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Enter course description (optional)"
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              <strong>Course ID:</strong> {course.id}
            </p>
            <p className="text-muted-foreground">
              <strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}
            </p>
            <p className="text-muted-foreground">
              <strong>Last Updated:</strong> {new Date(course.updatedAt).toLocaleDateString()}
            </p>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}