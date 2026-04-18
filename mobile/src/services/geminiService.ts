/**
 * GeminiService - AI operations using Google Gemini API
 * 
 * Provides plant identification, disease detection, and chatbot functionality
 * using the @google/generative-ai package with gemini-2.0-flash-exp model.
 * 
 * Requirements: 4.1-4.10, 5.1-5.10, 6.1-6.10, 16.1-16.3
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import {
  GeminiService,
  PlantIdentificationResult,
  DiseaseDetectionResult,
  ChatContext,
  ApiErrorCode,
} from '../types';

// Constants
const MODEL_NAME = 'gemini-2.0-flash-exp';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 0; // No automatic retries for AI requests

/**
 * Custom error class for API errors
 */
class GeminiApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;

  constructor(message: string, code: ApiErrorCode, statusCode?: number) {
    super(message);
    this.name = 'GeminiApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Get API key from environment variables
 */
const getApiKey = (): string => {
  const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new GeminiApiError(
      'AI service not configured - missing API key',
      'API_NOT_CONFIGURED'
    );
  }
  
  return apiKey;
};

/**
 * Initialize Gemini AI client
 */
let genAI: GoogleGenerativeAI | null = null;

const getGeminiClient = (): GoogleGenerativeAI => {
  if (!genAI) {
    const apiKey = getApiKey();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Create a timeout promise
 */
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new GeminiApiError(
        'Request timed out - please try again',
        'API_TIMEOUT'
      ));
    }, ms);
  });
};

/**
 * Handle API errors and convert to user-friendly messages
 */
const handleApiError = (error: any): never => {
  console.error('[GeminiService] API error:', error);

  // Check for network errors
  if (error.message?.includes('network') || 
      error.message?.includes('fetch') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED') {
    throw new GeminiApiError(
      'No internet connection - please check your network',
      'NETWORK_ERROR'
    );
  }

  // Check for timeout
  if (error.code === 'API_TIMEOUT') {
    throw error;
  }

  // Check for API key errors (401)
  if (error.status === 401 || error.message?.includes('API key')) {
    throw new GeminiApiError(
      'AI service authentication failed - check API key',
      'API_UNAUTHORIZED',
      401
    );
  }

  // Check for rate limit errors (429)
  if (error.status === 429 || error.message?.includes('rate limit')) {
    throw new GeminiApiError(
      'AI service rate limit exceeded - please try again later',
      'API_RATE_LIMIT',
      429
    );
  }

  // Check for server errors (500+)
  if (error.status >= 500 || error.message?.includes('server error')) {
    throw new GeminiApiError(
      'AI service temporarily unavailable - please try again',
      'API_SERVER_ERROR',
      error.status || 500
    );
  }

  // Generic error
  throw new GeminiApiError(
    'AI service error - please try again',
    'UNKNOWN_ERROR'
  );
};

/**
 * Convert image URI to base64 for Gemini API
 */
const imageUriToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[GeminiService] Failed to convert image to base64:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * GeminiService implementation
 */
