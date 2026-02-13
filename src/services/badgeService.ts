import { Plant, Badge, CareHistoryEntry } from '@/types/plant';

export const calculateHealthScore = (plant: Plant): number => {
  let score = 100;
  
  const daysSinceWatered = Math.floor(
    (Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const waterFreqDays: Record<string, number> = {
    'daily': 1,
    'every-2-days': 2,
    'weekly': 7,
    'bi-weekly': 14,
    'monthly': 30,
  };
  
  const expectedDays = waterFreqDays[plant.waterFrequency] || 7;
  const overdueDays = daysSinceWatered - expectedDays;
  
  if (overdueDays > 0) {
    score -= overdueDays * 5;
  }
  
  if (plant.diseaseDetection && !plant.diseaseDetection.treated) {
    score -= 20;
  }
  
  const careHistory = plant.careHistory || [];
  const recentCare = careHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    const daysSince = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  });
  
  score += Math.min(recentCare.length * 2, 20);
  
  return Math.max(0, Math.min(100, score));
};

export const checkAndAwardBadges = (plants: Plant[], plant: Plant): Badge[] => {
  const newBadges: Badge[] = [];
  const existingBadgeIds = (plant.badges || []).map(b => b.id);
  
  const careHistory = plant.careHistory || [];
  const waterEntries = careHistory.filter(e => e.type === 'water');
  
  if (waterEntries.length >= 7 && !existingBadgeIds.includes('water-week')) {
    newBadges.push({
      id: 'water-week',
      name: 'Week Warrior',
      description: 'Watered your plant for 7 days',
      icon: '💧',
      earnedAt: new Date().toISOString(),
      category: 'streak',
    });
  }
  
  if (waterEntries.length >= 30 && !existingBadgeIds.includes('water-month')) {
    newBadges.push({
      id: 'water-month',
      name: 'Monthly Master',
      description: 'Watered your plant for 30 days',
      icon: '🌊',
      earnedAt: new Date().toISOString(),
      category: 'streak',
    });
  }
  
  const healthScore = calculateHealthScore(plant);
  if (healthScore >= 90 && !existingBadgeIds.includes('perfect-health')) {
    newBadges.push({
      id: 'perfect-health',
      name: 'Perfect Health',
      description: 'Maintained 90+ health score',
      icon: '⭐',
      earnedAt: new Date().toISOString(),
      category: 'health',
    });
  }
  
  if (plants.length >= 5 && !existingBadgeIds.includes('collector-5')) {
    newBadges.push({
      id: 'collector-5',
      name: 'Plant Collector',
      description: 'Own 5 plants',
      icon: '🌿',
      earnedAt: new Date().toISOString(),
      category: 'collection',
    });
  }
  
  if (plants.length >= 10 && !existingBadgeIds.includes('collector-10')) {
    newBadges.push({
      id: 'collector-10',
      name: 'Green Thumb',
      description: 'Own 10 plants',
      icon: '🌳',
      earnedAt: new Date().toISOString(),
      category: 'collection',
    });
  }
  
  const diseaseChecks = careHistory.filter(e => e.type === 'disease-check');
  if (diseaseChecks.length >= 10 && !existingBadgeIds.includes('health-monitor')) {
    newBadges.push({
      id: 'health-monitor',
      name: 'Health Monitor',
      description: 'Performed 10 disease checks',
      icon: '🔍',
      earnedAt: new Date().toISOString(),
      category: 'care',
    });
  }
  
  const plantAge = plant.estimatedAge || 0;
  if (plantAge >= 12 && !existingBadgeIds.includes('year-keeper')) {
    newBadges.push({
      id: 'year-keeper',
      name: 'Year Keeper',
      description: 'Kept a plant for over a year',
      icon: '🎂',
      earnedAt: new Date().toISOString(),
      category: 'care',
    });
  }
  
  return newBadges;
};

export const getCareScore = (plant: Plant): number => {
  const careHistory = plant.careHistory || [];
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(plant.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceCreated === 0) return 100;
  
  const expectedCareActions = Math.floor(daysSinceCreated / 3);
  const actualCareActions = careHistory.length;
  
  const score = Math.min((actualCareActions / Math.max(expectedCareActions, 1)) * 100, 100);
  
  return Math.round(score);
};
