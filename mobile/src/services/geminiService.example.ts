/**
 * GeminiService Usage Examples
 * 
 * This file demonstrates how to use the GeminiService for plant identification,
 * disease detection, and chatbot functionality.
 */

import { geminiService, geminiUtils } from './geminiService';
import { ChatContext } from '../types';

/**
 * Example 1: Check if API is configured
 */
export const checkApiConfiguration = () => {
  const status = geminiUtils.getConfigStatus();
  
  if (status.configured) {
    console.log('✅ Gemini API is configured');
  } else {
    console.log('❌ Gemini API not configured:', status.error);
  }
  
  return status.configured;
};

/**
 * Example 2: Identify a plant from an image
 */
export const identifyPlantExample = async (imageUri: string) => {
  try {
    console.log('🔍 Identifying plant...');
    
    const result = await geminiService.identifyPlant(imageUri);
    
    console.log('✅ Plant identification results:');
    result.predictions.forEach((prediction, index) => {
      console.log(`\n${index + 1}. ${prediction.commonName} (${prediction.scientificName})`);
      console.log(`   Type: ${prediction.type}`);
      console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
      
      if (prediction.careRequirements) {
        console.log(`   Watering: Every ${prediction.careRequirements.wateringFrequency} days`);
        console.log(`   Sunlight: ${prediction.careRequirements.sunlight}`);
        console.log(`   Notes: ${prediction.careRequirements.notes}`);
      }
    });
    
    return result;
  } catch (error) {
    console.error('❌ Plant identification failed:', error);
    throw error;
  }
};

/**
 * Example 3: Detect plant disease from an image
 */
export const detectDiseaseExample = async (imageUri: string) => {
  try {
    console.log('🔍 Detecting plant disease...');
    
    const result = await geminiService.detectDisease(imageUri);
    
    if (result.isHealthy) {
      console.log('✅ Plant appears healthy!');
    } else if (result.disease) {
      console.log('⚠️ Disease detected:');
      console.log(`   Name: ${result.disease.name}`);
      console.log(`   Confidence: ${(result.disease.confidence * 100).toFixed(1)}%`);
      console.log(`   Symptoms: ${result.disease.symptoms}`);
      console.log(`   Causes: ${result.disease.causes}`);
      console.log(`   Treatment: ${result.disease.treatment}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Disease detection failed:', error);
    throw error;
  }
};

/**
 * Example 4: Chat with AI assistant
 */
export const chatExample = async (message: string, context: ChatContext) => {
  try {
    console.log('💬 Sending message to AI assistant...');
    console.log(`   User: ${message}`);
    
    const response = await geminiService.chat(message, context);
    
    console.log(`   Assistant: ${response}`);
    
    return response;
  } catch (error) {
    console.error('❌ Chat failed:', error);
    throw error;
  }
};

/**
 * Example 5: Handle API errors gracefully
 */
export const handleApiErrorExample = async (imageUri: string) => {
  try {
    const result = await geminiService.identifyPlant(imageUri);
    return result;
  } catch (error: any) {
    // Handle different error types
    switch (error.code) {
      case 'NETWORK_ERROR':
        console.log('📡 No internet connection - please check your network');
        break;
      
      case 'API_UNAUTHORIZED':
        console.log('🔑 API authentication failed - check your API key');
        break;
      
      case 'API_RATE_LIMIT':
        console.log('⏱️ Rate limit exceeded - please try again later');
        break;
      
      case 'API_SERVER_ERROR':
        console.log('🔧 AI service temporarily unavailable - please try again');
        break;
      
      case 'API_TIMEOUT':
        console.log('⏰ Request timed out - please try again');
        break;
      
      case 'API_NOT_CONFIGURED':
        console.log('⚙️ AI service not configured - missing API key');
        break;
      
      default:
        console.log('❌ Unknown error occurred');
    }
    
    throw error;
  }
};

/**
 * Example 6: Complete plant identification flow with error handling
 */
export const completeIdentificationFlow = async (imageUri: string) => {
  // Step 1: Check API configuration
  if (!checkApiConfiguration()) {
    throw new Error('API not configured');
  }
  
  // Step 2: Identify plant with error handling
  try {
    const result = await geminiService.identifyPlant(imageUri);
    
    // Step 3: Get the top prediction
    const topPrediction = result.predictions[0];
    
    // Step 4: Return formatted result
    return {
      success: true,
      plant: {
        name: topPrediction.commonName,
        scientificName: topPrediction.scientificName,
        type: topPrediction.type,
        confidence: topPrediction.confidence,
        careRequirements: topPrediction.careRequirements,
      },
      allPredictions: result.predictions,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      errorCode: error.code || 'UNKNOWN_ERROR',
    };
  }
};

/**
 * Example 7: Complete disease detection flow with error handling
 */
export const completeDiseaseDetectionFlow = async (imageUri: string) => {
  // Step 1: Check API configuration
  if (!checkApiConfiguration()) {
    throw new Error('API not configured');
  }
  
  // Step 2: Detect disease with error handling
  try {
    const result = await geminiService.detectDisease(imageUri);
    
    // Step 3: Return formatted result
    if (result.isHealthy) {
      return {
        success: true,
        isHealthy: true,
        message: 'Plant appears healthy!',
      };
    } else {
      return {
        success: true,
        isHealthy: false,
        disease: result.disease,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      errorCode: error.code || 'UNKNOWN_ERROR',
    };
  }
};

/**
 * Example 8: Chat with context about user's plants
 */
export const chatWithContextExample = async () => {
  const context: ChatContext = {
    plants: [
      {
        id: '1',
        name: 'My Succulent',
        type: 'Succulent',
        healthScore: 85,
        careScore: 90,
        lastWatered: '2024-01-15T10:00:00Z',
        wateringFrequency: 7,
        sunlight: 'high',
        age: 30,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
    weather: {
      temperature: 22,
      humidity: 65,
      windSpeed: 5,
      conditions: 'Partly Cloudy',
      icon: '02d',
      location: 'San Francisco',
      timestamp: '2024-01-15T12:00:00Z',
    },
    conversationHistory: [
      {
        id: '1',
        role: 'user',
        content: 'How often should I water my succulent?',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Succulents typically need watering every 7-10 days...',
        timestamp: '2024-01-15T11:00:05Z',
      },
    ],
  };
  
  const response = await geminiService.chat(
    'Should I adjust watering based on the current weather?',
    context
  );
  
  console.log('AI Response:', response);
  return response;
};
