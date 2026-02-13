import { usePlants } from '@/hooks/usePlants';
import { useWeather } from '@/hooks/useWeather';
import { getPlantStats, getWeeklyWateringData } from '@/lib/plantUtils';
import { StatCard } from '@/components/StatCard';
import { PlantHealthChart, WateringActivityChart } from '@/components/Charts';
import { WeatherWidget } from '@/components/WeatherWidget';
import { ChatBot } from '@/components/ChatBot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Wind, 
  Sprout,
  TrendingUp,
  TreeDeciduous,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const { plants, loading } = usePlants();
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();
  const [showChat, setShowChat] = useState(false);
  const stats = getPlantStats(plants);
  const weeklyData = getWeeklyWateringData(plants);

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
          <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Data Yet</h3>
          <p className="mb-4 text-center text-muted-foreground">
            Add some plants to start seeing your dashboard statistics.
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
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your plant care journey and environmental impact.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowChat(!showChat)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Plants"
              value={stats.totalPlants}
              icon={Leaf}
              description="In your collection"
              variant="default"
            />
            <StatCard
              title="Watered Today"
              value={stats.wateredToday}
              icon={Droplets}
              description="Plants cared for"
              variant="success"
            />
            <StatCard
              title="Healthy Plants"
              value={stats.healthyPlants}
              icon={CheckCircle2}
              description="On schedule"
              variant="success"
            />
            <StatCard
              title="Needs Attention"
              value={stats.neglectedPlants}
              icon={AlertTriangle}
              description="Overdue for care"
              variant={stats.neglectedPlants > 0 ? "danger" : "default"}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PlantHealthChart
              healthy={stats.healthyPlants}
              neglected={stats.neglectedPlants}
            />
            <WateringActivityChart data={weeklyData} />
          </div>

          {/* Environmental Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreeDeciduous className="h-5 w-5 text-primary" />
                Your Environmental Impact
              </CardTitle>
              <CardDescription>
                See how your plants contribute to a healthier planet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                    <Wind className="h-7 w-7 text-primary" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.co2Absorbed.toFixed(1)} kg</p>
                  <p className="text-sm text-muted-foreground">CO₂ absorbed per year</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your {stats.totalPlants} plant{stats.totalPlants !== 1 ? 's' : ''} absorb approximately {stats.co2Absorbed.toFixed(1)}kg of CO₂ annually,
                    helping combat climate change.
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                    <Sprout className="h-7 w-7 text-primary" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">{stats.oxygenProduced.toFixed(1)} kg</p>
                  <p className="text-sm text-muted-foreground">O₂ produced per year</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Through photosynthesis, your plants produce approximately {stats.oxygenProduced.toFixed(1)}kg of oxygen yearly,
                    improving air quality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SDG Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle>UN Sustainable Development Goals</CardTitle>
              <CardDescription>
                Your contribution to global sustainability efforts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                    13
                  </div>
                  <div>
                    <h4 className="font-semibold">Climate Action</h4>
                    <p className="text-sm text-muted-foreground">
                      By growing plants, you're actively removing CO₂ from the atmosphere and 
                      contributing to climate change mitigation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                    15
                  </div>
                  <div>
                    <h4 className="font-semibold">Life on Land</h4>
                    <p className="text-sm text-muted-foreground">
                      Your plants support biodiversity and ecosystem health, providing 
                      habitat and food sources for local wildlife.
                    </p>
                  </div>
                </div>
              </div>
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

export default Dashboard;
