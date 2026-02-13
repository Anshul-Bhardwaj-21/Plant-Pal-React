import { Plant, WeatherData } from '@/types/plant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Droplets, 
  Sprout, 
  Leaf, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { 
  calculateWateringAmount, 
  getKitchenWasteGuide, 
  calculateFertilizerSchedule,
  generateCarePlan
} from '@/services/careCalculationService';

interface CareGuideProps {
  plant: Plant;
  weather?: WeatherData;
}

export const CareGuide = ({ plant, weather }: CareGuideProps) => {
  const wateringCalc = calculateWateringAmount(
    plant.type,
    plant.potSize || 'medium',
    plant.soilType || 'loamy',
    plant.plantHeight || 30,
    weather || undefined
  );

  const kitchenWaste = getKitchenWasteGuide(plant.type);
  
  const fertilizerSchedule = calculateFertilizerSchedule(
    plant.type,
    plant.estimatedAge || 6,
    plant.lastFertilized
  );

  const carePlan = generateCarePlan(plant, weather);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Personalized Care Guide
        </CardTitle>
        <CardDescription>
          AI-calculated recommendations based on your plant's specific needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="watering" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="watering">Watering</TabsTrigger>
            <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
            <TabsTrigger value="compost">Compost</TabsTrigger>
            <TabsTrigger value="care">Care Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="watering" className="space-y-4">
            <Alert>
              <Droplets className="h-4 w-4" />
              <AlertDescription>
                <strong>Calculated Watering Schedule</strong>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount per watering</p>
                <p className="text-2xl font-bold text-blue-600">{wateringCalc.mlPerWatering}ml</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="text-2xl font-bold text-green-600">Every {wateringCalc.frequencyDays} days</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Best Time to Water
              </p>
              <Badge variant="outline" className="capitalize">
                {wateringCalc.timeOfDay}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm">Calculation Factors:</p>
              <ul className="space-y-1">
                {wateringCalc.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm">Watering Tips:</p>
              <ul className="space-y-1">
                {carePlan.watering.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💧</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="fertilizer" className="space-y-4">
            <Alert>
              <Sprout className="h-4 w-4" />
              <AlertDescription>
                <strong>Fertilizer Schedule</strong>
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Next Fertilizing Date</p>
              <p className="text-xl font-bold text-green-600">
                {new Date(fertilizerSchedule.nextFertilizeDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-sm mb-1">Recommended Type:</p>
                <p className="text-sm text-muted-foreground">{fertilizerSchedule.type}</p>
              </div>

              <div>
                <p className="font-semibold text-sm mb-1">Amount:</p>
                <p className="text-sm text-muted-foreground">{fertilizerSchedule.amount}</p>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Instructions:</p>
                <ul className="space-y-1">
                  {fertilizerSchedule.instructions.map((instruction, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">{idx + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compost" className="space-y-4">
            <Alert>
              <Leaf className="h-4 w-4" />
              <AlertDescription>
                <strong>Kitchen Waste Composting Guide</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-sm mb-3 text-green-600">✅ Recommended Kitchen Waste:</p>
                <div className="space-y-3">
                  {kitchenWaste.recommended.map((item, idx) => (
                    <div key={idx} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="font-medium text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Benefit:</strong> {item.benefit}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>How to use:</strong> {item.howToUse}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm mb-3 text-red-600">❌ Avoid These Items:</p>
                <div className="space-y-2">
                  {kitchenWaste.avoid.map((item, idx) => (
                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="font-medium text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Reason:</strong> {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Preparation Steps:</p>
                <ul className="space-y-1">
                  {kitchenWaste.preparation.map((step, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="care" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Complete Care Plan</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Watering Guidelines
                </p>
                <ul className="space-y-1">
                  {carePlan.watering.map((tip, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-green-500" />
                  Fertilizing Guidelines
                </p>
                <ul className="space-y-1">
                  {carePlan.fertilizing.map((tip, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  General Care
                </p>
                <ul className="space-y-1">
                  {carePlan.general.map((tip, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Seasonal Advice
                </p>
                <ul className="space-y-1">
                  {carePlan.seasonal.map((tip, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
