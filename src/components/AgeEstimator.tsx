import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { estimatePlantAgeFromImages } from '@/services/careCalculationService';

interface AgeEstimatorProps {
  onAgeEstimated: (ageMonths: number, confidence: number, indicators: string[]) => void;
  currentImages?: {
    fullPlant?: string;
    stem?: string;
    leaves?: string;
    roots?: string;
  };
}

export const AgeEstimator = ({ onAgeEstimated, currentImages }: AgeEstimatorProps) => {
  const [images, setImages] = useState<{
    fullPlant?: string;
    stem?: string;
    leaves?: string;
    roots?: string;
  }>(currentImages || {});
  
  const [showCamera, setShowCamera] = useState(false);
  const [currentCapture, setCurrentCapture] = useState<'fullPlant' | 'stem' | 'leaves' | 'roots' | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [result, setResult] = useState<{
    estimatedAgeMonths: number;
    confidence: number;
    indicators: string[];
  } | null>(null);

  const handleCameraCapture = (imageData: string) => {
    if (currentCapture) {
      setImages(prev => ({ ...prev, [currentCapture]: imageData }));
    }
    setShowCamera(false);
    setCurrentCapture(null);
  };

  const handleFileUpload = (type: 'fullPlant' | 'stem' | 'leaves' | 'roots', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImages(prev => ({ ...prev, [type]: imageData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEstimate = async () => {
    if (!images.fullPlant) {
      alert('Please provide at least a full plant image');
      return;
    }

    setEstimating(true);
    try {
      const estimation = await estimatePlantAgeFromImages(images);
      setResult(estimation);
      onAgeEstimated(estimation.estimatedAgeMonths, estimation.confidence, estimation.indicators);
    } catch (error) {
      console.error('Age estimation error:', error);
    } finally {
      setEstimating(false);
    }
  };

  if (showCamera && currentCapture) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => {
          setShowCamera(false);
          setCurrentCapture(null);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plant Age Estimation</CardTitle>
        <CardDescription>
          Upload multiple images for accurate age estimation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            For best results, provide images of: full plant, stem close-up, and leaves. More images = higher accuracy!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          {/* Full Plant */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Full Plant *</p>
            {images.fullPlant ? (
              <div className="relative">
                <img src={images.fullPlant} alt="Full plant" className="w-full h-32 object-cover rounded-lg" />
                <Badge className="absolute top-2 right-2" variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Captured
                </Badge>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentCapture('fullPlant');
                    setShowCamera(true);
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Camera
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('fullPlant', e)}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Stem */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Stem Close-up</p>
            {images.stem ? (
              <div className="relative">
                <img src={images.stem} alt="Stem" className="w-full h-32 object-cover rounded-lg" />
                <Badge className="absolute top-2 right-2" variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Captured
                </Badge>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentCapture('stem');
                    setShowCamera(true);
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Camera
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('stem', e)}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Leaves */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Leaves Close-up</p>
            {images.leaves ? (
              <div className="relative">
                <img src={images.leaves} alt="Leaves" className="w-full h-32 object-cover rounded-lg" />
                <Badge className="absolute top-2 right-2" variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Captured
                </Badge>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentCapture('leaves');
                    setShowCamera(true);
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Camera
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('leaves', e)}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Roots (optional) */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Roots (Optional)</p>
            {images.roots ? (
              <div className="relative">
                <img src={images.roots} alt="Roots" className="w-full h-32 object-cover rounded-lg" />
                <Badge className="absolute top-2 right-2" variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Captured
                </Badge>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentCapture('roots');
                    setShowCamera(true);
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Camera
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('roots', e)}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleEstimate}
          disabled={!images.fullPlant || estimating}
          className="w-full"
        >
          {estimating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Estimate Age'
          )}
        </Button>

        {result && (
          <div className="p-4 bg-primary/5 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Age</p>
                <p className="text-3xl font-bold text-primary">
                  {result.estimatedAgeMonths} months
                </p>
              </div>
              <Badge variant="outline">
                {result.confidence}% confidence
              </Badge>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Analysis Indicators:</p>
              <ul className="space-y-1">
                {result.indicators.map((indicator, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
