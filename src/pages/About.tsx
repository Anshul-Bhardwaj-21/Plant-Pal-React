import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Sun, 
  TreeDeciduous, 
  Droplets, 
  Wind,
  Leaf,
  Heart,
  Target,
  Users,
  Sprout,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          UN Sustainable Development Goals
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Plant-Pal is designed to support the United Nations Sustainable Development Goals, 
          specifically SDG 13 (Climate Action) and SDG 15 (Life on Land).
        </p>
      </div>

      {/* SDG Cards */}
      <div className="mb-12 grid gap-8 lg:grid-cols-2">
        {/* SDG 13 */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/20 text-2xl font-bold">
                13
              </div>
              <div>
                <h2 className="text-2xl font-bold">Climate Action</h2>
                <p className="opacity-90">Take urgent action to combat climate change</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Wind className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Carbon Sequestration</h4>
                  <p className="text-sm text-muted-foreground">
                    Plants absorb CO₂ from the atmosphere through photosynthesis, 
                    storing carbon in their biomass and soil.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sun className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Temperature Regulation</h4>
                  <p className="text-sm text-muted-foreground">
                    Plants provide shade and release water vapor, helping to cool 
                    the surrounding environment naturally.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sprout className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Sustainable Living</h4>
                  <p className="text-sm text-muted-foreground">
                    Growing your own plants promotes sustainable practices and 
                    reduces your carbon footprint.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SDG 15 */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/20 text-2xl font-bold">
                15
              </div>
              <div>
                <h2 className="text-2xl font-bold">Life on Land</h2>
                <p className="opacity-90">Protect and restore terrestrial ecosystems</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TreeDeciduous className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Biodiversity Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Plants provide food, shelter, and nesting sites for insects, 
                    birds, and other wildlife.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplets className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Soil Conservation</h4>
                  <p className="text-sm text-muted-foreground">
                    Plant roots prevent soil erosion and improve soil structure, 
                    maintaining healthy ecosystems.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Leaf className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Urban Green Spaces</h4>
                  <p className="text-sm text-muted-foreground">
                    Even indoor and balcony plants contribute to urban greenery, 
                    improving air quality and mental health.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How Plant-Pal Helps */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            How Plant-Pal Supports SDGs
          </CardTitle>
          <CardDescription>
            Every plant you care for makes a difference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Track Impact</h4>
              <p className="text-sm text-muted-foreground">
                See exactly how much CO₂ your plants absorb and oxygen they produce annually.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Grow More Plants</h4>
              <p className="text-sm text-muted-foreground">
                Smart reminders help you keep plants healthy, encouraging you to grow more.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Spread Awareness</h4>
              <p className="text-sm text-muted-foreground">
                Share your plant journey and inspire others to contribute to sustainability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Statistics */}
      <Card className="mb-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-8">
          <h3 className="mb-6 text-center text-xl font-semibold">Did You Know?</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">2.5 kg</p>
              <p className="text-sm text-muted-foreground">CO₂ absorbed per plant annually</p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">2.5 kg</p>
              <p className="text-sm text-muted-foreground">O₂ produced per plant annually</p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">3°C</p>
              <p className="text-sm text-muted-foreground">Temperature reduction from plants</p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">25%</p>
              <p className="text-sm text-muted-foreground">Air quality improvement indoors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <h3 className="mb-4 text-2xl font-bold">Start Making a Difference Today</h3>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          Every plant you nurture contributes to a healthier planet. 
          Start your sustainable journey with Plant-Pal!
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/add-plant">
              <Leaf className="mr-2 h-5 w-5" />
              Add Your First Plant
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a 
              href="https://sdgs.un.org/goals" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Learn More About SDGs
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
