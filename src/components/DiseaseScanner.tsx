import { useState } from 'react';
import { detectDisease } from '@/services/diseaseDetectionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CameraCapture } from './CameraCapture';

interface DiseaseScannerProps {
  onDetectionComplete: (result: { disease: string; confidence: number; recommendations: string[] }) => void;
  currentImage?: string;
}

export const DiseaseScanner = ({ onDetectionComplete, currentImage }: DiseaseScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [result, setResult] = useState<{ disease: string; confidence: number; recommendations: string[] } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImage(imageData);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setImage(imageData);
    setShowCamera(false);
    analyzeImage(imageData);
  };

  const analyzeImage = async (imageData: string) => {
    setScanning(true);
    setResult(null);

    try {
      const img = new Image();
      img.onload = async () => {
        const detection = await detectDisease(img);
        setResult(detection);
        onDetectionComplete(detection);
        setScanning(false);
      };
      img.src = imageData;
    } catch (error) {
      console.error('Analysis error:', error);
      setScanning(false);
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disease Detection</CardTitle>
        <CardDescription>
          Scan your plant's leaves to detect potential diseases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!image && (
          <div className="flex gap-2">
            <Button onClick={() => setShowCamera(true)} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <img src={image} alt="Plant" className="w-full h-full object-cover" />
            </div>

            {scanning && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Analyzing image...</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.disease === 'Healthy' ? (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-orange-500" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">{result.disease}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {result.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={result.disease === 'Healthy' ? 'default' : 'destructive'}>
                    {result.disease === 'Healthy' ? 'Healthy' : 'Needs Attention'}
                  </Badge>
                </div>

                {result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Recommendations:</p>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setImage(null);
                  setResult(null);
                }}
                className="flex-1"
              >
                Scan Again
              </Button>
              {result && (
                <Button onClick={() => setShowCamera(true)} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  New Photo
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
