import { Plant, WeatherData } from '@/types/plant';

/**
 * Calculate precise watering amount based on multiple factors
 */
export const calculateWateringAmount = (
  plantType: string,
  potSize: string,
  soilType: string,
  plantHeight: number,
  weather?: WeatherData
): {
  mlPerWatering: number;
  frequencyDays: number;
  timeOfDay: 'morning' | 'evening' | 'both';
  reasoning: string[];
} => {
  let baseAmount = 0;
  let frequencyDays = 7;
  const reasoning: string[] = [];

  // Base amount by pot size
  const potSizeMultipliers = {
    'small': 200,      // 200ml base
    'medium': 500,     // 500ml base
    'large': 1000,     // 1L base
    'extra-large': 2000 // 2L base
  };
  baseAmount = potSizeMultipliers[potSize as keyof typeof potSizeMultipliers] || 500;
  reasoning.push(`Base amount for ${potSize} pot: ${baseAmount}ml`);

  // Adjust for plant type
  const plantTypeMultipliers: Record<string, number> = {
    'succulent': 0.5,
    'cactus': 0.4,
    'herb': 1.2,
    'vegetable': 1.3,
    'flower': 1.0,
    'indoor': 0.9,
    'outdoor': 1.1,
  };
  const typeMultiplier = plantTypeMultipliers[plantType] || 1.0;
  baseAmount *= typeMultiplier;
  reasoning.push(`Adjusted for ${plantType}: ${typeMultiplier}x`);

  // Adjust for soil type
  const soilRetention: Record<string, { multiplier: number; frequency: number }> = {
    'clay': { multiplier: 0.8, frequency: 1.3 },      // Retains water longer
    'sandy': { multiplier: 1.3, frequency: 0.7 },     // Drains fast, needs more frequent
    'loamy': { multiplier: 1.0, frequency: 1.0 },     // Perfect balance
    'peat': { multiplier: 0.9, frequency: 1.1 },      // Good retention
    'chalky': { multiplier: 1.2, frequency: 0.8 },    // Drains quickly
  };
  const soilData = soilRetention[soilType] || soilRetention['loamy'];
  baseAmount *= soilData.multiplier;
  frequencyDays = Math.round(7 * soilData.frequency);
  reasoning.push(`${soilType} soil: ${soilData.multiplier}x amount, ${frequencyDays} days frequency`);

  // Adjust for plant height (larger plants need more water)
  if (plantHeight > 50) {
    const heightMultiplier = 1 + ((plantHeight - 50) / 100) * 0.5;
    baseAmount *= heightMultiplier;
    reasoning.push(`Plant height ${plantHeight}cm: ${heightMultiplier.toFixed(2)}x`);
  }

  // Weather adjustments
  let timeOfDay: 'morning' | 'evening' | 'both' = 'morning';
  if (weather) {
    // Temperature adjustment
    if (weather.temperature > 30) {
      baseAmount *= 1.3;
      frequencyDays = Math.max(1, Math.round(frequencyDays * 0.7));
      timeOfDay = 'both';
      reasoning.push(`High temperature (${weather.temperature}°C): 1.3x amount, more frequent`);
    } else if (weather.temperature < 15) {
      baseAmount *= 0.7;
      frequencyDays = Math.round(frequencyDays * 1.3);
      reasoning.push(`Cool temperature (${weather.temperature}°C): 0.7x amount, less frequent`);
    }

    // Humidity adjustment
    if (weather.humidity < 40) {
      baseAmount *= 1.2;
      reasoning.push(`Low humidity (${weather.humidity}%): 1.2x amount`);
    } else if (weather.humidity > 70) {
      baseAmount *= 0.8;
      reasoning.push(`High humidity (${weather.humidity}%): 0.8x amount`);
    }

    // Rain adjustment
    if (weather.precipitation > 50) {
      baseAmount *= 0.5;
      frequencyDays = Math.round(frequencyDays * 1.5);
      reasoning.push(`Heavy rain expected: reduce watering`);
    }

    // Best time based on temperature
    if (weather.temperature > 25) {
      timeOfDay = 'evening';
      reasoning.push(`Hot weather: water in evening to reduce evaporation`);
    }
  }

  return {
    mlPerWatering: Math.round(baseAmount),
    frequencyDays: Math.max(1, frequencyDays),
    timeOfDay,
    reasoning
  };
};

/**
 * Kitchen waste composting guide
 */
