import { WeatherData } from '@/types/plant';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

const WEATHER_CACHE_KEY = 'plantpal_weather';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
  coords: { lat: number; lon: number };
}

export const getWeatherByLocation = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    // Check cache first
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const { data, timestamp, coords } = JSON.parse(cached) as CachedWeather;
      const isSameLocation = Math.abs(coords.lat - lat) < 0.1 && Math.abs(coords.lon - lon) < 0.1;
      if (Date.now() - timestamp < CACHE_DURATION && isSameLocation) {
        return data;
      }
    }

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`),
      fetch(`${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather API request failed');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    const forecast = forecastData.list
      .filter((_: any, index: number) => index % 8 === 0)
      .slice(0, 7)
      .map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        tempMax: Math.round(item.main.temp_max),
        tempMin: Math.round(item.main.temp_min),
        condition: item.weather[0].main,
        precipitation: Math.round(item.pop * 100),
        humidity: item.main.humidity,
      }));

    const weatherData: WeatherData = {
      temperature: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      condition: currentData.weather[0].main,
      feelsLike: Math.round(currentData.main.feels_like),
      windSpeed: Math.round(currentData.wind.speed * 3.6),
      uvIndex: 5,
      precipitation: Math.round((currentData.pop || 0) * 100),
      forecast,
    };

    // Cache the result
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
      data: weatherData,
      timestamp: Date.now(),
      coords: { lat, lon }
    }));

    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error);
    
    // Return cached data if available
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const { data } = JSON.parse(cached) as CachedWeather;
      return data;
    }
    
    return null;
  }
};

export const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

export const getWateringAdvice = (weather: WeatherData, plantType?: string): string[] => {
  const advice: string[] = [];
  const { temperature, humidity, precipitation, condition, forecast } = weather;
  
  // Check upcoming rain
  const upcomingRain = forecast.some(f => f.precipitation > 50);
  if (upcomingRain) {
    advice.push('⛈️ Heavy rain expected in next few days - skip watering');
  } else if (precipitation > 20) {
    advice.push('🌧️ Rain expected - reduce watering');
  }
  
  // Temperature advice
  if (temperature > 30) {
    advice.push('🌡️ High temperature - water early morning or evening');
    advice.push('💧 Increase watering frequency in this heat');
  } else if (temperature < 10) {
    advice.push('❄️ Cold weather - reduce watering frequency');
  }
  
  // Humidity advice
  if (humidity < 40) {
    advice.push('🏜️ Low humidity - mist leaves regularly');
  } else if (humidity > 80) {
    advice.push('💨 High humidity - ensure good air circulation to prevent fungal diseases');
  }
  
  // Condition-specific advice
  if (condition === 'Clear' && temperature > 25) {
    advice.push('☀️ Sunny weather - check soil moisture frequently');
  }
  
  if (advice.length === 0) {
    advice.push('✅ Weather conditions are optimal for normal watering schedule');
  }
  
  return advice;
};

export const getDiseaseRiskAlert = (weather: WeatherData): { risk: 'low' | 'medium' | 'high'; message: string } => {
  const { humidity, temperature, condition } = weather;
  
  // High humidity + warm temperature = fungal disease risk
  if (humidity > 70 && temperature > 20 && temperature < 30) {
    return {
      risk: 'high',
      message: 'High risk of fungal diseases due to warm, humid conditions. Ensure good air circulation.'
    };
  }
  
  // Very hot + dry = pest risk
  if (temperature > 32 && humidity < 40) {
    return {
      risk: 'medium',
      message: 'Hot, dry conditions may attract spider mites and other pests. Monitor closely.'
    };
  }
  
  // Rainy conditions
  if (condition === 'Rain' || humidity > 85) {
    return {
      risk: 'medium',
      message: 'Wet conditions increase risk of root rot and fungal infections. Avoid overwatering.'
    };
  }
  
  return {
    risk: 'low',
    message: 'Current weather conditions pose low disease risk. Continue regular care routine.'
  };
};