export const geminiService: GeminiService = {
  /**
   * Identify plant from image
   * Returns top 3 plant predictions with confidence scores
   */
  async identifyPlant(imageUri: string): Promise<PlantIdentificationResult> {
    try {
      console.log('[GeminiService] Identifying plant from image');

      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: MODEL_NAME });

      // Convert image to base64
      const base64Image = await imageUriToBase64(imageUri);

      // Create the prompt
      const prompt = `You are a plant identification expert. Analyze this plant image and provide the top 3 most likely plant identifications.

For each identification, provide:
1. Scientific name
2. Common name
3. Plant type (e.g., Succulent, Fern, Flowering, Tree, Herb, etc.)
4. Confidence score (0.0 to 1.0)
5. Care requirements:
   - Watering frequency (in days)
   - Sunlight level (low, medium, or high)
   - Brief care notes

Return the response in the following JSON format:
{
  "predictions": [
    {
      "scientificName": "string",
      "commonName": "string",
      "type": "string",
      "confidence": number,
      "careRequirements": {
        "wateringFrequency": number,
        "sunlight": "low" | "medium" | "high",
        "notes": "string"
      }
    }
  ]
}

Provide exactly 3 predictions, ordered by confidence (highest first).`;

      // Generate content with timeout
      const generatePromise = model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ]);

      const result = await Promise.race([
        generatePromise,
        createTimeout(REQUEST_TIMEOUT_MS),
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      console.log('[GeminiService] Plant identification successful');
      return parsed as PlantIdentificationResult;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Detect plant disease from image
   * Returns disease information or healthy status
   */
  async detectDisease(imageUri: string): Promise<DiseaseDetectionResult> {
    try {
      console.log('[GeminiService] Detecting plant disease from image');

      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: MODEL_NAME });

      // Convert image to base64
      const base64Image = await imageUriToBase64(imageUri);

      // Create the prompt
      const prompt = `You are a plant disease detection expert. Analyze this plant image for any signs of disease, pests, or health issues.

Determine if the plant is healthy or has a disease. If a disease is detected, provide:
1. Disease name
2. Confidence score (0.0 to 1.0)
3. Symptoms observed
4. Likely causes
5. Treatment recommendations

Return the response in the following JSON format:

If the plant is healthy:
{
  "isHealthy": true
}

If a disease is detected:
{
  "isHealthy": false,
  "disease": {
    "name": "string",
    "confidence": number,
    "symptoms": "string",
    "causes": "string",
    "treatment": "string"
  }
}

Be thorough in your analysis and provide actionable treatment advice.`;

      // Generate content with timeout
      const generatePromise = model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ]);

      const result = await Promise.race([
        generatePromise,
        createTimeout(REQUEST_TIMEOUT_MS),
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      console.log('[GeminiService] Disease detection successful');
      return parsed as DiseaseDetectionResult;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Chat with AI assistant about plant care
   * Maintains conversation context with user's plants and weather
   */
  async chat(message: string, context: ChatContext): Promise<string> {
    try {
      console.log('[GeminiService] Processing chat message');

      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: MODEL_NAME });

      // Build context information
      const plantContext = context.plants.length > 0
        ? `\n\nUser's Plants:\n${context.plants.map(p => 
            `- ${p.name} (${p.type}): Health Score ${p.healthScore}/100, Last watered ${p.lastWatered || 'never'}`
          ).join('\n')}`
        : '\n\nUser has no plants yet.';

      const weatherContext = context.weather
        ? `\n\nCurrent Weather:\n- Temperature: ${context.weather.temperature}°C\n- Humidity: ${context.weather.humidity}%\n- Conditions: ${context.weather.conditions}`
        : '';

      const conversationHistory = context.conversationHistory.length > 0
        ? `\n\nConversation History:\n${context.conversationHistory.slice(-5).map(msg => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
          ).join('\n')}`
        : '';

      // Create the prompt
      const prompt = `You are a helpful plant care assistant. Answer the user's question about plant care, providing practical and actionable advice.

Context:${plantContext}${weatherContext}${conversationHistory}

User's Question: ${message}

Provide a helpful, friendly, and informative response. Keep it concise but thorough.`;

      // Generate content with timeout
      const generatePromise = model.generateContent(prompt);

      const result = await Promise.race([
        generatePromise,
        createTimeout(REQUEST_TIMEOUT_MS),
      ]);

      const response = await result.response;
      const text = response.text();

      console.log('[GeminiService] Chat response generated');
      return text;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

/**
 * Export utility functions for testing and validation
 */
export const geminiUtils = {
  /**
   * Validate API key configuration
   */
  validateApiKey: (): boolean => {
    try {
      getApiKey();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get API configuration status
   */
  getConfigStatus: (): {
    configured: boolean;
    error?: string;
  } => {
    try {
      getApiKey();
      return { configured: true };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Reset client (useful for testing)
   */
  resetClient: (): void => {
    genAI = null;
  },
};

export default geminiService;
