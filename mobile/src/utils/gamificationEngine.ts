/**
 * Gamification Engine for PlantPal
 * 
 * This module provides badge eligibility checking and awarding logic for the
 * gamification system. It handles 7 badge types across 4 categories:
 * - Care Badges: Health Monitor, Year Keeper
 * - Streak Badges: Week Warrior, Monthly Master
 * - Health Badges: Perfect Health
 * - Collection Badges: Plant Collector, Green Thumb
 */

import { Plant, CareAction, Badge, HealthSnapshot, BADGE_DEFINITIONS } from '../types';
import { getDaysSince } from './healthCalculator';

/**
 * Result of badge eligibility check
 */
export interface BadgeEligibilityResult {
  eligible: boolean;
  badgeId: string;
  plantId?: string; // For plant-specific badges
  progress?: number; // Current progress (e.g., 5 out of 10 disease checks)
  target?: number; // Target requirement (e.g., 10 disease checks)
}

/**
 * Check if user is eligible for Health Monitor badge
 * Requirement: Performed 10 disease checks
 * 
 * @param careHistory All care actions across all plants
 * @returns Eligibility result with progress
 */
export function checkHealthMonitorEligibility(
  careHistory: CareAction[]
): BadgeEligibilityResult {
  const diseaseChecks = careHistory.filter(
    action => action.type === 'disease_check'
  );
  
  const count = diseaseChecks.length;
  const target = BADGE_DEFINITIONS.HEALTH_MONITOR.requirement.count;
  
  return {
    eligible: count >= target,
    badgeId: BADGE_DEFINITIONS.HEALTH_MONITOR.id,
    progress: count,
    target,
  };
}

/**
 * Check if a plant is eligible for Year Keeper badge
 * Requirement: Plant has reached 365 days old
 * 
 * @param plant The plant to check
 * @returns Eligibility result with progress
 */
export function checkYearKeeperEligibility(plant: Plant): BadgeEligibilityResult {
  const target = BADGE_DEFINITIONS.YEAR_KEEPER.requirement.days;
  const age = plant.age;
  
  return {
    eligible: age >= target,
    badgeId: BADGE_DEFINITIONS.YEAR_KEEPER.id,
    plantId: plant.id,
    progress: age,
    target,
  };
}

/**
 * Calculate consecutive watering streak for a plant
 * 
 * @param plantId The plant ID to check
 * @param careHistory All care actions
 * @returns Number of consecutive days with watering
 */
export function calculateWateringStreak(
  plantId: string,
  careHistory: CareAction[]
): number {
  // Filter watering actions for this plant and sort by timestamp (newest first)
  const waterings = careHistory
    .filter(action => action.plantId === plantId && action.type === 'watering')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  if (waterings.length === 0) {
    return 0;
  }
  
  // Group waterings by date (YYYY-MM-DD)
  const wateringDates = new Set<string>();
  for (const watering of waterings) {
    const date = new Date(watering.timestamp).toISOString().split('T')[0];
    wateringDates.add(date);
  }
  
  // Convert to sorted array (newest first)
  const sortedDates = Array.from(wateringDates).sort().reverse();
  
  // Check for consecutive days starting from today or most recent watering
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);
  
  // Start from most recent watering date if it's not today
  if (sortedDates[0] !== today) {
    currentDate = new Date(sortedDates[0]);
  }
  
  // Count consecutive days backwards
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === expectedDate) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }
  
  return streak;
}

/**
 * Check if a plant is eligible for Week Warrior badge
 * Requirement: Watered for 7 consecutive days
 * 
 * @param plant The plant to check
 * @param careHistory All care actions
 * @returns Eligibility result with progress
 */
