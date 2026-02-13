import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plant, PlantType, WaterFrequency, SunlightRequirement, PLANT_TYPE_LABELS, WATER_FREQUENCY_LABELS, SUNLIGHT_LABELS } from '@/types/plant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Leaf, Droplets, Sun, Calendar, Camera, Upload, X, Loader2 } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { DiseaseScanner } from './DiseaseScanner';
import { uploadPlantImage } from '@/services/storageService';
import { toast } from 'sonner';

const plantFormSchema = z.object({
  name: z.string().min(1, 'Plant name is required').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['flower', 'vegetable', 'indoor', 'outdoor', 'succulent', 'herb'] as const),
  waterFrequency: z.enum(['daily', 'every-2-days', 'weekly', 'bi-weekly', 'monthly'] as const),
  sunlight: z.enum(['full-sun', 'partial-sun', 'shade', 'indirect-light'] as const),
  lastWatered: z.string().min(1, 'Last watered date is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  potSize: z.enum(['small', 'medium', 'large', 'extra-large'] as const).optional(),
  soilType: z.enum(['clay', 'sandy', 'loamy', 'peat', 'chalky'] as const).optional(),
  location: z.enum(['indoor', 'outdoor', 'balcony', 'greenhouse'] as const).optional(),
  plantHeight: z.number().min(1).max(500).optional(),
});

type PlantFormData = z.infer<typeof plantFormSchema>;

interface PlantFormProps {
  plant?: Plant;
  onSubmit: (data: Omit<Plant, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  initialData?: {
    name?: string;
    type?: string;
    waterFrequency?: string;
    sunlight?: string;
    image?: string | null;
  };
}

export const PlantForm = ({ plant, onSubmit, onCancel, initialData }: PlantFormProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    plant?.image || initialData?.image || null
  );
  const [uploading, setUploading] = useState(false);
  const [diseaseData, setDiseaseData] = useState<{ disease: string; confidence: number; recommendations: string[] } | null>(
    plant?.diseaseDetection ? {
      disease: plant.diseaseDetection.disease,
      confidence: plant.diseaseDetection.confidence,
      recommendations: plant.diseaseDetection.recommendations || [],
    } : null
  );

  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      name: plant?.name || initialData?.name || '',
      type: (plant?.type || initialData?.type || 'indoor') as PlantType,
      waterFrequency: (plant?.waterFrequency || initialData?.waterFrequency || 'weekly') as WaterFrequency,
      sunlight: (plant?.sunlight || initialData?.sunlight || 'indirect-light') as SunlightRequirement,
      lastWatered: plant?.lastWatered || new Date().toISOString().split('T')[0],
      notes: plant?.notes || '',
      potSize: plant?.potSize || 'medium',
      soilType: plant?.soilType || 'loamy',
      location: plant?.location || 'indoor',
      plantHeight: plant?.plantHeight || 30,
    },
  });

  const handleSubmit = async (data: PlantFormData) => {
    try {
      setUploading(true);
      let imageUrl = capturedImage;

      if (capturedImage && capturedImage.startsWith('data:')) {
        const tempId = plant?.id || `temp-${Date.now()}`;
        imageUrl = await uploadPlantImage(capturedImage, tempId);
      }

      onSubmit({
        name: data.name,
        type: data.type as PlantType,
        waterFrequency: data.waterFrequency as WaterFrequency,
        sunlight: data.sunlight as SunlightRequirement,
        lastWatered: data.lastWatered,
        notes: data.notes,
        image: imageUrl || undefined,
        potSize: data.potSize,
        soilType: data.soilType,
        location: data.location,
        plantHeight: data.plantHeight,
        diseaseDetection: diseaseData ? {
          disease: diseaseData.disease,
          confidence: diseaseData.confidence,
          detectedAt: new Date().toISOString(),
          recommendations: diseaseData.recommendations,
        } : undefined,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save plant. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiseaseDetection = (result: { disease: string; confidence: number; recommendations: string[] }) => {
    setDiseaseData(result);
    setShowScanner(false);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleImageCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  if (showScanner) {
    return (
      <DiseaseScanner
        onDetectionComplete={handleDiseaseDetection}
        currentImage={capturedImage || undefined}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                Plant Name
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Rose, Aloe Vera" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plant Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.entries(PLANT_TYPE_LABELS) as [PlantType, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best describes your plant
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="waterFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                Watering Frequency
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select watering frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.entries(WATER_FREQUENCY_LABELS) as [WaterFrequency, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sunlight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                Sunlight Requirement
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sunlight requirement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.entries(SUNLIGHT_LABELS) as [SunlightRequirement, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastWatered"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Watered Date
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} max={new Date().toISOString().split('T')[0]} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any special care instructions or notes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Capture Section */}
        <div className="space-y-3">
          <FormLabel>Plant Image (Optional)</FormLabel>
          {capturedImage ? (
            <div className="relative">
              <img src={capturedImage} alt="Plant" className="w-full h-48 object-cover rounded-lg" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setCapturedImage(null);
                  setDiseaseData(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCamera(true)} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
              <Button type="button" variant="outline" className="flex-1" asChild>
                <label className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          )}
          {capturedImage && !diseaseData && (
            <Button type="button" variant="secondary" onClick={() => setShowScanner(true)} className="w-full">
              Scan for Diseases
            </Button>
          )}
          {diseaseData && (
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <p className="text-sm font-semibold">Disease Detection: {diseaseData.disease}</p>
              <p className="text-xs text-muted-foreground">Confidence: {diseaseData.confidence.toFixed(1)}%</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                Re-scan
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={uploading}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              plant ? 'Update Plant' : 'Add Plant'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
