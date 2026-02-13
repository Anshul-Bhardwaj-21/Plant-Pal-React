import { useState } from 'react';
import { usePlants } from '@/hooks/usePlants';
import { useWeather } from '@/hooks/useWeather';
import { Plant, PLANT_TYPE_LABELS, PlantType } from '@/types/plant';
import { PlantCard } from '@/components/PlantCard';
import { PlantForm } from '@/components/PlantForm';
import { ChatBot } from '@/components/ChatBot';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Leaf, PlusCircle, MessageSquare, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MyPlants = () => {
  const { plants, loading, updatePlant, deletePlant, waterPlant } = usePlants();
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || plant.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleWater = async (id: string) => {
    try {
      await waterPlant(id);
      const plant = plants.find((p) => p.id === id);
      toast.success(`${plant?.name} has been watered! 💧`);
    } catch (error) {
      toast.error('Failed to water plant. Please try again.');
    }
  };

  const handleEdit = (plant: Plant) => {
    navigate(`/plant/${plant.id}`);
  };

  const handleUpdate = async (data: Omit<Plant, 'id' | 'createdAt'>) => {
    if (editingPlant) {
      try {
        await updatePlant(editingPlant.id, data);
        setEditingPlant(null);
        toast.success('Plant updated successfully! 🌱');
      } catch (error) {
        toast.error('Failed to update plant. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const plant = plants.find((p) => p.id === id);
      await deletePlant(id);
      toast.success(`${plant?.name} has been removed from your garden.`);
    } catch (error) {
      toast.error('Failed to delete plant. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Plants</h1>
        <p className="text-muted-foreground">
          Manage your plant collection and keep track of their care schedules.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {(Object.entries(PLANT_TYPE_LABELS) as [PlantType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild>
                <Link to="/add-plant">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Plant
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setShowChat(!showChat)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>
            </div>
          </div>

          {/* Plants Grid */}
          {filteredPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <Leaf className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No plants found</h3>
              <p className="mb-4 text-muted-foreground">
                {plants.length === 0
                  ? "Start your plant journey by adding your first plant!"
                  : "No plants match your search criteria."}
              </p>
              {plants.length === 0 && (
                <Button asChild>
                  <Link to="/add-plant">Add Your First Plant</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onWater={handleWater}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <WeatherWidget weather={weather} loading={weatherLoading} onRefresh={refetchWeather} />
          {showChat && <ChatBot plants={plants} weather={weather} />}
        </div>
      </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlant} onOpenChange={() => setEditingPlant(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {editingPlant?.name}</DialogTitle>
          </DialogHeader>
          {editingPlant && (
            <PlantForm
              plant={editingPlant}
              onSubmit={handleUpdate}
              onCancel={() => setEditingPlant(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPlants;
