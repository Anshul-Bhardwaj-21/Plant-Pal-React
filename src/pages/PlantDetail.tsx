import { useParams, useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlants';
import { useWeather } from '@/hooks/useWeather';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatBot } from '@/components/ChatBot';
import { WeatherWidget } from '@/components/WeatherWidget';
import { DiseaseScanner } from '@/components/DiseaseScanner';
import { ArrowLeft, Droplets, Sun, Calendar, AlertCircle, CheckCircle2, Edit, TrendingUp, Award, Activity, Camera } from 'lucide-react';
import { PLANT_TYPE_LABELS, WATER_FREQUENCY_LABELS, SUNLIGHT_LABELS } from '@/types/plant';
import { getDaysSinceLastWatered, getDaysUntilWatering } from '@/lib/plantUtils';
import { calculateHealthScore, getCareScore, checkAndAwardBadges } from '@/services/badgeService';
import { toast } from 'sonner';
import { useState } from 'react';
import { PlantForm } from '@/components/PlantForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CameraCapture } from '@/components/CameraCapture';
import { identifyPlant, estimatePlantAge } from '@/services/plantIdentificationService';
import { uploadPlantImage } from '@/services/storageService';
import { CareGuide } from '@/components/CareGuide';
import { AgeEstimator } from '@/components/AgeEstimator';
import { Charts } from '@/components/Charts';

