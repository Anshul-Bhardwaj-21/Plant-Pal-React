import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Leaf, 
  Droplets, 
  Sun, 
  Bell, 
  BarChart3, 
  Globe,
  ArrowRight,
  Sprout,
  Wind
} from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Track Your Plants',
    description: 'Keep a detailed record of all your plants with custom care schedules.',
  },
  {
    icon: Droplets,
    title: 'Watering Reminders',
    description: 'Never forget to water your plants with smart reminder notifications.',
  },
  {
    icon: Sun,
    title: 'Sunlight Tracking',
    description: 'Ensure your plants get the right amount of sunlight they need.',
  },
  {
    icon: BarChart3,
    title: 'Growth Dashboard',
    description: 'Visualize your plant care journey with beautiful charts and stats.',
  },
  {
    icon: Globe,
    title: 'Environmental Impact',
    description: 'See how your plants contribute to a healthier planet.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get timely alerts for all your plant care activities.',
  },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <img src="/logo.svg" alt="Plant Pal" className="h-32 w-32 md:h-40 md:w-40" />
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sprout className="h-4 w-4" />
              Supporting UN SDG 13 & SDG 15
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Your Personal
              <span className="text-primary"> Plant Care </span>
              Companion
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Plant-Pal helps you nurture your green friends while making a positive impact on the environment. 
              Track watering schedules, monitor plant health, and watch your garden flourish.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/add-plant">
                  <Leaf className="h-5 w-5" />
                  Add Your First Plant
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/my-plants">
                  View My Plants
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* Environmental Impact Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <Wind className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5 kg</p>
                <p className="text-sm text-muted-foreground">CO₂ absorbed per plant/year</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <Sprout className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5 kg</p>
                <p className="text-sm text-muted-foreground">O₂ produced per plant/year</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">SDG 13 & 15</p>
                <p className="text-sm text-muted-foreground">Climate Action & Life on Land</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need to
              <span className="text-primary"> Grow Green</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Plant-Pal provides all the tools you need to become a successful plant parent 
              while contributing to a sustainable future.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Your Plant Journey?</h2>
          <p className="mx-auto mb-8 max-w-xl opacity-90">
            Join thousands of plant enthusiasts who are making a difference, one plant at a time.
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2">
            <Link to="/add-plant">
              <Leaf className="h-5 w-5" />
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
