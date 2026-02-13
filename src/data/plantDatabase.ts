// Comprehensive plant database for training and reference
export interface PlantData {
  id: string;
  commonName: string;
  scientificName: string;
  species: string;
  family: string;
  type: 'flower' | 'vegetable' | 'indoor' | 'outdoor' | 'succulent' | 'herb';
  characteristics: string[];
  careRequirements: {
    waterFrequency: 'daily' | 'every-2-days' | 'weekly' | 'bi-weekly' | 'monthly';
    sunlight: 'full-sun' | 'partial-sun' | 'shade' | 'indirect-light';
    temperature: string;
    humidity: string;
    soil: string;
  };
  visualFeatures: {
    leafShape: string;
    leafColor: string;
    flowerColor?: string;
    size: string;
    texture: string;
  };
  commonIssues: string[];
  benefits: string[];
  toxicity?: string;
  growthRate: string;
  matureSize: string;
}

export const PLANT_DATABASE: PlantData[] = [
  {
    id: 'monstera-deliciosa',
    commonName: 'Monstera',
    scientificName: 'Monstera deliciosa',
    species: 'M. deliciosa',
    family: 'Araceae',
    type: 'indoor',
    characteristics: [
      'Large, glossy, heart-shaped leaves with natural holes (fenestrations)',
      'Climbing vine with aerial roots',
      'Can grow up to 10-15 feet indoors',
      'Leaves develop splits as plant matures',
      'Native to tropical rainforests'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'indirect-light',
      temperature: '65-85°F (18-29°C)',
      humidity: '60-80%',
      soil: 'Well-draining, peat-based mix'
    },
    visualFeatures: {
      leafShape: 'Heart-shaped with splits and holes',
      leafColor: 'Deep green, glossy',
      size: 'Large (12-36 inches per leaf)',
      texture: 'Smooth, leathery'
    },
    commonIssues: ['Root rot from overwatering', 'Brown leaf tips from low humidity', 'Yellow leaves from overwatering'],
    benefits: ['Air purifying', 'Low maintenance', 'Fast growing'],
    toxicity: 'Toxic to pets and humans if ingested',
    growthRate: 'Fast',
    matureSize: '10-15 feet indoors'
  },
  {
    id: 'snake-plant',
    commonName: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    species: 'S. trifasciata',
    family: 'Asparagaceae',
    type: 'indoor',
    characteristics: [
      'Upright, sword-shaped leaves',
      'Variegated green and yellow patterns',
      'Extremely drought tolerant',
      'Can survive in low light',
      'Produces small white flowers (rare indoors)'
    ],
    careRequirements: {
      waterFrequency: 'bi-weekly',
      sunlight: 'indirect-light',
      temperature: '60-85°F (15-29°C)',
      humidity: '30-50%',
      soil: 'Well-draining cactus mix'
    },
    visualFeatures: {
      leafShape: 'Sword-shaped, upright',
      leafColor: 'Dark green with yellow edges',
      size: 'Medium (1-4 feet)',
      texture: 'Thick, succulent-like'
    },
    commonIssues: ['Root rot from overwatering', 'Soft leaves from cold damage'],
    benefits: ['Converts CO2 to oxygen at night', 'Extremely low maintenance', 'Air purifying'],
    toxicity: 'Toxic to pets if ingested',
    growthRate: 'Slow',
    matureSize: '2-4 feet'
  },
  {
    id: 'pothos',
    commonName: 'Pothos',
    scientificName: 'Epipremnum aureum',
    species: 'E. aureum',
    family: 'Araceae',
    type: 'indoor',
    characteristics: [
      'Heart-shaped leaves with variegation',
      'Trailing or climbing vine',
      'Very easy to propagate',
      'Tolerates neglect well',
      'Can grow in water or soil'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'indirect-light',
      temperature: '65-85°F (18-29°C)',
      humidity: '40-60%',
      soil: 'Well-draining potting mix'
    },
    visualFeatures: {
      leafShape: 'Heart-shaped',
      leafColor: 'Green with yellow/white variegation',
      size: 'Small to medium (2-4 inches per leaf)',
      texture: 'Smooth, waxy'
    },
    commonIssues: ['Brown spots from overwatering', 'Leggy growth from low light', 'Yellow leaves from overwatering'],
    benefits: ['Air purifying', 'Easy to grow', 'Fast growing'],
    toxicity: 'Toxic to pets and humans if ingested',
    growthRate: 'Fast',
    matureSize: '6-10 feet (trailing)'
  },
  {
    id: 'aloe-vera',
    commonName: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    species: 'A. barbadensis',
    family: 'Asphodelaceae',
    type: 'succulent',
    characteristics: [
      'Thick, fleshy leaves with serrated edges',
      'Gel-filled leaves with medicinal properties',
      'Produces tall flower spikes',
      'Drought tolerant succulent',
      'Forms offsets (pups) for propagation'
    ],
    careRequirements: {
      waterFrequency: 'bi-weekly',
      sunlight: 'full-sun',
      temperature: '55-80°F (13-27°C)',
      humidity: '30-50%',
      soil: 'Well-draining cactus/succulent mix'
    },
    visualFeatures: {
      leafShape: 'Lance-shaped, thick and fleshy',
      leafColor: 'Green to grey-green',
      size: 'Medium (6-24 inches)',
      texture: 'Smooth with small spines on edges'
    },
    commonIssues: ['Root rot from overwatering', 'Brown tips from underwatering', 'Sunburn from too much direct sun'],
    benefits: ['Medicinal gel for burns and skin care', 'Air purifying', 'Low maintenance'],
    toxicity: 'Toxic to pets if ingested',
    growthRate: 'Moderate',
    matureSize: '1-2 feet'
  },
  {
    id: 'spider-plant',
    commonName: 'Spider Plant',
    scientificName: 'Chlorophytum comosum',
    species: 'C. comosum',
    family: 'Asparagaceae',
    type: 'indoor',
    characteristics: [
      'Long, arching leaves with white stripes',
      'Produces plantlets on long stems',
      'Very easy to propagate',
      'Tolerates various conditions',
      'Non-toxic to pets'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'indirect-light',
      temperature: '60-75°F (15-24°C)',
      humidity: '40-60%',
      soil: 'Well-draining potting mix'
    },
    visualFeatures: {
      leafShape: 'Long, narrow, arching',
      leafColor: 'Green with white/cream stripes',
      size: 'Medium (12-18 inches)',
      texture: 'Smooth, grass-like'
    },
    commonIssues: ['Brown tips from fluoride in water', 'Yellow leaves from overwatering'],
    benefits: ['Air purifying', 'Pet-safe', 'Easy to grow'],
    toxicity: 'Non-toxic to pets',
    growthRate: 'Fast',
    matureSize: '1-2 feet'
  },
  {
    id: 'peace-lily',
    commonName: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    species: 'S. wallisii',
    family: 'Araceae',
    type: 'indoor',
    characteristics: [
      'Dark green glossy leaves',
      'White spathe flowers',
      'Droops when needs water',
      'Tolerates low light',
      'Blooms multiple times per year'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'shade',
      temperature: '65-80°F (18-27°C)',
      humidity: '50-70%',
      soil: 'Well-draining, peat-based mix'
    },
    visualFeatures: {
      leafShape: 'Oval, pointed tip',
      leafColor: 'Dark green, glossy',
      flowerColor: 'White',
      size: 'Medium (12-24 inches)',
      texture: 'Smooth, glossy'
    },
    commonIssues: ['Brown leaf tips from low humidity', 'Yellow leaves from overwatering', 'No flowers from insufficient light'],
    benefits: ['Air purifying', 'Low light tolerant', 'Beautiful flowers'],
    toxicity: 'Toxic to pets and humans if ingested',
    growthRate: 'Moderate',
    matureSize: '1-3 feet'
  },
  {
    id: 'rubber-plant',
    commonName: 'Rubber Plant',
    scientificName: 'Ficus elastica',
    species: 'F. elastica',
    family: 'Moraceae',
    type: 'indoor',
    characteristics: [
      'Large, thick, glossy leaves',
      'Can grow into a tree indoors',
      'Burgundy or variegated varieties available',
      'Produces milky sap when cut',
      'Air purifying qualities'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'indirect-light',
      temperature: '60-75°F (15-24°C)',
      humidity: '40-60%',
      soil: 'Well-draining potting mix'
    },
    visualFeatures: {
      leafShape: 'Oval, large',
      leafColor: 'Dark green, burgundy, or variegated',
      size: 'Large (4-12 inches per leaf)',
      texture: 'Thick, glossy, leathery'
    },
    commonIssues: ['Leaf drop from temperature changes', 'Brown edges from underwatering', 'Yellow leaves from overwatering'],
    benefits: ['Air purifying', 'Statement plant', 'Low maintenance'],
    toxicity: 'Toxic to pets if ingested',
    growthRate: 'Moderate to fast',
    matureSize: '6-10 feet indoors'
  },
  {
    id: 'zz-plant',
    commonName: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    species: 'Z. zamiifolia',
    family: 'Araceae',
    type: 'indoor',
    characteristics: [
      'Glossy, dark green leaflets',
      'Extremely drought tolerant',
      'Grows from rhizomes',
      'Tolerates very low light',
      'Nearly indestructible'
    ],
    careRequirements: {
      waterFrequency: 'bi-weekly',
      sunlight: 'indirect-light',
      temperature: '60-75°F (15-24°C)',
      humidity: '30-50%',
      soil: 'Well-draining cactus mix'
    },
    visualFeatures: {
      leafShape: 'Oval leaflets on upright stems',
      leafColor: 'Dark green, glossy',
      size: 'Medium (1-3 feet)',
      texture: 'Thick, waxy, glossy'
    },
    commonIssues: ['Root rot from overwatering', 'Yellow leaves from overwatering'],
    benefits: ['Extremely low maintenance', 'Drought tolerant', 'Low light tolerant'],
    toxicity: 'Toxic to pets if ingested',
    growthRate: 'Slow',
    matureSize: '2-3 feet'
  },
  {
    id: 'fiddle-leaf-fig',
    commonName: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    species: 'F. lyrata',
    family: 'Moraceae',
    type: 'indoor',
    characteristics: [
      'Large, violin-shaped leaves',
      'Dramatic statement plant',
      'Prefers consistent conditions',
      'Can grow into a tree',
      'Popular in interior design'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'indirect-light',
      temperature: '60-75°F (15-24°C)',
      humidity: '40-60%',
      soil: 'Well-draining potting mix'
    },
    visualFeatures: {
      leafShape: 'Violin-shaped, large',
      leafColor: 'Dark green with prominent veins',
      size: 'Large (12-18 inches per leaf)',
      texture: 'Leathery, slightly rough'
    },
    commonIssues: ['Brown spots from inconsistent watering', 'Leaf drop from drafts or temperature changes', 'Leggy growth from insufficient light'],
    benefits: ['Statement plant', 'Air purifying', 'Architectural appeal'],
    toxicity: 'Toxic to pets if ingested',
    growthRate: 'Moderate',
    matureSize: '6-10 feet indoors'
  },
  {
    id: 'basil',
    commonName: 'Basil',
    scientificName: 'Ocimum basilicum',
    species: 'O. basilicum',
    family: 'Lamiaceae',
    type: 'herb',
    characteristics: [
      'Aromatic leaves used in cooking',
      'Produces small white or purple flowers',
      'Annual herb',
      'Multiple varieties (sweet, Thai, lemon)',
      'Easy to grow from seed'
    ],
    careRequirements: {
      waterFrequency: 'daily',
      sunlight: 'full-sun',
      temperature: '70-90°F (21-32°C)',
      humidity: '40-60%',
      soil: 'Well-draining, rich potting mix'
    },
    visualFeatures: {
      leafShape: 'Oval with pointed tip',
      leafColor: 'Bright green',
      size: 'Small to medium (2-4 inches)',
      texture: 'Soft, slightly fuzzy'
    },
    commonIssues: ['Wilting from underwatering', 'Yellowing from overwatering', 'Pest infestations'],
    benefits: ['Culinary herb', 'Aromatic', 'Attracts pollinators'],
    toxicity: 'Non-toxic, edible',
    growthRate: 'Fast',
    matureSize: '1-2 feet'
  },
  {
    id: 'tomato',
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    species: 'S. lycopersicum',
    family: 'Solanaceae',
    type: 'vegetable',
    characteristics: [
      'Produces edible red fruits',
      'Compound leaves with serrated edges',
      'Requires support/staking',
      'Many varieties (cherry, beefsteak, heirloom)',
      'Annual plant'
    ],
    careRequirements: {
      waterFrequency: 'daily',
      sunlight: 'full-sun',
      temperature: '70-85°F (21-29°C)',
      humidity: '40-70%',
      soil: 'Rich, well-draining with compost'
    },
    visualFeatures: {
      leafShape: 'Compound with serrated leaflets',
      leafColor: 'Medium green',
      size: 'Medium to large (varies by variety)',
      texture: 'Slightly fuzzy'
    },
    commonIssues: ['Blossom end rot from calcium deficiency', 'Tomato hornworms', 'Early/late blight'],
    benefits: ['Edible fruits', 'High in vitamins', 'Versatile in cooking'],
    toxicity: 'Leaves and stems toxic, fruits edible',
    growthRate: 'Fast',
    matureSize: '3-8 feet (varies by variety)'
  },
  {
    id: 'lavender',
    commonName: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    species: 'L. angustifolia',
    family: 'Lamiaceae',
    type: 'herb',
    characteristics: [
      'Fragrant purple flower spikes',
      'Silvery-green foliage',
      'Drought tolerant once established',
      'Attracts bees and butterflies',
      'Used in aromatherapy and cooking'
    ],
    careRequirements: {
      waterFrequency: 'weekly',
      sunlight: 'full-sun',
      temperature: '60-70°F (15-21°C)',
      humidity: '30-50%',
      soil: 'Well-draining, sandy or gravelly'
    },
    visualFeatures: {
      leafShape: 'Narrow, linear',
      leafColor: 'Silvery-green',
      flowerColor: 'Purple, lavender',
      size: 'Small to medium (1-3 feet)',
      texture: 'Soft, slightly fuzzy'
    },
    commonIssues: ['Root rot from overwatering', 'Fungal diseases in humid conditions', 'Woody growth if not pruned'],
    benefits: ['Aromatic', 'Attracts pollinators', 'Culinary and medicinal uses'],
    toxicity: 'Non-toxic to humans, mild toxicity to pets',
    growthRate: 'Moderate',
    matureSize: '2-3 feet'
  },
  {
    id: 'rose',
    commonName: 'Rose',
    scientificName: 'Rosa',
    species: 'Rosa spp.',
    family: 'Rosaceae',
    type: 'flower',
    characteristics: [
      'Beautiful, fragrant flowers',
      'Thorny stems',
      'Compound leaves with serrated edges',
      'Thousands of varieties and colors',
      'Perennial shrub'
    ],
    careRequirements: {
      waterFrequency: 'every-2-days',
      sunlight: 'full-sun',
      temperature: '60-75°F (15-24°C)',
      humidity: '40-60%',
      soil: 'Rich, well-draining loam'
    },
    visualFeatures: {
      leafShape: 'Compound with 5-7 serrated leaflets',
      leafColor: 'Dark green, glossy',
      flowerColor: 'Various (red, pink, white, yellow, etc.)',
      size: 'Varies (1-6 feet)',
      texture: 'Smooth leaves, thorny stems'
    },
    commonIssues: ['Black spot fungus', 'Powdery mildew', 'Aphids', 'Japanese beetles'],
    benefits: ['Beautiful flowers', 'Fragrant', 'Cut flowers'],
    toxicity: 'Non-toxic, petals edible',
    growthRate: 'Moderate',
    matureSize: '2-6 feet (varies by variety)'
  },
  {
    id: 'cactus-prickly-pear',
    commonName: 'Prickly Pear Cactus',
    scientificName: 'Opuntia',
    species: 'Opuntia spp.',
    family: 'Cactaceae',
    type: 'succulent',
    characteristics: [
      'Flat, paddle-shaped pads',
      'Covered in spines and glochids',
      'Produces colorful flowers',
      'Edible fruits (tunas)',
      'Extremely drought tolerant'
    ],
    careRequirements: {
      waterFrequency: 'monthly',
      sunlight: 'full-sun',
      temperature: '70-100°F (21-38°C)',
      humidity: '10-30%',
      soil: 'Well-draining cactus mix'
    },
    visualFeatures: {
      leafShape: 'Flat, oval pads',
      leafColor: 'Green to blue-green',
      flowerColor: 'Yellow, orange, pink, or red',
      size: 'Medium to large (varies)',
      texture: 'Thick, fleshy with spines'
    },
    commonIssues: ['Root rot from overwatering', 'Cochineal scale insects', 'Sunburn if moved suddenly to bright sun'],
    benefits: ['Extremely low maintenance', 'Edible fruits and pads', 'Drought tolerant'],
    toxicity: 'Non-toxic, edible',
    growthRate: 'Slow to moderate',
    matureSize: '1-6 feet (varies by species)'
  },
  {
    id: 'fern-boston',
    commonName: 'Boston Fern',
    scientificName: 'Nephrolepis exaltata',
    species: 'N. exaltata',
    family: 'Nephrolepidaceae',
    type: 'indoor',
    characteristics: [
      'Feathery, arching fronds',
      'Prefers high humidity',
      'Non-flowering plant',
      'Produces spores on underside of fronds',
      'Popular hanging basket plant'
    ],
    careRequirements: {
      waterFrequency: 'every-2-days',
      sunlight: 'shade',
      temperature: '60-75°F (15-24°C)',
      humidity: '60-80%',
      soil: 'Well-draining, peat-based mix'
    },
    visualFeatures: {
      leafShape: 'Feathery, compound fronds',
      leafColor: 'Bright to medium green',
      size: 'Medium (1-3 feet)',
      texture: 'Soft, delicate'
    },
    commonIssues: ['Brown fronds from low humidity', 'Yellowing from overwatering', 'Leaf drop from dry air'],
    benefits: ['Air purifying', 'Non-toxic to pets', 'Beautiful foliage'],
    toxicity: 'Non-toxic to pets',
    growthRate: 'Moderate',
    matureSize: '2-3 feet'
  }
];

// Helper function to search plant database
export const searchPlantDatabase = (query: string): PlantData | null => {
  const lowerQuery = query.toLowerCase();
  return PLANT_DATABASE.find(plant => 
    plant.commonName.toLowerCase().includes(lowerQuery) ||
    plant.scientificName.toLowerCase().includes(lowerQuery) ||
    plant.species.toLowerCase().includes(lowerQuery)
  ) || null;
};

// Get plant by ID
export const getPlantById = (id: string): PlantData | null => {
  return PLANT_DATABASE.find(plant => plant.id === id) || null;
};

// Get all plants of a specific type
export const getPlantsByType = (type: PlantData['type']): PlantData[] => {
  return PLANT_DATABASE.filter(plant => plant.type === type);
};

// Get random plant for demo
export const getRandomPlant = (): PlantData => {
  return PLANT_DATABASE[Math.floor(Math.random() * PLANT_DATABASE.length)];
};
