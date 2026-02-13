import { useState, useEffect } from 'react';
import { WeatherData } from '@/types/plant';
import { getWeatherByLocation, getCurrentLocation } from '@/services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const location = await getCurrentLocation();
      const weatherData = await getWeatherByLocation(location.lat, location.lon);
      
      if (weatherData) {
        setWeather(weatherData);
        localStorage.setItem('plant-pal-weather', JSON.stringify(weatherData));
        localStorage.setItem('plant-pal-weather-timestamp', Date.now().toString());
      } else {
        setError('Unable to fetch weather data');
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      
      // Handle geolocation errors gracefully
      if (err.code === 1) {
        setError('Location permission denied. Weather features disabled.');
      } else if (err.code === 2) {
        setError('Location unavailable. Check your device settings.');
      } else if (err.code === 3) {
        setError('Location request timed out. Please try again.');
      } else {
        setError(err.message || 'Failed to get location');
      }
      
      // Try to use cached weather data
      const cached = localStorage.getItem('plant-pal-weather');
      if (cached) {
        setWeather(JSON.parse(cached));
        setError('Using cached weather data (location unavailable)');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('plant-pal-weather');
    const timestamp = localStorage.getItem('plant-pal-weather-timestamp');
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < 30 * 60 * 1000) {
        setWeather(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }
    
    fetchWeather();
  }, []);

  return { weather, loading, error, refetch: fetchWeather };
};
