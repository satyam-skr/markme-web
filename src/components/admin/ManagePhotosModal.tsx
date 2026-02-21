import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Camera, 
  Upload, 
  X, 
  Trash2, 
  Eye, 
  Download, 
  AlertTriangle,
  ImageIcon,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { studentPhotoApi } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string;
}

interface Photo {
  id: number;
  filePath: string;
  signedUrl?: string;
  urlError?: string;
  createdAt: string;
  student?: {
    rollNumber: string;
    firstName: string;
    lastName: string;
  };
}

interface ManagePhotosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function ManagePhotosModal({ open, onOpenChange, student }: ManagePhotosModalProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchPhotos = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      const response = await studentPhotoApi.getPhotos(student.id);
      setPhotos(response.data || []);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!student) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await studentPhotoApi.uploadPhoto(student.id, student.rollNumber, file);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
      await fetchPhotos(); // Refresh photos
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      setVideoReady(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 }
        },
        audio: false,
      });
      
      console.log('Camera stream obtained:', mediaStream.getVideoTracks()[0]?.getSettings());
      
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setVideoReady(true);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
          setVideoReady(true);
        };
        
        // Force play
        setTimeout(async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              console.log('Video playing successfully');
            }
          } catch (playError) {
            console.warn('Auto-play failed:', playError);
            // Try to play again after user interaction
          }
        }, 100);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraActive(false);
      setVideoReady(false);
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setVideoReady(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !student) {
      toast({
        title: "Error",
        description: "Camera not ready or student not selected",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast({
        title: "Error", 
        description: "Canvas not supported",
        variant: "destructive",
      });
      return;
    }

    console.log('Video readyState:', video.readyState);
    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    console.log('Video paused:', video.paused);

    // Get actual video dimensions
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width === 0 || height === 0) {
      toast({
        title: "Error",
        description: "Video not ready. Please wait for camera to load completely.",
        variant: "destructive", 
      });
      return;
    }

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    try {
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, width, height);
      console.log('Image drawn to canvas');

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log('Blob created:', blob.size, 'bytes');
          const file = new File([blob], `${student.rollNumber}_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          
          stopCamera();
          await handleFileUpload(file);
        } else {
          toast({
            title: "Error",
            description: "Failed to create image from camera",
            variant: "destructive",
          });
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: "Error",
        description: `Failed to capture photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await studentPhotoApi.deletePhoto(photoId);
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
      await fetchPhotos(); // Refresh photos
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    } finally {
      setDeletePhotoId(null);
    }
  };

  const handleDeleteAllPhotos = async () => {
    if (!student) return;

    try {
      await studentPhotoApi.deleteAllPhotos(student.id);
      toast({
        title: "Success",
        description: "All photos deleted successfully",
      });
      await fetchPhotos(); // Refresh photos
    } catch (error) {
      console.error("Delete all failed:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete all photos",
        variant: "destructive",
      });
    } finally {
      setDeleteAllConfirm(false);
    }
  };

  const downloadPhoto = (photo: Photo) => {
    if (!photo.signedUrl) return;

    const link = document.createElement('a');
    link.href = photo.signedUrl;
    link.download = `${student?.rollNumber}_${photo.id}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (open && student) {
      fetchPhotos();
    }
  }, [open, student]);

  useEffect(() => {
    // Cleanup camera when modal closes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!student) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Manage Photos - {student.firstName} {student.lastName}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Roll Number: {student.rollNumber} | Email: {student.email}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {/* Upload Controls */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Button>

                <Button
                  variant="outline"
                  onClick={startCamera}
                  disabled={uploading || cameraActive}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {cameraActive ? "Camera Active" : "Live Camera"}
                </Button>

                {photos.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteAllConfirm(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Camera View */}
            {cameraActive && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-md mx-auto rounded-lg border"
                      style={{ maxHeight: '400px', backgroundColor: '#000' }}
                      onClick={() => {
                        // Manual play on click if autoplay failed
                        if (videoRef.current && videoRef.current.paused) {
                          videoRef.current.play().catch(console.error);
                        }
                      }}
                    />
                    {!videoReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="text-white text-sm">Loading camera...</div>
                      </div>
                    )}
                  </div>
                  
                  {videoReady && (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Camera ready
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-3">
                    <Button 
                      onClick={capturePhoto} 
                      disabled={!videoReady}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {videoReady ? "Capture Photo" : "Waiting..."}
                    </Button>
                    <Button variant="outline" onClick={stopCamera} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Stop Camera
                    </Button>
                    {!videoReady && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.play().then(() => {
                              setVideoReady(true);
                            }).catch(console.error);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Start Video
                      </Button>
                    )}
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            <Separator className="my-4" />

            {/* Photos Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Current Photos ({photos.length})
                </h3>
                {loading && (
                  <Badge variant="outline">Loading...</Badge>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No photos uploaded yet</p>
                  <p className="text-sm">Upload a photo or capture one using the camera</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {photo.signedUrl ? (
                          <img
                            src={photo.signedUrl}
                            alt={`Photo ${photo.id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Photo Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {photo.signedUrl && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(photo.signedUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => downloadPhoto(photo)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletePhotoId(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Photo Info */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Uploaded: {new Date(photo.createdAt).toLocaleDateString()}</p>
                        {photo.urlError && (
                          <p className="text-destructive">URL Error</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Confirmation */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Photo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePhotoId && handleDeletePhoto(deletePhotoId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Photos Confirmation */}
      <AlertDialog open={deleteAllConfirm} onOpenChange={setDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Photos
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all photos for {student.firstName} {student.lastName}? 
              This will permanently remove {photos.length} photo{photos.length !== 1 ? 's' : ''} and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllPhotos}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Photos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}