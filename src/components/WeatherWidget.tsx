import { WeatherData } from '@/types/plant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CloudRain, Sun, Wind, Droplets, RefreshCw, Loader2 } from 'lucide-react';
import { getWateringAdvice } from '@/services/weatherService';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
  onRefresh?: () => void;
}

const weatherIcons: Record<string, React.ElementType> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Thunderstorm: CloudRain,
  Snow: Cloud,
  Mist: Cloud,
  Smoke: Cloud,
  Haze: Cloud,
  Dust: Cloud,
  Fog: Cloud,
  Sand: Cloud,
  Ash: Cloud,
  Squall: Wind,
  Tornado: Wind,
};

export const WeatherWidget = ({ weather, loading, onRefresh }: WeatherWidgetProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Weather data unavailable</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = weatherIcons[weather.condition] || Cloud;
  const advice = getWateringAdvice(weather);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Weather Conditions</CardTitle>
        {onRefresh && (
          <Button onClick={onRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <WeatherIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{weather.temperature}°C</p>
              <p className="text-sm text-muted-foreground">{weather.condition}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-muted-foreground">Humidity</p>
              <p className="font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-muted-foreground">Wind</p>
              <p className="font-semibold">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-sm font-semibold mb-1">Watering Advice</p>
          <p className="text-sm text-muted-foreground">{advice}</p>
        </div>

        {weather.forecast.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">5-Day Forecast</p>
            <div className="space-y-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <span>{day.tempMin}° - {day.tempMax}°</span>
                    <Badge variant="secondary" className="text-xs">
                      {day.condition}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
