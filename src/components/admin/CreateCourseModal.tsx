import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { courseApi, type CreateCourseRequest } from '../../lib/api';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CreateCourseRequest>({
    courseName: '',
    credits: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseName.trim()) {
      toast({
        title: 'Error',
        description: 'Course name is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.credits <= 0) {
      toast({
        title: 'Error',
        description: 'Credits must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        courseName: formData.courseName.trim(),
        credits: formData.credits,
        ...(formData.description?.trim() && { description: formData.description.trim() }),
      };

      await courseApi.createCourse(dataToSubmit);
      
      // Reset form
      setFormData({
        courseName: '',
        credits: 0,
        description: '',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        courseName: '',
        credits: 0,
        description: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to the system. Fill in the course details below.
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
              value={formData.courseName}
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
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}