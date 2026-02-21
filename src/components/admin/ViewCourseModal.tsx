import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { BookOpen, Calendar, Hash, FileText } from 'lucide-react';
import { type Course } from '../../lib/api';

interface ViewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export default function ViewCourseModal({ isOpen, onClose, course }: ViewCourseModalProps) {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{course.courseName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Hash className="h-4 w-4" />
                    Course ID: {course.id}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {course.credits} Credits
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  DESCRIPTION
                </h4>
                <p className="text-sm leading-relaxed">
                  {course.description || 'No description available for this course.'}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    CREATED
                  </h4>
                  <p className="text-sm">
                    {new Date(course.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    LAST UPDATED
                  </h4>
                  <p className="text-sm">
                    {new Date(course.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Course Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Course Name:</span>
                    <span className="ml-2 font-medium">{course.courseName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="ml-2 font-medium">{course.credits}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Course ID:</span>
                    <span className="ml-2 font-medium">{course.id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}