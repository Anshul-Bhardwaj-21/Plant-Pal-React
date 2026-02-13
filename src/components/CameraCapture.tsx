import { useCallback, useState, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const { videoRef, isActive, error, startCamera, stopCamera, captureImage } = useCamera();
  const [preview, setPreview] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      setStarting(true);
      await startCamera();
      setStarting(false);
    };
    initCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    const imageData = captureImage();
    if (imageData) {
      setPreview(imageData);
    }
  }, [captureImage]);

  const handleRetake = useCallback(() => {
    setPreview(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (preview) {
      onCapture(preview);
      stopCamera();
    }
  }, [preview, onCapture, stopCamera]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          {starting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {preview ? (
            <img src={preview} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          {!preview && isActive && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center">
                <p className="text-sm bg-black/50 px-3 py-1 rounded">Position plant in frame</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {preview ? (
            <>
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Use Photo
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleCapture} disabled={!isActive || starting}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
