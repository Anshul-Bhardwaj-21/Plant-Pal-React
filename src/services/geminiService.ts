import { GoogleGenerativeAI } from '@google/generative-ai';
import { Plant, WeatherData } from '@/types/plant';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

const initializeGemini = () => {
  if (!genAI && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (
  message: string,
  context: {
    plants: Plant[];
    weather: WeatherData | null;
    selectedPlant?: Plant;
  }
): Promise<string> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      return 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.';
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const contextPrompt = buildContextPrompt(context);
    const fullPrompt = `${contextPrompt}\n\nUser Question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    if (error?.message?.includes('API key')) {
      return 'Invalid API key. Please check your Gemini API configuration.';
    }
    
    if (error?.message?.includes('quota')) {
      return 'API quota exceeded. Please try again later.';
    }
    
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
};

const buildContextPrompt = (context: {
  plants: Plant[];
  weather: WeatherData | null;
  selectedPlant?: Plant;
}): string => {
  let prompt = `You are an expert plant care assistant. Provide helpful, accurate advice about plant care, diseases, and maintenance.

Context Information:`;

  if (context.plants.length > 0) {
    prompt += `\n\nUser's Plants (${context.plants.length} total):`;
    context.plants.forEach((plant, index) => {
      prompt += `\n${index + 1}. ${plant.name} (${plant.type})`;
      prompt += `\n   - Watering: ${plant.waterFrequency}`;
      prompt += `\n   - Sunlight: ${plant.sunlight}`;
      prompt += `\n   - Last watered: ${plant.lastWatered}`;
      
      if (plant.diseaseDetection) {
        prompt += `\n   - Disease detected: ${plant.diseaseDetection.disease} (${plant.diseaseDetection.confidence.toFixed(1)}% confidence)`;
      }
      
      if (plant.notes) {
        prompt += `\n   - Notes: ${plant.notes}`;
      }
    });
  }

  if (context.weather) {
    prompt += `\n\nCurrent Weather Conditions:`;
    prompt += `\n- Temperature: ${context.weather.temperature}°C (feels like ${context.weather.feelsLike}°C)`;
    prompt += `\n- Humidity: ${context.weather.humidity}%`;
    prompt += `\n- Condition: ${context.weather.condition}`;
    prompt += `\n- Wind Speed: ${context.weather.windSpeed} km/h`;
    
    if (context.weather.forecast.length > 0) {
      prompt += `\n\n5-Day Forecast:`;
      context.weather.forecast.forEach((day) => {
        prompt += `\n- ${day.date}: ${day.tempMin}°C to ${day.tempMax}°C, ${day.condition}, ${day.precipitation}% rain chance`;
      });
    }
  }

  if (context.selectedPlant) {
    prompt += `\n\nFocused Plant: ${context.selectedPlant.name}`;
    if (context.selectedPlant.diseaseDetection) {
      prompt += `\n- Disease: ${context.selectedPlant.diseaseDetection.disease}`;
      prompt += `\n- Confidence: ${context.selectedPlant.diseaseDetection.confidence.toFixed(1)}%`;
      if (context.selectedPlant.diseaseDetection.recommendations) {
        prompt += `\n- Recommendations: ${context.selectedPlant.diseaseDetection.recommendations.join(', ')}`;
      }
    }
  }

  prompt += `\n\nProvide concise, actionable advice. Consider weather conditions when giving watering recommendations. If discussing diseases, be specific about treatment and prevention.`;

  return prompt;
};

export const getPlantHealthSummary = async (plant: Plant, weather: WeatherData | null): Promise<string> => {
  const context = {
    plants: [plant],
    weather,
    selectedPlant: plant,
  };

  const question = `Provide a brief health summary for ${plant.name} and any care recommendations based on current conditions.`;
  
  return sendChatMessage(question, context);
};