const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plants, updatePlant, waterPlant } = usePlants();
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const plant = plants.find((p) => p.id === id);

  if (!plant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plant not found</h1>
          <Button onClick={() => navigate('/my-plants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Plants
          </Button>
        </div>
      </div>
    );
  }

  const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered);
  const daysUntilWatering = getDaysUntilWatering(plant);
  const healthScore = calculateHealthScore(plant);
  const careScore = getCareScore(plant);

  const handleWater = async () => {
    try {
      const careHistory = plant.careHistory || [];
      careHistory.push({
        id: `care-${Date.now()}`,
        type: 'water',
        date: new Date().toISOString(),
      });

      await waterPlant(plant.id);
      await updatePlant(plant.id, { careHistory });

      const newBadges = checkAndAwardBadges(plants, { ...plant, careHistory });
      if (newBadges.length > 0) {
        const allBadges = [...(plant.badges || []), ...newBadges];
        await updatePlant(plant.id, { badges: allBadges });
        toast.success(`${plant.name} watered! 🎉 You earned ${newBadges.length} new badge(s)!`);
      } else {
        toast.success(`${plant.name} has been watered! 💧`);
      }
    } catch (error) {
      toast.error('Failed to water plant. Please try again.');
    }
  };

  const handleDiseaseDetection = async (result: { disease: string; confidence: number; recommendations: string[] }) => {
    try {
      const careHistory = plant.careHistory || [];
      careHistory.push({
        id: `care-${Date.now()}`,
        type: 'disease-check',
        date: new Date().toISOString(),
        diseaseDetected: result.disease !== 'Healthy',
      });

      await updatePlant(plant.id, {
        diseaseDetection: {
          disease: result.disease,
          confidence: result.confidence,
          detectedAt: new Date().toISOString(),
          recommendations: result.recommendations,
          treated: false,
        },
        careHistory,
      });
      toast.success('Disease detection complete!');
    } catch (error) {
      toast.error('Failed to save disease detection. Please try again.');
    }
  };

  const handleEditSubmit = async (data: any) => {
    try {
      await updatePlant(plant.id, data);
      setShowEditDialog(false);
      toast.success('Plant updated successfully!');
    } catch (error) {
      toast.error('Failed to update plant. Please try again.');
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    setShowCamera(false);
    setAnalyzing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        const identification = await identifyPlant(img);
        const age = estimatePlantAge(img);
        const imageUrl = await uploadPlantImage(imageData, plant.id);

        await updatePlant(plant.id, {
          image: imageUrl,
          identificationData: {
            scientificName: identification.scientificName,
            commonName: identification.commonName,
            species: identification.species,
            family: identification.family,
            confidence: identification.confidence,
            identifiedAt: new Date().toISOString(),
            characteristics: identification.characteristics,
            detailedDescription: identification.detailedDescription,
            careInstructions: identification.careInstructions,
            interestingFacts: identification.interestingFacts,
            seasonalTips: identification.seasonalTips,
            visualFeatures: identification.visualFeatures,
            benefits: identification.benefits,
            commonIssues: identification.commonIssues,
            toxicity: identification.toxicity,
          },
          estimatedAge: age,
        });

        toast.success('Plant image updated and analyzed!');
        setAnalyzing(false);
      };
      img.src = imageData;
    } catch (error) {
      console.error('Error analyzing plant:', error);
      toast.error('Failed to analyze plant image.');
      setAnalyzing(false);
    }
  };

  const diseaseHistory = (plant.careHistory || []).filter(entry => entry.type === 'disease-check');
  const totalDiseaseChecks = diseaseHistory.length;
  const diseaseDetections = diseaseHistory.filter(entry => entry.diseaseDetected).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/my-plants')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Plants
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{plant.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{PLANT_TYPE_LABELS[plant.type]}</Badge>
                    {plant.identificationData && (
                      <Badge variant="outline" className="italic">
                        {plant.identificationData.scientificName}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleWater}>
                    <Droplets className="mr-2 h-4 w-4" />
                    Water Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {plant.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden group">
                  <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setShowCamera(true)}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Update Photo
                  </Button>
                </div>
              )}

              {!plant.image && (
                <div className="w-full h-64 rounded-lg border-2 border-dashed flex items-center justify-center">
                  <Button onClick={() => setShowCamera(true)}>
                    <Camera className="mr-2 h-4 w-4" />
                    Add Plant Photo
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Health</p>
                    <p className="font-semibold text-lg">{healthScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Care Score</p>
                    <p className="font-semibold text-lg">{careScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold text-lg">{plant.estimatedAge || 6}mo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Badges</p>
                    <p className="font-semibold text-lg">{plant.badges?.length || 0}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="care">Care Guide</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="badges">Badges</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Droplets className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Watering</p>
                        <p className="font-semibold">{WATER_FREQUENCY_LABELS[plant.waterFrequency]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Sun className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sunlight</p>
                        <p className="font-semibold">{SUNLIGHT_LABELS[plant.sunlight]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Calendar className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Watered</p>
                        <p className="font-semibold">
                          {daysSinceWatered === 0 ? 'Today' : `${daysSinceWatered} days ago`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Calendar className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Next Watering</p>
                        <p className="font-semibold">
                          {daysUntilWatering <= 0 ? 'Today' : `In ${daysUntilWatering} days`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {plant.identificationData && (
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <p className="font-semibold text-sm">Plant Identification</p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Common Name:</span>{' '}
                          <span className="font-medium">{plant.identificationData.commonName}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Scientific Name:</span>{' '}
                          <span className="font-medium italic">{plant.identificationData.scientificName}</span>
                        </p>
                        {plant.identificationData.family && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Family:</span>{' '}
                            <span className="font-medium">{plant.identificationData.family}</span>
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="text-muted-foreground">Confidence:</span>{' '}
                          <span className="font-medium">{plant.identificationData.confidence.toFixed(1)}%</span>
                        </p>
                      </div>

                      {plant.identificationData.detailedDescription && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold mb-1">AI Analysis:</p>
                          <p className="text-sm text-muted-foreground">{plant.identificationData.detailedDescription}</p>
                        </div>
                      )}

                      {plant.identificationData.careInstructions && plant.identificationData.careInstructions.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold mb-2">Care Instructions:</p>
                          <ul className="space-y-1">
                            {plant.identificationData.careInstructions.map((instruction, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {plant.identificationData.interestingFacts && plant.identificationData.interestingFacts.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold mb-2">Interesting Facts:</p>
                          <ul className="space-y-1">
                            {plant.identificationData.interestingFacts.map((fact, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">💡</span>
                                <span>{fact}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {plant.identificationData.seasonalTips && plant.identificationData.seasonalTips.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold mb-2">Seasonal Tips:</p>
                          <ul className="space-y-1">
                            {plant.identificationData.seasonalTips.map((tip, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-orange-500 mt-0.5">🌱</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {plant.identificationData.toxicity && (
                        <div className="pt-2 border-t">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Safety:</span>{' '}
                            <span className={`font-medium ${plant.identificationData.toxicity.toLowerCase().includes('toxic') ? 'text-red-500' : 'text-green-500'}`}>
                              {plant.identificationData.toxicity}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {plant.notes && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{plant.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <Charts plant={plant} />

                  {plant.diseaseDetection && (
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {plant.diseaseDetection.disease === 'Healthy' ? (
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                          )}
                          <div>
                            <p className="font-semibold text-lg">{plant.diseaseDetection.disease}</p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {plant.diseaseDetection.confidence.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <Badge variant={plant.diseaseDetection.disease === 'Healthy' ? 'default' : 'destructive'}>
                          {plant.diseaseDetection.disease === 'Healthy' ? 'Healthy' : 'Needs Attention'}
                        </Badge>
                      </div>
                      {plant.diseaseDetection.recommendations && plant.diseaseDetection.recommendations.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm mb-2">Recommendations:</p>
                          <ul className="space-y-1">
                            {plant.diseaseDetection.recommendations.map((rec, index) => (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Disease Checks</p>
                      <p className="text-2xl font-bold">{totalDiseaseChecks}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Issues Found</p>
                      <p className="text-2xl font-bold">{diseaseDetections}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="care" className="space-y-4">
                  <CareGuide plant={plant} weather={weather || undefined} />
                  
                  <AgeEstimator
                    onAgeEstimated={async (ageMonths, confidence, indicators) => {
                      await updatePlant(plant.id, {
                        estimatedAge: ageMonths,
                        ageEstimationImages: {
                          fullPlant: plant.image
                        }
                      });
                      toast.success(`Age estimated: ${ageMonths} months (${confidence}% confidence)`);
                    }}
                    currentImages={plant.ageEstimationImages}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {plant.careHistory && plant.careHistory.length > 0 ? (
                    <div className="space-y-2">
                      {plant.careHistory.slice().reverse().map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            entry.type === 'water' ? 'bg-blue-500/20' :
                            entry.type === 'disease-check' ? 'bg-orange-500/20' :
                            'bg-green-500/20'
                          }`}>
                            {entry.type === 'water' && <Droplets className="h-5 w-5 text-blue-500" />}
                            {entry.type === 'disease-check' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm capitalize">{entry.type.replace('-', ' ')}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                            </p>
                            {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                          </div>
                          {entry.diseaseDetected && (
                            <Badge variant="destructive">Disease Found</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No care history yet. Start caring for your plant!</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="badges" className="space-y-4">
                  {plant.badges && plant.badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {plant.badges.map((badge) => (
                        <div key={badge.id} className="p-4 bg-muted rounded-lg text-center space-y-2">
                          <div className="text-4xl">{badge.icon}</div>
                          <p className="font-semibold">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No badges earned yet. Keep caring for your plant!</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <DiseaseScanner onDetectionComplete={handleDiseaseDetection} currentImage={plant.image} />

          <ChatBot plants={[plant]} weather={weather} selectedPlant={plant} />
        </div>

        <div className="space-y-6">
          <WeatherWidget weather={weather} loading={weatherLoading} onRefresh={refetchWeather} />
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {plant.name}</DialogTitle>
          </DialogHeader>
          <PlantForm plant={plant} onSubmit={handleEditSubmit} onCancel={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>

      {showCamera && (
        <Dialog open={showCamera} onOpenChange={setShowCamera}>
          <DialogContent className="max-w-3xl">
            <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
          </DialogContent>
        </Dialog>
      )}

      {analyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Analyzing plant image...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PlantDetail;