export function checkWeekWarriorEligibility(
  plant: Plant,
  careHistory: CareAction[]
): BadgeEligibilityResult {
  const streak = calculateWateringStreak(plant.id, careHistory);
  const target = BADGE_DEFINITIONS.WEEK_WARRIOR.requirement.days;
  
  return {
    eligible: streak >= target,
    badgeId: BADGE_DEFINITIONS.WEEK_WARRIOR.id,
    plantId: plant.id,
    progress: streak,
    target,
  };
}

/**
 * Check if a plant is eligible for Monthly Master badge
 * Requirement: Watered for 30 consecutive days
 * 
 * @param plant The plant to check
 * @param careHistory All care actions
 * @returns Eligibility result with progress
 */
export function checkMonthlyMasterEligibility(
  plant: Plant,
  careHistory: CareAction[]
): BadgeEligibilityResult {
  const streak = calculateWateringStreak(plant.id, careHistory);
  const target = BADGE_DEFINITIONS.MONTHLY_MASTER.requirement.days;
  
  return {
    eligible: streak >= target,
    badgeId: BADGE_DEFINITIONS.MONTHLY_MASTER.id,
    plantId: plant.id,
    progress: streak,
    target,
  };
}

/**
 * Check if a plant is eligible for Perfect Health badge
 * Requirement: Maintained 90+ health score for 7 consecutive days
 * 
 * @param plant The plant to check
 * @param healthSnapshots Health snapshots for this plant
 * @returns Eligibility result with progress
 */
