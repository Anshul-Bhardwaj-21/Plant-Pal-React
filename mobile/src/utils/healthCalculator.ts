/**
 * Health Calculation Utilities for PlantPal
 * 
 * This module provides algorithms for calculating plant health scores and care scores
 * based on various factors including watering consistency, disease status, care frequency,
 * and plant age.
 */

import { Plant, CareAction } from '../types';

/**
 * Helper function to calculate days since a given date
 * @param dateString ISO 8601 date string
 * @returns Number of days since the date (rounded down)
 */
export function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate health score for a plant based on multiple factors
 * 
 * Algorithm:
 * - Base score: 100
 * - Watering factor: Deduct points based on days overdue for watering
 * - Disease factor: Deduct 20 points if plant has untreated disease
 * - Care frequency factor: Bonus points for recent care activity
 * - Age factor: Slight bonus for older plants (survival bonus)
 * 
 * Score is clamped between 0 and 100
 * 
 * @param plant The plant to calculate health score for
 * @param careHistory Array of care actions for this plant
 * @returns Health score (0-100)
 */
export function calculateHealthScore(
  plant: Plant,
  careHistory: CareAction[]
): number {
  let score = 100;

  // Watering factor - penalize overdue watering
  if (plant.lastWatered) {
    const daysSinceWatered = getDaysSince(plant.lastWatered);
    const daysOverdue = daysSinceWatered - plant.wateringFrequency;
    
    if (daysOverdue > 0) {
      // Deduct 5 points per day overdue, up to 50 points max
      const wateringPenalty = Math.min(daysOverdue * 5, 50);
      score -= wateringPenalty;
    } else if (daysOverdue >= -1) {
      // Bonus for watering on time (within 1 day of schedule)
      score += 5;
    }
  } else {
    // Never watered - significant penalty based on age
    const daysSinceCreated = getDaysSince(plant.createdAt);
    if (daysSinceCreated > plant.wateringFrequency) {
      const wateringPenalty = Math.min((daysSinceCreated - plant.wateringFrequency) * 5, 50);
      score -= wateringPenalty;
    }
  }

  // Disease factor - deduct 20 points for untreated disease
  if (plant.diseaseStatus?.hasDisease && !plant.diseaseStatus.treated) {
    score -= 20;
  }

  // Care frequency factor - bonus for recent care activity (last 7 days)
  const recentCareActions = careHistory.filter(action => {
    const daysSinceAction = getDaysSince(action.timestamp);
    return daysSinceAction <= 7;
  });
  
  // Add 2 points per recent care action, up to 10 points max
  const careBonus = Math.min(recentCareActions.length * 2, 10);
  score += careBonus;

  // Age factor - small bonus for keeping plant alive longer
  const ageInDays = plant.age;
  if (ageInDays >= 365) {
    score += 10; // 1 year survival bonus
  } else if (ageInDays >= 180) {
    score += 5; // 6 month survival bonus
  } else if (ageInDays >= 90) {
    score += 3; // 3 month survival bonus
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate care score based on user engagement with plant care
 * 
 * Algorithm:
 * - Count care actions in the last 30 days
 * - Apply weights to different action types:
 *   - watering: 1 point (basic care)
 *   - disease_check: 3 points (proactive monitoring)
 *   - fertilizing: 2 points (advanced care)
 *   - pruning: 2 points (maintenance)
 *   - repotting: 4 points (major care event)
 * - Normalize to 0-100 scale (30 weighted actions = 100 score)
 * 
 * @param careHistory Array of care actions for this plant
 * @returns Care score (0-100)
 */
export function calculateCareScore(careHistory: CareAction[]): number {
  // Filter care actions from last 30 days
  const recentActions = careHistory.filter(action => {
    const daysSinceAction = getDaysSince(action.timestamp);
    return daysSinceAction <= 30;
  });

  // Weight different action types
  const actionWeights: Record<CareAction['type'], number> = {
    watering: 1,
    disease_check: 3,
    fertilizing: 2,
    pruning: 2,
    repotting: 4,
  };

  // Calculate weighted score
  let weightedScore = 0;
  for (const action of recentActions) {
    weightedScore += actionWeights[action.type] || 1;
  }

  // Normalize to 0-100 scale
  // 30 weighted points = 100 score (e.g., 30 waterings or 10 disease checks)
  const normalizedScore = (weightedScore / 30) * 100;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}
