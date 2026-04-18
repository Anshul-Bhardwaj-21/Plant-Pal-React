/**
 * Manual tests for Plant Manager
 * 
 * These tests verify the core functionality of the plant manager.
 * Run these tests manually to ensure everything works correctly.
 */

import {
  addPlant,
  updatePlant,
  deletePlant,
  getPlant,
  getAllPlants,
  logWatering,
  logDiseaseCheck,
  logFertilizing,
  logPruning,
  logRepotting,
  getPlantCareHistory,
  getPlantBadges,
  getAllBadges,
} from './plantManager';
import { storageService } from '../services/storageService';

/**
 * Test helper to clear all data
 */
async function clearAllData() {
  await storageService.savePlants([]);
  await storageService.saveCareHistory([]);
  await storageService.saveBadges([]);
  await storageService.saveHealthSnapshots([]);
}

/**
 * Test 1: Add a new plant
 */
export async function testAddPlant() {
  console.log('Test 1: Add a new plant');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    type: 'Tropical',
    wateringFrequency: 7,
    sunlight: 'medium',
  });
  
  console.log('Created plant:', plant);
  console.assert(plant.name === 'Monstera Deliciosa', 'Plant name should match');
  console.assert(plant.healthScore === 100, 'Initial health score should be 100');
  console.assert(plant.careScore === 0, 'Initial care score should be 0');
  console.assert(plant.age === 0, 'Initial age should be 0');
  
  console.log('✓ Test 1 passed\n');
}

/**
 * Test 2: Get plant by ID
 */
export async function testGetPlant() {
  console.log('Test 2: Get plant by ID');
  
  await clearAllData();
  
  const created = await addPlant({
    name: 'Snake Plant',
    type: 'Succulent',
    wateringFrequency: 14,
    sunlight: 'low',
  });
  
  const retrieved = await getPlant(created.id);
  
  console.log('Retrieved plant:', retrieved);
  console.assert(retrieved !== null, 'Plant should be found');
  console.assert(retrieved?.id === created.id, 'Plant ID should match');
  console.assert(retrieved?.name === 'Snake Plant', 'Plant name should match');
  
  console.log('✓ Test 2 passed\n');
}

/**
 * Test 3: Update plant
 */
export async function testUpdatePlant() {
  console.log('Test 3: Update plant');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Pothos',
    type: 'Vine',
    wateringFrequency: 7,
    sunlight: 'medium',
  });
  
  const updated = await updatePlant(plant.id, {
    name: 'Golden Pothos',
    sunlight: 'low',
  });
  
  console.log('Updated plant:', updated);
  console.assert(updated !== null, 'Plant should be updated');
  console.assert(updated?.name === 'Golden Pothos', 'Plant name should be updated');
  console.assert(updated?.sunlight === 'low', 'Sunlight should be updated');
  console.assert(updated?.type === 'Vine', 'Type should remain unchanged');
  
  console.log('✓ Test 3 passed\n');
}

/**
 * Test 4: Delete plant
 */
export async function testDeletePlant() {
  console.log('Test 4: Delete plant');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Fern',
    type: 'Fern',
    wateringFrequency: 3,
    sunlight: 'low',
  });
  
  const deleted = await deletePlant(plant.id);
  console.assert(deleted === true, 'Plant should be deleted');
  
  const retrieved = await getPlant(plant.id);
  console.assert(retrieved === null, 'Plant should not be found after deletion');
  
  console.log('✓ Test 4 passed\n');
}

/**
 * Test 5: Log watering action
 */
export async function testLogWatering() {
  console.log('Test 5: Log watering action');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Cactus',
    type: 'Succulent',
    wateringFrequency: 14,
    sunlight: 'high',
  });
  
  const result = await logWatering(plant.id, 'Watered thoroughly');
  
  console.log('Watering result:', result);
  console.assert(result.action.type === 'watering', 'Action type should be watering');
  console.assert(result.action.plantId === plant.id, 'Plant ID should match');
  console.assert(result.action.notes === 'Watered thoroughly', 'Notes should match');
  
  // Check that lastWatered was updated
  const updatedPlant = await getPlant(plant.id);
  console.assert(updatedPlant?.lastWatered !== undefined, 'lastWatered should be set');
  
  console.log('✓ Test 5 passed\n');
}

/**
 * Test 6: Log disease check
 */