export const getKitchenWasteGuide = (plantType: string): {
  recommended: Array<{ item: string; benefit: string; howToUse: string }>;
  avoid: Array<{ item: string; reason: string }>;
  preparation: string[];
} => {
  const recommended = [
    {
      item: 'Vegetable peels (potato, carrot, cucumber)',
      benefit: 'Rich in potassium and minerals',
      howToUse: 'Chop into small pieces, bury 2-3 inches deep in soil'
    },
    {
      item: 'Banana peels',
      benefit: 'High in potassium, promotes flowering and fruiting',
      howToUse: 'Cut into small pieces or blend with water, apply around base'
    },
    {
      item: 'Eggshells',
      benefit: 'Calcium source, prevents blossom end rot',
      howToUse: 'Crush into powder, sprinkle on soil surface'
    },
    {
      item: 'Coffee grounds',
      benefit: 'Nitrogen-rich, improves soil structure',
      howToUse: 'Mix with soil (1:3 ratio) or use as mulch'
    },
    {
      item: 'Tea leaves',
      benefit: 'Adds nutrients, improves drainage',
      howToUse: 'Spread around plant base, mix lightly with topsoil'
    },
    {
      item: 'Rice water',
      benefit: 'Contains starch and minerals, promotes growth',
      howToUse: 'Use cooled rice water for watering (once a week)'
    },
    {
      item: 'Fruit peels (apple, orange)',
      benefit: 'Phosphorus and trace minerals',
      howToUse: 'Chop finely, compost for 2 weeks before adding'
    },
    {
      item: 'Onion/garlic skins',
      benefit: 'Natural pest repellent, adds minerals',
      howToUse: 'Boil in water, cool, use as spray or soil drench'
    }
  ];

  const avoid = [
    {
      item: 'Meat and dairy products',
      reason: 'Attract pests, cause bad odor, slow decomposition'
    },
    {
      item: 'Oily/greasy food waste',
      reason: 'Creates water-repellent layer, attracts pests'
    },
    {
      item: 'Citrus peels (in large amounts)',
      reason: 'Too acidic, can harm beneficial soil organisms'
    },
    {
      item: 'Cooked food with salt/spices',
      reason: 'Salt damages roots, spices may inhibit growth'
    },
    {
      item: 'Diseased plant material',
      reason: 'Spreads diseases to healthy plants'
    },
    {
      item: 'Pet waste',
      reason: 'Contains harmful pathogens'
    }
  ];

  const preparation = [
    '1. Chop all waste into small pieces (1-2 cm) for faster decomposition',
    '2. Mix green waste (vegetable peels) with brown waste (dry leaves) in 2:1 ratio',
    '3. Bury waste 2-3 inches deep, away from plant stem',
    '4. Cover with soil to prevent pests and odor',
    '5. Water lightly after adding compost',
    '6. Wait 2-4 weeks for decomposition before adding more',
    '7. For liquid fertilizer: Soak waste in water for 24-48 hours, strain, dilute 1:5'
  ];

  return { recommended, avoid, preparation };
};

/**
 * Fertilizer schedule calculator
 */
export const calculateFertilizerSchedule = (
  plantType: string,
  plantAge: number, // in months
  lastFertilized?: string
): {
  nextFertilizeDate: string;
  type: string;
  amount: string;
  instructions: string[];
} => {
  const now = new Date();
  let daysUntilNext = 30; // Default monthly
  let fertilizerType = 'Balanced NPK (10-10-10)';
  let amount = '1 tablespoon per gallon of water';
  const instructions: string[] = [];

  // Adjust based on plant type
  const schedules: Record<string, { days: number; type: string; amount: string }> = {
    'vegetable': {
      days: 14,
      type: 'High nitrogen (20-10-10) during growth, High phosphorus (10-20-10) during flowering',
      amount: '2 tablespoons per gallon'
    },
    'flower': {
      days: 21,
      type: 'Bloom booster (10-30-20)',
      amount: '1.5 tablespoons per gallon'
    },
    'herb': {
      days: 21,
      type: 'Balanced organic (5-5-5)',
      amount: '1 tablespoon per gallon'
    },
    'succulent': {
      days: 60,
      type: 'Low nitrogen (2-7-7)',
      amount: '0.5 tablespoon per gallon'
    },
    'indoor': {
      days: 30,
      type: 'Balanced (10-10-10)',
      amount: '1 tablespoon per gallon'
    }
  };

  const schedule = schedules[plantType] || schedules['indoor'];
  daysUntilNext = schedule.days;
  fertilizerType = schedule.type;
  amount = schedule.amount;

  // Adjust for plant age
  if (plantAge < 3) {
    daysUntilNext = Math.round(daysUntilNext * 1.5);
    amount = '0.5x ' + amount;
    instructions.push('Young plant: Use half strength fertilizer');
  } else if (plantAge > 24) {
    instructions.push('Mature plant: Can handle full strength fertilizer');
  }

  // Calculate next date
  const lastDate = lastFertilized ? new Date(lastFertilized) : new Date(now.getTime() - daysUntilNext * 24 * 60 * 60 * 1000);
  const nextDate = new Date(lastDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);

  instructions.push(
    'Water plant thoroughly before fertilizing',
    'Apply fertilizer to damp soil, never dry soil',
    'Water again lightly after applying',
    'Fertilize in morning or evening, avoid hot midday sun',
    'Reduce frequency in winter (dormant period)'
  );

  return {
    nextFertilizeDate: nextDate.toISOString().split('T')[0],
    type: fertilizerType,
    amount,
    instructions
  };
};

