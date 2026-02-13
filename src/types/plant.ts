export interface Plant {
  id: string;
  name: string;
  type: PlantType;
  waterFrequency: WaterFrequency;
  sunlight: SunlightRequirement;
  lastWatered: string;
  createdAt: string;
  notes?: string;
  image?: string;
  diseaseDetection?: DiseaseDetection;
  identificationData?: PlantIdentification;
  careHistory?: CareHistoryEntry[];
  healthScore?: number;
  estimatedAge?: number;
  badges?: Badge[];
  // New fields for advanced care
  potSize?: 'small' | 'medium' | 'large' | 'extra-large';
  soilType?: 'clay' | 'sandy' | 'loamy' | 'peat' | 'chalky';
  location?: 'indoor' | 'outdoor' | 'balcony' | 'greenhouse';
  plantHeight?: number; // in cm
  lastFertilized?: string;
  fertilizerType?: 'chemical' | 'organic' | 'compost' | 'kitchen-waste';
  ageEstimationImages?: {
    fullPlant?: string;
    stem?: string;
    leaves?: string;
    roots?: string;
  };
  calculatedWateringSchedule?: {
    mlPerWatering: number;
    frequencyDays: number;
    timeOfDay: 'morning' | 'evening' | 'both';
    adjustedForWeather: boolean;
  };
}

export interface PlantIdentification {
  scientificName: string;
  commonName: string;
  species: string;
  family?: string;
  confidence: number;
  identifiedAt: string;
  characteristics?: string[];
  detailedDescription?: string;
  careInstructions?: string[];
  interestingFacts?: string[];
  seasonalTips?: string[];
  visualFeatures?: {
    leafShape: string;
    leafColor: string;
    flowerColor?: string;
    size: string;
    texture: string;
  };
  benefits?: string[];
  commonIssues?: string[];
  toxicity?: string;
}

export interface CareHistoryEntry {
  id: string;
  type: 'water' | 'fertilize' | 'prune' | 'repot' | 'disease-check' | 'compost-added';
  date: string;
  notes?: string;
  diseaseDetected?: boolean;
  amount?: number; // ml for water, grams for fertilizer
  fertilizerType?: string;
  compostIngredients?: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'care' | 'streak' | 'health' | 'collection';
}

export interface DiseaseDetection {
  disease: string;
  confidence: number;
  detectedAt: string;
  recommendations?: string[];
  severity?: 'low' | 'medium' | 'high';
  treated?: boolean;
}

export interface DiseaseHistory {
  plantId: string;
  detections: DiseaseDetection[];
  totalDetections: number;
  lastDetection?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  feelsLike: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitation: number;
  humidity: number;
}

export type PlantType = 'flower' | 'vegetable' | 'indoor' | 'outdoor' | 'succulent' | 'herb';

export type WaterFrequency = 'daily' | 'every-2-days' | 'weekly' | 'bi-weekly' | 'monthly';

export type SunlightRequirement = 'full-sun' | 'partial-sun' | 'shade' | 'indirect-light';

export interface PlantReminder {
  plantId: string;
  plantName: string;
  type: 'water' | 'sunlight';
  message: string;
  isOverdue: boolean;
  daysOverdue: number;
}

export interface PlantStats {
  totalPlants: number;
  wateredToday: number;
  dueForWatering: number;
  healthyPlants: number;
  neglectedPlants: number;
  co2Absorbed: number;
  oxygenProduced: number;
}

export const PLANT_TYPE_LABELS: Record<PlantType, string> = {
  flower: 'Flower',
  vegetable: 'Vegetable',
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  succulent: 'Succulent',
  herb: 'Herb',
};

export const WATER_FREQUENCY_LABELS: Record<WaterFrequency, string> = {
  daily: 'Daily',
  'every-2-days': 'Every 2 Days',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-Weekly',
  monthly: 'Monthly',
};

export const SUNLIGHT_LABELS: Record<SunlightRequirement, string> = {
  'full-sun': 'Full Sun',
  'partial-sun': 'Partial Sun',
  shade: 'Shade',
  'indirect-light': 'Indirect Light',
};

export const WATER_FREQUENCY_DAYS: Record<WaterFrequency, number> = {
  daily: 1,
  'every-2-days': 2,
  weekly: 7,
  'bi-weekly': 14,
  monthly: 30,
};