export async function testLogDiseaseCheck() {
  console.log('Test 6: Log disease check');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Rose',
    type: 'Flowering',
    wateringFrequency: 3,
    sunlight: 'high',
  });
  
  const result = await logDiseaseCheck(
    plant.id,
    {
      isHealthy: false,
      diseaseName: 'Powdery Mildew',
      confidence: 0.85,
      symptoms: 'White powder on leaves',
      causes: 'High humidity',
      treatment: 'Apply fungicide',
    },
    'Found disease on leaves'
  );
  
  console.log('Disease check result:', result);
  console.assert(result.action.type === 'disease_check', 'Action type should be disease_check');
  console.assert(result.action.metadata?.diseaseName === 'Powdery Mildew', 'Disease name should match');
  
  // Check that disease status was updated
  const updatedPlant = await getPlant(plant.id);
  console.assert(updatedPlant?.diseaseStatus?.hasDisease === true, 'Plant should have disease');
  console.assert(updatedPlant?.diseaseStatus?.diseaseName === 'Powdery Mildew', 'Disease name should match');
  
  console.log('✓ Test 6 passed\n');
}

/**
 * Test 7: Log other care actions
 */
export async function testOtherCareActions() {
  console.log('Test 7: Log other care actions');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Orchid',
    type: 'Flowering',
    wateringFrequency: 7,
    sunlight: 'medium',
  });
  
  // Test fertilizing
  const fertilizeResult = await logFertilizing(plant.id, 'Applied liquid fertilizer');
  console.assert(fertilizeResult.action.type === 'fertilizing', 'Action type should be fertilizing');
  
  // Test pruning
  const pruneResult = await logPruning(plant.id, 'Removed dead leaves');
  console.assert(pruneResult.action.type === 'pruning', 'Action type should be pruning');
  
  // Test repotting
  const repotResult = await logRepotting(plant.id, 'Moved to larger pot');
  console.assert(repotResult.action.type === 'repotting', 'Action type should be repotting');
  
  console.log('✓ Test 7 passed\n');
}

/**
 * Test 8: Get care history
 */
export async function testGetCareHistory() {
  console.log('Test 8: Get care history');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Aloe Vera',
    type: 'Succulent',
    wateringFrequency: 14,
    sunlight: 'high',
  });
  
  // Add multiple care actions
  await logWatering(plant.id);
  await logFertilizing(plant.id);
  await logPruning(plant.id);
  
  const history = await getPlantCareHistory(plant.id);
  
  console.log('Care history:', history);
  console.assert(history.length === 3, 'Should have 3 care actions');
  console.assert(history[0].type === 'pruning', 'Most recent should be pruning (reverse chronological)');
  
  console.log('✓ Test 8 passed\n');
}

/**
 * Test 9: Score recalculation
 */
export async function testScoreRecalculation() {
  console.log('Test 9: Score recalculation');
  
  await clearAllData();
  
  const plant = await addPlant({
    name: 'Peace Lily',
    type: 'Flowering',
    wateringFrequency: 7,
    sunlight: 'low',
  });
  
  console.log('Initial scores:', {
    health: plant.healthScore,
    care: plant.careScore,
  });
  
  // Add care actions
  await logWatering(plant.id);
  await logFertilizing(plant.id);
  
  const updatedPlant = await getPlant(plant.id);
  
  console.log('Updated scores:', {
    health: updatedPlant?.healthScore,
    care: updatedPlant?.careScore,
  });
  
  console.assert(updatedPlant !== null && updatedPlant.careScore > 0, 'Care score should increase after care actions');
  
  console.log('✓ Test 9 passed\n');
}

/**
 * Test 10: Badge awarding
 */
export async function testBadgeAwarding() {
  console.log('Test 10: Badge awarding');
  
  await clearAllData();
  
  // Add 5 plants to trigger Plant Collector badge
  for (let i = 0; i < 5; i++) {
    await addPlant({
      name: `Plant ${i + 1}`,
      type: 'Test',
      wateringFrequency: 7,
      sunlight: 'medium',
    });
  }
  
  const badges = await getAllBadges();
  
  console.log('Earned badges:', badges);
  console.assert(badges.length > 0, 'Should have earned at least one badge');
  
  const collectorBadge = badges.find(b => b.id === 'plant_collector');
  console.assert(collectorBadge !== undefined, 'Should have earned Plant Collector badge');
  
  console.log('✓ Test 10 passed\n');
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('=== Running Plant Manager Tests ===\n');
  
  try {
    await testAddPlant();
    await testGetPlant();
    await testUpdatePlant();
    await testDeletePlant();
    await testLogWatering();
    await testLogDiseaseCheck();
    await testOtherCareActions();
    await testGetCareHistory();
    await testScoreRecalculation();
    await testBadgeAwarding();
    
    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for manual testing
export default {
  testAddPlant,
  testGetPlant,
  testUpdatePlant,
  testDeletePlant,
  testLogWatering,
  testLogDiseaseCheck,
  testOtherCareActions,
  testGetCareHistory,
  testScoreRecalculation,
  testBadgeAwarding,
  runAllTests,
};