export function checkPerfectHealthEligibility(
  plant: Plant,
  healthSnapshots: HealthSnapshot[]
): BadgeEligibilityResult {
  const target = BADGE_DEFINITIONS.PERFECT_HEALTH.requirement.days;
  const minScore = BADGE_DEFINITIONS.PERFECT_HEALTH.requirement.score;
  
  // Filter snapshots for this plant and sort by date (newest first)
  const plantSnapshots = healthSnapshots
    .filter(snapshot => snapshot.plantId === plant.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  if (plantSnapshots.length === 0) {
    return {
      eligible: false,
      badgeId: BADGE_DEFINITIONS.PERFECT_HEALTH.id,
      plantId: plant.id,
      progress: 0,
      target,
    };
  }
  
  // Group snapshots by date and get the highest score for each day
  const dailyScores = new Map<string, number>();
  for (const snapshot of plantSnapshots) {
    const date = snapshot.date; // Already in YYYY-MM-DD format
    const currentMax = dailyScores.get(date) || 0;
    dailyScores.set(date, Math.max(currentMax, snapshot.healthScore));
  }
  
  // Get sorted dates (newest first)
  const sortedDates = Array.from(dailyScores.keys()).sort().reverse();
  
  // Count consecutive days with 90+ health score
  let consecutiveDays = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date(today);
  
  // Start from most recent snapshot date if it's not today
  if (sortedDates[0] !== today) {
    currentDate = new Date(sortedDates[0]);
  }
  
  for (let i = 0; i < sortedDates.length && i < target; i++) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    const score = dailyScores.get(sortedDates[i]);
    
    if (sortedDates[i] === expectedDate && score && score >= minScore) {
      consecutiveDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return {
    eligible: consecutiveDays >= target,
    badgeId: BADGE_DEFINITIONS.PERFECT_HEALTH.id,
    plantId: plant.id,
    progress: consecutiveDays,
    target,
  };
}

/**
 * Check if user is eligible for Plant Collector badge
 * Requirement: Own 5 plants
 * 
 * @param plants All user's plants
 * @returns Eligibility result with progress
 */
export function checkPlantCollectorEligibility(plants: Plant[]): BadgeEligibilityResult {
  const count = plants.length;
  const target = BADGE_DEFINITIONS.PLANT_COLLECTOR.requirement.count;
  
  return {
    eligible: count >= target,
    badgeId: BADGE_DEFINITIONS.PLANT_COLLECTOR.id,
    progress: count,
    target,
  };
}

/**
 * Check if user is eligible for Green Thumb badge
 * Requirement: Own 10 plants
 * 
 * @param plants All user's plants
 * @returns Eligibility result with progress
 */
export function checkGreenThumbEligibility(plants: Plant[]): BadgeEligibilityResult {
  const count = plants.length;
  const target = BADGE_DEFINITIONS.GREEN_THUMB.requirement.count;
  
  return {
    eligible: count >= target,
    badgeId: BADGE_DEFINITIONS.GREEN_THUMB.id,
    progress: count,
    target,
  };
}

/**
 * Check eligibility for all badge types
 * 
 * @param plants All user's plants
 * @param careHistory All care actions
 * @param healthSnapshots All health snapshots
 * @returns Array of eligibility results for all badges
 */
export function checkAllBadgeEligibility(
  plants: Plant[],
  careHistory: CareAction[],
  healthSnapshots: HealthSnapshot[]
): BadgeEligibilityResult[] {
  const results: BadgeEligibilityResult[] = [];
  
  // Check collection badges (user-level)
  results.push(checkPlantCollectorEligibility(plants));
  results.push(checkGreenThumbEligibility(plants));
  
  // Check care badges (user-level)
  results.push(checkHealthMonitorEligibility(careHistory));
  
  // Check plant-specific badges
  for (const plant of plants) {
    results.push(checkYearKeeperEligibility(plant));
    results.push(checkWeekWarriorEligibility(plant, careHistory));
    results.push(checkMonthlyMasterEligibility(plant, careHistory));
    results.push(checkPerfectHealthEligibility(plant, healthSnapshots));
  }
  
  return results;
}

/**
 * Award new badges based on eligibility check
 * 
 * @param eligibilityResults Results from checkAllBadgeEligibility
 * @param existingBadges Currently earned badges
 * @returns Array of newly earned badges
 */
export function awardNewBadges(
  eligibilityResults: BadgeEligibilityResult[],
  existingBadges: Badge[]
): Badge[] {
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();
  
  // Create a set of existing badge keys for quick lookup
  // Key format: "badgeId" or "badgeId:plantId" for plant-specific badges
  const existingBadgeKeys = new Set<string>();
  for (const badge of existingBadges) {
    const key = badge.plantId ? `${badge.id}:${badge.plantId}` : badge.id;
    existingBadgeKeys.add(key);
  }
  
  // Check each eligible badge
  for (const result of eligibilityResults) {
    if (!result.eligible) {
      continue;
    }
    
    const key = result.plantId ? `${result.badgeId}:${result.plantId}` : result.badgeId;
    
    // Skip if badge already earned
    if (existingBadgeKeys.has(key)) {
      continue;
    }
    
    // Get badge definition
    const badgeDef = Object.values(BADGE_DEFINITIONS).find(
      def => def.id === result.badgeId
    );
    
    if (!badgeDef) {
      continue;
    }
    
    // Create new badge
    const newBadge: Badge = {
      id: result.badgeId,
      type: badgeDef.type,
      name: badgeDef.name,
      description: badgeDef.description,
      earnedAt: now,
      plantId: result.plantId,
      icon: badgeDef.icon,
    };
    
    newBadges.push(newBadge);
  }
  
  return newBadges;
}

/**
 * Get badge progress for display in UI
 * 
 * @param badgeId The badge ID to get progress for
 * @param plantId Optional plant ID for plant-specific badges
 * @param eligibilityResults Results from checkAllBadgeEligibility
 * @returns Progress information or null if not found
 */
export function getBadgeProgress(
  badgeId: string,
  plantId: string | undefined,
  eligibilityResults: BadgeEligibilityResult[]
): { progress: number; target: number; percentage: number } | null {
  const result = eligibilityResults.find(
    r => r.badgeId === badgeId && r.plantId === plantId
  );
  
  if (!result || result.progress === undefined || result.target === undefined) {
    return null;
  }
  
  return {
    progress: result.progress,
    target: result.target,
    percentage: Math.min(100, Math.round((result.progress / result.target) * 100)),
  };
}
