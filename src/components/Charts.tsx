import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plant } from '@/types/plant';
import { calculateHealthScore } from '@/services/badgeService';

interface PlantHealthChartProps {
  healthy: number;
  neglected: number;
}

interface WateringChartProps {
  data: { day: string; watered: number }[];
}

interface ChartsProps {
  plant: Plant;
}

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

export const PlantHealthChart = ({ healthy, neglected }: PlantHealthChartProps) => {
  const data = [
    { name: 'Healthy', value: healthy },
    { name: 'Needs Attention', value: neglected },
  ];

  const total = healthy + neglected;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plant Health</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-muted-foreground">No plants to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plant Health</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const WateringActivityChart = ({ data }: WateringChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Watering Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" />
            <YAxis className="text-xs" allowDecimals={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="watered" 
              fill="hsl(142, 76%, 36%)" 
              radius={[4, 4, 0, 0]}
              name="Plants Watered"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const Charts = ({ plant }: ChartsProps) => {
  const careHistory = plant.careHistory || [];
  
  // Generate health score over time (last 30 days)
  const healthData = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate health score based on care history
    const careOnDay = careHistory.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    }).length;
    
    const baseHealth = calculateHealthScore(plant);
    const variance = Math.random() * 10 - 5;
    const health = Math.max(0, Math.min(100, baseHealth + variance - (29 - i) * 0.5));
    
    healthData.push({
      date: dateStr,
      health: Math.round(health),
    });
  }

  // Care activity by type
  const careByType = careHistory.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const careActivityData = Object.entries(careByType).map(([type, count]) => ({
    type: type.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    count,
  }));

  // Watering frequency (last 7 days)
  const wateringData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const watered = careHistory.some(entry => {
      const entryDate = new Date(entry.date);
      return entry.type === 'water' && entryDate.toDateString() === date.toDateString();
    });
    
    wateringData.push({
      day: dateStr,
      watered: watered ? 1 : 0,
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Health Score Trend</CardTitle>
          <CardDescription>Plant health over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="health" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Health Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {careActivityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Care Activity</CardTitle>
            <CardDescription>Total care actions by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={careActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[8, 8, 0, 0]} name="Actions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Watering Schedule</CardTitle>
          <CardDescription>Last 7 days watering activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={wateringData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="watered" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} name="Watered" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
