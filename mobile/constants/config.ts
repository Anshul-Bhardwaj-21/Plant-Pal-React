import Constants from 'expo-constants';

interface Config {
  geminiApiKey: string;
  weatherApiKey: string;
  firebaseApiKey: string;
}

// Access environment variables through expo-constants
const config: Config = {
  geminiApiKey: Constants.expoConfig?.extra?.geminiApiKey || '',
  weatherApiKey: Constants.expoConfig?.extra?.weatherApiKey || '',
  firebaseApiKey: Constants.expoConfig?.extra?.firebaseApiKey || '',
};

// Validate required API keys
export const validateConfig = (): { isValid: boolean; missingKeys: string[] } => {
  const missingKeys: string[] = [];

  if (!config.geminiApiKey) {
    missingKeys.push('GEMINI_API_KEY');
  }

  if (!config.weatherApiKey) {
    missingKeys.push('WEATHER_API_KEY');
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
};

export default config;
