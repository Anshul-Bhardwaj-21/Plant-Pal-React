import { Plant, PlantReminder, PlantStats, WATER_FREQUENCY_DAYS } from '@/types/plant';

export const getDaysSinceLastWatered = (lastWatered: string): number => {
  const lastWateredDate = new Date(lastWatered);
  const today = new Date();
  const diffTime = today.getTime() - lastWateredDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isPlantOverdue = (plant: Plant): boolean => {
  const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered);
  const requiredDays = WATER_FREQUENCY_DAYS[plant.waterFrequency];
  return daysSinceWatered >= requiredDays;
};

export const getDaysUntilWatering = (plant: Plant): number => {
  const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered);
  const requiredDays = WATER_FREQUENCY_DAYS[plant.waterFrequency];
  return requiredDays - daysSinceWatered;
};

export const getPlantReminders = (plants: Plant[]): PlantReminder[] => {
  const reminders: PlantReminder[] = [];

  plants.forEach((plant) => {
    const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered);
    const requiredDays = WATER_FREQUENCY_DAYS[plant.waterFrequency];
    const daysOverdue = daysSinceWatered - requiredDays;

    if (daysOverdue >= 0) {
      reminders.push({
        plantId: plant.id,
        plantName: plant.name,
        type: 'water',
        message: daysOverdue === 0 
          ? `Water your ${plant.name} today!`
          : `Your ${plant.name} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue for watering!`,
        isOverdue: daysOverdue > 0,
        daysOverdue,
      });
    }

    // Sunlight reminders based on plant requirements
    if (plant.sunlight === 'full-sun' || plant.sunlight === 'partial-sun') {
      reminders.push({
        plantId: plant.id,
        plantName: plant.name,
        type: 'sunlight',
        message: plant.sunlight === 'full-sun'
          ? `Make sure ${plant.name} gets plenty of sunlight today!`
          : `Move ${plant.name} to a bright spot with partial sunlight.`,
        isOverdue: false,
        daysOverdue: 0,
      });
    }
  });

  // Sort by overdue status and days overdue
  return reminders.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return b.daysOverdue - a.daysOverdue;
  });
};

export const getPlantStats = (plants: Plant[]): PlantStats => {
  const today = new Date().toISOString().split('T')[0];
  
  const wateredToday = plants.filter((p) => p.lastWatered === today).length;
  const overdueCount = plants.filter(isPlantOverdue).length;
  const healthyCount = plants.length - overdueCount;

  // Environmental impact calculations
  // Average plant absorbs about 2.5kg CO2 per year
  // Average plant produces about 2.5kg oxygen per year
  const co2PerPlantPerYear = 2.5;
  const oxygenPerPlantPerYear = 2.5;

  return {
    totalPlants: plants.length,
    wateredToday,
    dueForWatering: overdueCount,
    healthyPlants: healthyCount,
    neglectedPlants: overdueCount,
    co2Absorbed: plants.length * co2PerPlantPerYear,
    oxygenProduced: plants.length * oxygenPerPlantPerYear,
  };
};

export const getWeeklyWateringData = (plants: Plant[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Generate mock data based on plant count for visualization
  return days.map((day, index) => {
    const plantsWatered = Math.floor(Math.random() * (plants.length + 1));
    return {
      day,
      watered: index <= dayOfWeek ? plantsWatered : 0,
    };
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
