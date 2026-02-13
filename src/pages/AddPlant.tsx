import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlants';
import { Plant } from '@/types/plant';
import { PlantForm } from '@/components/PlantForm';
import { PlantIdentifier } from '@/components/PlantIdentifier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AddPlant = () => {
  const navigate = useNavigate();
  const { addPlant } = usePlants();
  const [identificationResult, setIdentificationResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('scan');

  const handleIdentificationComplete = (result: any) => {
    setIdentificationResult(result);
    setCapturedImage(result.image || null);
    setActiveTab('details');
    toast.success('Plant identified! Fill in the remaining details.');
  };

  const handleSubmit = async (data: Omit<Plant, 'id' | 'createdAt'>) => {
    try {
      const plantData = {
        ...data,
        identificationData: identificationResult ? {
          scientificName: identificationResult.scientificName,
          commonName: identificationResult.commonName,
          species: identificationResult.species,
          family: identificationResult.family,
          confidence: identificationResult.confidence,
          identifiedAt: new Date().toISOString(),
          characteristics: identificationResult.characteristics,
          detailedDescription: identificationResult.detailedDescription,
          careInstructions: identificationResult.careInstructions,
          interestingFacts: identificationResult.interestingFacts,
          seasonalTips: identificationResult.seasonalTips,
          visualFeatures: identificationResult.visualFeatures,
          benefits: identificationResult.benefits,
          commonIssues: identificationResult.commonIssues,
          toxicity: identificationResult.toxicity,
        } : undefined,
        estimatedAge: identificationResult?.estimatedAge || 6,
      };

      await addPlant(plantData);
      toast.success(`${data.name} has been added to your garden! 🌱`);
      navigate('/my-plants');
    } catch (error) {
      toast.error('Failed to add plant. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Add New Plant</h1>
          <p className="text-muted-foreground">
            Scan your plant with AI or add details manually
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan Plant
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Plant Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  AI Plant Scanner
                </CardTitle>
                <CardDescription>
                  Take a photo of your plant and let AI identify it automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlantIdentifier 
                  onIdentificationComplete={(result) => {
                    handleIdentificationComplete(result);
                  }} 
                />
                
                {identificationResult && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab('details')}>
                      Continue to Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold text-sm">📸 Tips for Best Results</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Take a clear, well-lit photo of the plant</li>
                <li>• Include leaves and flowers if possible</li>
                <li>• Avoid blurry or dark images</li>
                <li>• Get close enough to see plant details</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Plant Details
                </CardTitle>
                <CardDescription>
                  {identificationResult 
                    ? 'Review and complete the plant information' 
                    : 'Fill in the details about your plant manually'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlantForm 
                  onSubmit={handleSubmit}
                  initialData={identificationResult ? {
                    name: identificationResult.commonName,
                    type: identificationResult.suggestedCare.type,
                    waterFrequency: identificationResult.suggestedCare.waterFrequency,
                    sunlight: identificationResult.suggestedCare.sunlight,
                    image: capturedImage,
                  } : undefined}
                />
              </CardContent>
            </Card>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold text-sm">💡 Care Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Choose the correct watering frequency based on your plant's needs</li>
                <li>• Indoor plants often need less frequent watering than outdoor plants</li>
                <li>• Succulents and cacti typically need watering every 1-2 weeks</li>
                <li>• Consider your local climate when setting sunlight requirements</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddPlant;
