/**
 * Plant Manager - Orchestrates CRUD operations, care logging, and score recalculation
 * 
 * This module provides high-level functions for managing plants and care actions.
 * It integrates the storage service, health calculator, and gamification engine
 * to provide a complete plant management solution.
 * 
 * Requirements: 8.13, 11.1, 11.2, 11.3, 11.4, 11.5, 11.9, 17.6
 */

import { v4 as uuidv4 } from 'uuid';
import { Plant, CareAction, Badge, HealthSnapshot } from '../types';
import { storageService } from '../services/storageService';
import { calculateHealthScore, calculateCareScore } from './healthCalculator';
import { checkAllBadgeEligibility, awardNewBadges } from './gamificationEngine';

/**
 * Validation error types
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate plant data before storage
 */
function validatePlantData(plant: Partial<Plant>): void {
  if (!plant.name || plant.name.trim().length === 0) {
    throw new ValidationError('Plant name is required');
  }
  
  if (!plant.type || plant.type.trim().length === 0) {
    throw new ValidationError('Plant type is required');
  }
  
  if (plant.wateringFrequency !== undefined && plant.wateringFrequency <= 0) {
    throw new ValidationError('Watering frequency must be greater than 0');
  }
  
  if (plant.sunlight && !['low', 'medium', 'high'].includes(plant.sunlight)) {
    throw new ValidationError('Sunlight must be low, medium, or high');
  }
}

/**
 * Validate care action data before storage
 */
function validateCareActionData(action: Partial<CareAction>): void {
  if (!action.plantId || action.plantId.trim().length === 0) {
    throw new ValidationError('Plant ID is required');
  }
  
  if (!action.type) {
    throw new ValidationError('Care action type is required');
  }
  
  const validTypes = ['watering', 'disease_check', 'fertilizing', 'pruning', 'repotting'];
  if (!validTypes.includes(action.type)) {
    throw new ValidationError(`Care action type must be one of: ${validTypes.join(', ')}`);
  }
}

/**
 * Calculate plant age in days
 */
