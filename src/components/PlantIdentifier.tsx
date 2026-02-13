import { useState } from 'react';
import { identifyPlant, estimatePlantAge } from '@/services/plantIdentificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CameraCapture } from './CameraCapture';

interface PlantIdentifierProps {
  onIdentificationComplete: (result: {
    predictions: Array<{
      commonName: string;
      scientificName: string;
      confidence: number;
    }>;
    scientificName: string;
    commonName: string;
    species: string;
    family: string;
    confidence: number;
    characteristics: string[];
    detailedDescription: string;
    careInstructions: string[];
    interestingFacts: string[];
    seasonalTips: string[];
    suggestedCare: {
      type: string;
      waterFrequency: string;
      sunlight: string;
    };
    visualFeatures: any;
    benefits: string[];
    commonIssues: string[];
    toxicity?: string;
    estimatedAge: number;
    image: string;
  }) => void;
  currentImage?: string;
}

export const PlantIdentifier = ({ onIdentificationComplete, currentImage }: PlantIdentifierProps) => {
  const [identifying, setIdentifying] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [result, setResult] = useState<any>(null);

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
    setIdentifying(true);
    setResult(null);

    try {
      const img = new Image();
      img.onload = async () => {
        const identification = await identifyPlant(img);
        const age = estimatePlantAge(img);
        
        const fullResult = {
          ...identification,
          estimatedAge: age,
          image: imageData,
        };
        
        setResult(fullResult);
        onIdentificationComplete(fullResult);
        setIdentifying(false);
      };
      img.src = imageData;
    } catch (error) {
      console.error('Identification error:', error);
      setIdentifying(false);
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
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Plant Identification
        </CardTitle>
        <CardDescription>
          Capture or upload a photo to automatically identify your plant
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

            {identifying && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Identifying plant...</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-3">
                {result.predictions && result.predictions.length > 1 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Top Predictions:</p>
                    <div className="space-y-2">
                      {result.predictions.map((pred: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">{pred.commonName}</span>
                            <span className="text-muted-foreground italic text-xs ml-2">
                              {pred.scientificName}
                            </span>
                          </div>
                          <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                            {pred.confidence.toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{result.commonName}</p>
                      <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
                      {result.family && (
                        <p className="text-xs text-muted-foreground">Family: {result.family}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {result.confidence.toFixed(1)}% • Est. Age: {result.estimatedAge} months
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Identified</Badge>
                </div>

                {result.detailedDescription && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-semibold mb-1">AI Analysis:</p>
                    <p className="text-sm text-muted-foreground">{result.detailedDescription}</p>
                  </div>
                )}

                {result.careInstructions && result.careInstructions.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Care Instructions:</p>
                    <ul className="space-y-1">
                      {result.careInstructions.slice(0, 5).map((instruction: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.interestingFacts && result.interestingFacts.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Interesting Facts:</p>
                    <ul className="space-y-1">
                      {result.interestingFacts.map((fact: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">💡</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="font-semibold text-sm mb-2">Suggested Care:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium capitalize">{result.suggestedCare.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Water:</span>
                      <span className="ml-2 font-medium capitalize">{result.suggestedCare.waterFrequency.replace('-', ' ')}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Sunlight:</span>
                      <span className="ml-2 font-medium capitalize">{result.suggestedCare.sunlight.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                {result.toxicity && (
                  <Alert variant={result.toxicity.toLowerCase().includes('toxic') ? 'destructive' : 'default'}>
                    <AlertDescription>
                      <strong>Safety:</strong> {result.toxicity}
                    </AlertDescription>
                  </Alert>
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
