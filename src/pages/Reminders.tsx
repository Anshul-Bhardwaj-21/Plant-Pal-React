import { usePlants } from '@/hooks/usePlants';
import { useWeather } from '@/hooks/useWeather';
import { getPlantReminders } from '@/lib/plantUtils';
import { ReminderCard } from '@/components/ReminderCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { ChatBot } from '@/components/ChatBot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, AlertTriangle, Droplets, Sun, Leaf, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const Reminders = () => {
  const { plants, loading, waterPlant } = usePlants();
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();
  const [showChat, setShowChat] = useState(false);
  const reminders = getPlantReminders(plants);
  
  const waterReminders = reminders.filter((r) => r.type === 'water');
  const sunlightReminders = reminders.filter((r) => r.type === 'sunlight');
  const overdueReminders = reminders.filter((r) => r.isOverdue);

  const handleWater = async (plantId: string) => {
    try {
      await waterPlant(plantId);
      const plant = plants.find((p) => p.id === plantId);
      toast.success(`${plant?.name} has been watered! 💧`);
    } catch (error) {
      toast.error('Failed to water plant. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Reminders Yet</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Add some plants to start receiving care reminders.
          </p>
          <Button asChild>
            <Link to="/add-plant">Add Your First Plant</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">
            Stay on top of your plant care with smart reminders.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowChat(!showChat)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className={overdueReminders.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  overdueReminders.length > 0 ? "bg-destructive/20" : "bg-primary/20"
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    overdueReminders.length > 0 ? "text-destructive" : "text-primary"
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueReminders.length}</p>
                  <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                  <Droplets className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{waterReminders.length}</p>
                  <p className="text-sm text-muted-foreground">Watering Reminders</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                  <Sun className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sunlightReminders.length}</p>
                  <p className="text-sm text-muted-foreground">Sunlight Tips</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Section */}
          {overdueReminders.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Needs Immediate Attention
                </CardTitle>
                <CardDescription>
                  These plants are overdue for watering. Take action now!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueReminders.map((reminder) => (
                  <ReminderCard
                    key={`${reminder.plantId}-${reminder.type}`}
                    reminder={reminder}
                    onWater={handleWater}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Water Today Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                Watering Schedule
              </CardTitle>
              <CardDescription>
                Plants that need watering today or soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {waterReminders.filter((r) => !r.isOverdue).length > 0 ? (
                waterReminders
                  .filter((r) => !r.isOverdue)
                  .map((reminder) => (
                    <ReminderCard
                      key={`${reminder.plantId}-${reminder.type}`}
                      reminder={reminder}
                      onWater={handleWater}
                    />
                  ))
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    All caught up! No immediate watering needed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sunlight Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                Sunlight Tips
              </CardTitle>
              <CardDescription>
                Ensure your plants get adequate sunlight for healthy growth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sunlightReminders.length > 0 ? (
                sunlightReminders.map((reminder) => (
                  <ReminderCard
                    key={`${reminder.plantId}-${reminder.type}`}
                    reminder={reminder}
                  />
                ))
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <Leaf className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    No specific sunlight recommendations at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <WeatherWidget weather={weather} loading={weatherLoading} onRefresh={refetchWeather} />
          {showChat && <ChatBot plants={plants} weather={weather} />}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
