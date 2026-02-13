import { Plant, PLANT_TYPE_LABELS, WATER_FREQUENCY_LABELS, SUNLIGHT_LABELS } from '@/types/plant';
import { getDaysSinceLastWatered, isPlantOverdue, getDaysUntilWatering } from '@/lib/plantUtils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Droplets, 
  Sun, 
  Clock, 
  Trash2, 
  Pencil,
  Flower2,
  Salad,
  Home,
  TreeDeciduous,
  Shrub,
  Leaf,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlantCardProps {
  plant: Plant;
  onWater: (id: string) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (id: string) => void;
}

const plantTypeIcons: Record<string, React.ElementType> = {
  flower: Flower2,
  vegetable: Salad,
  indoor: Home,
  outdoor: TreeDeciduous,
  succulent: Shrub,
  herb: Leaf,
};

export const PlantCard = ({ plant, onWater, onEdit, onDelete }: PlantCardProps) => {
  const isOverdue = isPlantOverdue(plant);
  const daysSinceWatered = getDaysSinceLastWatered(plant.lastWatered);
  const daysUntilWatering = getDaysUntilWatering(plant);
  const PlantIcon = plantTypeIcons[plant.type] || Leaf;

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      isOverdue && "border-destructive/50 bg-destructive/5"
    )}>
      <CardHeader className="pb-3">
        {plant.image && (
          <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
            <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
            {plant.diseaseDetection && (
              <Badge 
                variant={plant.diseaseDetection.disease === 'Healthy' ? 'default' : 'destructive'}
                className="absolute top-2 right-2"
              >
                {plant.diseaseDetection.disease === 'Healthy' ? (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                ) : (
                  <AlertCircle className="mr-1 h-3 w-3" />
                )}
                {plant.diseaseDetection.disease}
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              isOverdue ? "bg-destructive/20" : "bg-primary/20"
            )}>
              <PlantIcon className={cn(
                "h-6 w-6",
                isOverdue ? "text-destructive" : "text-primary"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{plant.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {PLANT_TYPE_LABELS[plant.type]}
              </Badge>
            </div>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="animate-pulse">
              Needs Water!
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>{WATER_FREQUENCY_LABELS[plant.waterFrequency]}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span>{SUNLIGHT_LABELS[plant.sunlight]}</span>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 rounded-md p-2 text-sm",
          isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted"
        )}>
          <Clock className="h-4 w-4" />
          {isOverdue ? (
            <span>Overdue by {Math.abs(daysUntilWatering)} day{Math.abs(daysUntilWatering) !== 1 ? 's' : ''}</span>
          ) : daysUntilWatering === 0 ? (
            <span>Water today!</span>
          ) : (
            <span>Water in {daysUntilWatering} day{daysUntilWatering !== 1 ? 's' : ''}</span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Last watered: {daysSinceWatered === 0 ? 'Today' : `${daysSinceWatered} day${daysSinceWatered !== 1 ? 's' : ''} ago`}
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button 
          onClick={() => onWater(plant.id)} 
          className="flex-1"
          variant={isOverdue ? "default" : "secondary"}
        >
          <Droplets className="mr-2 h-4 w-4" />
          Water Now
        </Button>
        <Button variant="outline" size="icon" onClick={() => onEdit(plant)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {plant.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your plant from your collection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(plant.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