function calculatePlantAge(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Recalculate health and care scores for a plant
 */
async function recalculateScores(plantId: string): Promise<void> {
  const plants = await storageService.getPlants();
  const careHistory = await storageService.getCareHistory();
  
  const plantIndex = plants.findIndex(p => p.id === plantId);
  if (plantIndex === -1) {
    return;
  }
  
  const plant = plants[plantIndex];
  const plantCareHistory = careHistory.filter(action => action.plantId === plantId);
  
  // Update age
  plant.age = calculatePlantAge(plant.createdAt);
  
  // Recalculate scores
  plant.healthScore = calculateHealthScore(plant, plantCareHistory);
  plant.careScore = calculateCareScore(plantCareHistory);
  
  // Save updated plant
  plants[plantIndex] = plant;
  await storageService.savePlants(plants);
}

/**
 * Create a health snapshot for a plant
 */
async function createHealthSnapshot(plantId: string): Promise<void> {
  const plants = await storageService.getPlants();
  const plant = plants.find(p => p.id === plantId);
  
  if (!plant) {
    return;
  }
  
  const snapshots = await storageService.getHealthSnapshots();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Check if snapshot already exists for today
  const existingSnapshot = snapshots.find(
    s => s.plantId === plantId && s.date === today
  );
  
  if (existingSnapshot) {
    // Update existing snapshot
    existingSnapshot.healthScore = plant.healthScore;
    existingSnapshot.careScore = plant.careScore;
    existingSnapshot.timestamp = now.toISOString();
  } else {
    // Create new snapshot
    const snapshot: HealthSnapshot = {
      id: uuidv4(),
      plantId,
      healthScore: plant.healthScore,
      careScore: plant.careScore,
      timestamp: now.toISOString(),
      date: today,
    };
    snapshots.push(snapshot);
  }
  
  await storageService.saveHealthSnapshots(snapshots);
}

/**
 * Check and award new badges
 */
async function checkAndAwardBadges(): Promise<Badge[]> {
  const plants = await storageService.getPlants();
  const careHistory = await storageService.getCareHistory();
  const healthSnapshots = await storageService.getHealthSnapshots();
  const existingBadges = await storageService.getBadges();
  
  // Check eligibility for all badges
  const eligibilityResults = checkAllBadgeEligibility(
    plants,
    careHistory,
    healthSnapshots
  );
  
  // Award new badges
  const newBadges = awardNewBadges(eligibilityResults, existingBadges);
  
  if (newBadges.length > 0) {
    const allBadges = [...existingBadges, ...newBadges];
    await storageService.saveBadges(allBadges);
  }
  
  return newBadges;
}

/**
 * Add a new plant
 * 
 * @param plantData Plant data (name, type, image, etc.)
 * @returns The created plant
 */
export async function addPlant(plantData: {
  name: string;
  scientificName?: string;
  type: string;
  image?: string;
  wateringFrequency: number;
  sunlight: 'low' | 'medium' | 'high';
}): Promise<Plant> {
  // Validate input
  validatePlantData(plantData);
  
  const now = new Date().toISOString();
  
  // Create new plant
  const plant: Plant = {
    id: uuidv4(),
    name: plantData.name.trim(),
    scientificName: plantData.scientificName?.trim(),
    type: plantData.type.trim(),
    image: plantData.image,
    createdAt: now,
    wateringFrequency: plantData.wateringFrequency,
    sunlight: plantData.sunlight,
    healthScore: 100, // Start with perfect health
    careScore: 0, // No care actions yet
    age: 0, // Just created
  };
  
  // Save plant
  const plants = await storageService.getPlants();
  plants.push(plant);
  await storageService.savePlants(plants);
  
  // Create initial health snapshot
  await createHealthSnapshot(plant.id);
  
  // Check for collection badges
  await checkAndAwardBadges();
  
  return plant;
}

/**
 * Update an existing plant
 * 
 * @param plantId Plant ID
 * @param updates Partial plant data to update
 * @returns The updated plant or null if not found
 */
export async function updatePlant(
  plantId: string,
  updates: Partial<Omit<Plant, 'id' | 'createdAt' | 'age'>>
): Promise<Plant | null> {
  // Validate updates
  validatePlantData(updates);
  
  const plants = await storageService.getPlants();
  const plantIndex = plants.findIndex(p => p.id === plantId);
  
  if (plantIndex === -1) {
    return null;
  }
  
  // Update plant
  const plant = plants[plantIndex];
  Object.assign(plant, updates);
  
  // Recalculate age
  plant.age = calculatePlantAge(plant.createdAt);
  
  // Save updated plant
  plants[plantIndex] = plant;
  await storageService.savePlants(plants);
  
  // Recalculate scores
  await recalculateScores(plantId);
  
  return plants[plantIndex];
}

/**
 * Delete a plant and its associated data
 * 
 * @param plantId Plant ID
 * @returns True if deleted, false if not found
 */
export async function deletePlant(plantId: string): Promise<boolean> {
  const plants = await storageService.getPlants();
  const plantIndex = plants.findIndex(p => p.id === plantId);
  
  if (plantIndex === -1) {
    return false;
  }
  
  // Remove plant
  plants.splice(plantIndex, 1);
  await storageService.savePlants(plants);
  
  // Remove care history for this plant
  const careHistory = await storageService.getCareHistory();
  const filteredHistory = careHistory.filter(action => action.plantId !== plantId);
  await storageService.saveCareHistory(filteredHistory);
  
  // Remove health snapshots for this plant
  const snapshots = await storageService.getHealthSnapshots();
  const filteredSnapshots = snapshots.filter(snapshot => snapshot.plantId !== plantId);
  await storageService.saveHealthSnapshots(filteredSnapshots);
  
  // Remove plant-specific badges
  const badges = await storageService.getBadges();
  const filteredBadges = badges.filter(badge => badge.plantId !== plantId);
  await storageService.saveBadges(filteredBadges);
  
  return true;
}

/**
 * Get a single plant by ID
 * 
 * @param plantId Plant ID
 * @returns The plant or null if not found
 */
export async function getPlant(plantId: string): Promise<Plant | null> {
  const plants = await storageService.getPlants();
  return plants.find(p => p.id === plantId) || null;
}

/**
 * Get all plants
 * 
 * @returns Array of all plants
 */
export async function getAllPlants(): Promise<Plant[]> {
  return storageService.getPlants();
}

/**
 * Add a care action and recalculate scores
 * 
 * @param action Care action data
 * @returns The created care action and any newly earned badges
 */
export async function addCareAction(action: {
  plantId: string;
  type: CareAction['type'];
  notes?: string;
  metadata?: CareAction['metadata'];
}): Promise<{ action: CareAction; newBadges: Badge[] }> {
  // Validate input
  validateCareActionData(action);
  
  const now = new Date().toISOString();
  
  // Create care action
  const careAction: CareAction = {
    id: uuidv4(),
    plantId: action.plantId,
    type: action.type,
    timestamp: now,
    notes: action.notes,
    metadata: action.metadata,
  };
  
  // Save care action
  const careHistory = await storageService.getCareHistory();
  careHistory.push(careAction);
  
  // Limit care history to 500 entries per plant
  const plantActions = careHistory.filter(a => a.plantId === action.plantId);
  if (plantActions.length > 500) {
    // Remove oldest actions for this plant
    const actionsToRemove = plantActions
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(0, plantActions.length - 500);
    
    const removeIds = new Set(actionsToRemove.map(a => a.id));
    const filteredHistory = careHistory.filter(a => !removeIds.has(a.id));
    await storageService.saveCareHistory(filteredHistory);
  } else {
    await storageService.saveCareHistory(careHistory);
  }
  
  // Recalculate health and care scores
  await recalculateScores(action.plantId);
  
  // Create health snapshot
  await createHealthSnapshot(action.plantId);
  
  // Check and award badges
  const newBadges = await checkAndAwardBadges();
  
  return { action: careAction, newBadges };
}

/**
 * Log a watering action
 * 
 * @param plantId Plant ID
 * @param notes Optional notes
 * @returns The created care action and any newly earned badges
 */
export async function logWatering(
  plantId: string,
  notes?: string
): Promise<{ action: CareAction; newBadges: Badge[] }> {
  // Update lastWatered timestamp
  const plants = await storageService.getPlants();
  const plantIndex = plants.findIndex(p => p.id === plantId);
  
  if (plantIndex !== -1) {
    plants[plantIndex].lastWatered = new Date().toISOString();
    await storageService.savePlants(plants);
  }
  
  return addCareAction({
    plantId,
    type: 'watering',
    notes,
  });
}

/**
 * Log a disease check action
 * 
 * @param plantId Plant ID
 * @param result Disease detection result
 * @param notes Optional notes
 * @returns The created care action and any newly earned badges
 */
export async function logDiseaseCheck(
  plantId: string,
  result: {
    isHealthy: boolean;
    diseaseName?: string;
    confidence?: number;
    symptoms?: string;
    causes?: string;
    treatment?: string;
  },
  notes?: string
): Promise<{ action: CareAction; newBadges: Badge[] }> {
  // Update plant disease status
  const plants = await storageService.getPlants();
  const plantIndex = plants.findIndex(p => p.id === plantId);
  
  if (plantIndex !== -1) {
    if (result.isHealthy) {
      // Clear disease status or mark as treated
      if (plants[plantIndex].diseaseStatus?.hasDisease) {
        plants[plantIndex].diseaseStatus = {
          hasDisease: true,
          diseaseName: plants[plantIndex].diseaseStatus.diseaseName,
          detectedAt: plants[plantIndex].diseaseStatus.detectedAt,
          treated: true,
        };
      }
    } else {
      // Set disease status
      plants[plantIndex].diseaseStatus = {
        hasDisease: true,
        diseaseName: result.diseaseName,
        detectedAt: new Date().toISOString(),
        treated: false,
      };
    }
    await storageService.savePlants(plants);
  }
  
  return addCareAction({
    plantId,
    type: 'disease_check',
    notes,
    metadata: {
      isHealthy: result.isHealthy,
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      symptoms: result.symptoms,
      causes: result.causes,
      treatment: result.treatment,
    },
  });
}

/**
 * Log a fertilizing action
 * 
 * @param plantId Plant ID
 * @param notes Optional notes (e.g., fertilizer type, amount)
 * @returns The created care action and any newly earned badges
 */
export async function logFertilizing(
  plantId: string,
  notes?: string
): Promise<{ action: CareAction; newBadges: Badge[] }> {
  return addCareAction({
    plantId,
    type: 'fertilizing',
    notes,
  });
}

/**
 * Log a pruning action
 * 
 * @param plantId Plant ID
 * @param notes Optional notes (e.g., what was pruned)
 * @returns The created care action and any newly earned badges
 */
export async function logPruning(
  plantId: string,
  notes?: string
): Promise<{ action: CareAction; newBadges: Badge[] }> {
  return addCareAction({
    plantId,
    type: 'pruning',
    notes,
  });
}

/**
 * Log a repotting action
 * 
 * @param plantId Plant ID
 * @param notes Optional notes (e.g., new pot size, soil type)
 * @returns The created care action and any newly earned badges
 */
export async function logRepotting(
  plantId: string,
  notes?: string
): Promise<{ action: CareAction; newBadges: Badge[] }> {
  return addCareAction({
    plantId,
    type: 'repotting',
    notes,
  });
}

/**
 * Get care history for a specific plant
 * 
 * @param plantId Plant ID
 * @returns Array of care actions for the plant
 */
export async function getPlantCareHistory(plantId: string): Promise<CareAction[]> {
  const careHistory = await storageService.getCareHistory();
  return careHistory
    .filter(action => action.plantId === plantId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get badges for a specific plant
 * 
 * @param plantId Plant ID
 * @returns Array of badges earned for the plant
 */
export async function getPlantBadges(plantId: string): Promise<Badge[]> {
  const badges = await storageService.getBadges();
  return badges.filter(badge => badge.plantId === plantId);
}

/**
 * Get all user badges (including plant-specific and user-level badges)
 * 
 * @returns Array of all earned badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  return storageService.getBadges();
}
