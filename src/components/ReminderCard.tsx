import { PlantReminder } from '@/types/plant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Sun, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderCardProps {
  reminder: PlantReminder;
  onWater?: (plantId: string) => void;
}

export const ReminderCard = ({ reminder, onWater }: ReminderCardProps) => {
  const isWaterReminder = reminder.type === 'water';

  return (
    <Card className={cn(
      "transition-all",
      reminder.isOverdue && "border-destructive/50 bg-destructive/5"
    )}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            reminder.isOverdue 
              ? "bg-destructive/20" 
              : isWaterReminder 
                ? "bg-blue-500/20" 
                : "bg-yellow-500/20"
          )}>
            {reminder.isOverdue ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : isWaterReminder ? (
              <Droplets className="h-5 w-5 text-blue-500" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <div>
            <p className={cn(
              "font-medium",
              reminder.isOverdue && "text-destructive"
            )}>
              {reminder.message}
            </p>
            <p className="text-sm text-muted-foreground">
              {reminder.plantName}
            </p>
          </div>
        </div>

        {isWaterReminder && onWater && (
          <Button 
            size="sm" 
            onClick={() => onWater(reminder.plantId)}
            variant={reminder.isOverdue ? "default" : "secondary"}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Done
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