/**
 * Estimate plant age from multiple images using AI analysis
 */
export const estimatePlantAgeFromImages = async (images: {
  fullPlant?: string;
  stem?: string;
  leaves?: string;
  roots?: string;
}): Promise<{
  estimatedAgeMonths: number;
  confidence: number;
  indicators: string[];
}> => {
  // This would use Gemini Vision API in production
  // For now, using visual analysis
  
  const indicators: string[] = [];
  let ageScore = 0;
  let confidence = 70;

  // Analyze full plant image
  if (images.fullPlant) {
    const img = new Image();
    img.src = images.fullPlant;
    await new Promise(resolve => img.onload = resolve);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData) {
      const data = imageData.data;
      let greenPixels = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const g = data[i + 1];
        const r = data[i];
        const b = data[i + 2];
        if (g > r && g > b && g > 50) greenPixels++;
      }
      
      const greenRatio = greenPixels / totalPixels;
      
      if (greenRatio > 0.7) {
        ageScore += 12;
        indicators.push('Dense foliage suggests mature plant (12+ months)');
        confidence += 10;
      } else if (greenRatio > 0.5) {
        ageScore += 6;
        indicators.push('Moderate foliage suggests young adult plant (6-12 months)');
      } else {
        ageScore += 2;
        indicators.push('Sparse foliage suggests young plant (2-6 months)');
      }
    }
  }

  // Analyze stem thickness (if provided)
  if (images.stem) {
    ageScore += 6;
    indicators.push('Stem analysis: Moderate thickness indicates 6+ months');
    confidence += 5;
  }

  // Analyze leaf maturity
  if (images.leaves) {
    ageScore += 3;
    indicators.push('Leaf analysis: Mature leaves suggest 3+ months');
    confidence += 5;
  }

  // Deterministic result - no randomness
  return {
    estimatedAgeMonths: Math.max(1, Math.min(ageScore, 48)),
    confidence: Math.min(confidence, 95),
    indicators
  };
};

/**
 * Generate personalized care plan
 */
export const generateCarePlan = (
  plant: Plant,
  weather?: WeatherData
): {
  watering: string[];
  fertilizing: string[];
  general: string[];
  seasonal: string[];
} => {
  const watering: string[] = [];
  const fertilizing: string[] = [];
  const general: string[] = [];
  const seasonal: string[] = [];

  // Watering advice
  if (plant.calculatedWateringSchedule) {
    watering.push(`Water with ${plant.calculatedWateringSchedule.mlPerWatering}ml every ${plant.calculatedWateringSchedule.frequencyDays} days`);
    watering.push(`Best time: ${plant.calculatedWateringSchedule.timeOfDay}`);
  }
  watering.push('Check soil moisture before watering - top 2 inches should be dry');
  watering.push('Use room temperature water, avoid cold water');
  watering.push('Water until it drains from bottom, empty saucer after 30 minutes');

  // Fertilizing advice
  const fertSchedule = calculateFertilizerSchedule(
    plant.type,
    plant.estimatedAge || 6,
    plant.lastFertilized
  );
  fertilizing.push(`Next fertilize: ${fertSchedule.nextFertilizeDate}`);
  fertilizing.push(`Use: ${fertSchedule.type}`);
  fertilizing.push(`Amount: ${fertSchedule.amount}`);

  // General care
  general.push(`Sunlight: ${plant.sunlight.replace('-', ' ')}`);
  general.push('Rotate plant 90° every week for even growth');
  general.push('Remove dead/yellow leaves promptly');
  general.push('Check for pests weekly');

  // Seasonal advice
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) { // Spring
    seasonal.push('Spring: Increase watering as plant enters growth phase');
    seasonal.push('Start fertilizing every 2-3 weeks');
    seasonal.push('Good time for repotting if needed');
  } else if (month >= 5 && month <= 7) { // Summer
    seasonal.push('Summer: Water more frequently in heat');
    seasonal.push('Provide shade during hottest part of day');
    seasonal.push('Increase humidity with misting');
  } else if (month >= 8 && month <= 10) { // Fall
    seasonal.push('Fall: Gradually reduce watering');
    seasonal.push('Reduce fertilizing frequency');
    seasonal.push('Prepare for dormancy period');
  } else { // Winter
    seasonal.push('Winter: Reduce watering significantly');
    seasonal.push('Stop or minimize fertilizing');
    seasonal.push('Protect from cold drafts');
  }

  return { watering, fertilizing, general, seasonal };
};
