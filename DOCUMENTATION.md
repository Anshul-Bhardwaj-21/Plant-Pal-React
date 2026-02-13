# Plant-Pal Application - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Components Documentation](#components-documentation)
7. [Services & APIs](#services--apis)
8. [State Management](#state-management)
9. [Data Models](#data-models)
10. [Setup & Installation](#setup--installation)
11. [Development Guide](#development-guide)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Project Overview

**Plant-Pal** is a comprehensive plant care management application that helps users track, monitor, and maintain their plants. The application integrates AI-powered disease detection, weather-based care recommendations, and an intelligent chatbot assistant.

### Key Capabilities
- 🌱 Plant inventory management with detailed care tracking
- 📸 Camera-based plant disease detection using TensorFlow.js
- 🤖 AI-powered chatbot for plant care advice (Google Gemini)
- 🌤️ Weather integration for location-based watering recommendations
- 📊 Dashboard with analytics and health statistics
- ⏰ Smart reminders for watering and care tasks
- 📱 Responsive design for mobile and desktop

---

## Architecture

### Application Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │    Hooks     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌──────▼──────┐ ┌───────▼────────┐
│   Firebase     │ │   Gemini    │ │ OpenWeatherMap │
│  (Firestore +  │ │     AI      │ │      API       │
│    Storage)    │ │             │ │                │
└────────────────┘ └─────────────┘ └────────────────┘
```

### Data Flow
1. **User Interaction** → React Components
2. **State Management** → Custom Hooks (usePlants, useWeather, useCamera)
3. **Data Persistence** → Firebase Firestore
4. **File Storage** → Firebase Storage
5. **AI Processing** → Google Gemini API / TensorFlow.js
6. **Weather Data** → OpenWeatherMap API

---

## Technology Stack

### Frontend Framework
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Components & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library
- **Recharts 2.15.4** - Data visualization

### State Management & Data Fetching
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

### Backend Services
- **Firebase 12.9.0** - Backend as a Service
  - Firestore - NoSQL database
  - Storage - File storage
- **Google Generative AI 0.24.1** - Gemini AI integration
- **Axios 1.13.5** - HTTP client

### AI & Machine Learning
- **TensorFlow.js 4.22.0** - ML in the browser
- **TensorFlow.js Converter 4.22.0** - Model conversion

### Development Tools
- **ESLint 9.32.0** - Code linting
- **Vitest 3.2.4** - Unit testing
- **Testing Library** - Component testing
- **TypeScript ESLint** - TypeScript linting

---

## Project Structure

```
plant-pal/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (50+ UI components)
│   │   ├── CameraCapture.tsx    # Camera functionality
│   │   ├── Charts.tsx           # Data visualization
│   │   ├── ChatBot.tsx          # AI chatbot interface
│   │   ├── DiseaseScanner.tsx   # Disease detection
│   │   ├── Footer.tsx           # App footer
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── PlantCard.tsx        # Plant display card
│   │   ├── PlantForm.tsx        # Add/edit plant form
│   │   ├── ReminderCard.tsx     # Reminder display
│   │   ├── StatCard.tsx         # Statistics card
│   │   └── WeatherWidget.tsx    # Weather display
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCamera.ts         # Camera access hook
│   │   ├── usePlants.ts         # Plant CRUD operations
│   │   ├── useWeather.ts        # Weather data hook
│   │   └── use-toast.ts         # Toast notifications
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── firebase.ts          # Firebase configuration
│   │   ├── plantUtils.ts        # Plant helper functions
│   │   └── utils.ts             # General utilities
│   │
│   ├── pages/                   # Route pages
│   │   ├── Index.tsx            # Landing page
│   │   ├── MyPlants.tsx         # Plant list view
│   │   ├── AddPlant.tsx         # Add plant form
│   │   ├── PlantDetail.tsx      # Individual plant view
│   │   ├── Dashboard.tsx        # Analytics dashboard
│   │   ├── Reminders.tsx        # Reminders page
│   │   ├── About.tsx            # About page
│   │   └── NotFound.tsx         # 404 page
│   │
│   ├── services/                # External service integrations
│   │   ├── diseaseDetectionService.ts  # TensorFlow disease detection
│   │   ├── geminiService.ts            # Google Gemini AI
│   │   ├── weatherService.ts           # OpenWeatherMap API
│   │   ├── storageService.ts           # Firebase Storage
│   │   └── initializeFirebase.ts       # Firebase initialization
│   │
│   ├── test/                    # Test files
│   │   ├── setup.ts             # Test configuration
│   │   └── example.test.ts      # Example tests
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── plant.ts             # Plant-related types
│   │
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # App entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite type definitions
│
├── .gitignore                   # Git ignore rules
├── API_SETUP_GUIDE.md          # API configuration guide
├── README.md                    # Project readme
├── DOCUMENTATION.md            # This file
├── components.json              # shadcn/ui config
├── eslint.config.js            # ESLint configuration
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
└── vitest.config.ts            # Vitest test config
```

---

## Core Features

### 1. Plant Management


**Features:**
- Add new plants with detailed information (name, type, watering schedule, sunlight needs)
- Upload plant photos via camera or file upload
- Edit plant details
- Delete plants
- View individual plant details
- Track last watered date
- Automatic watering reminders

**Implementation:**
- `usePlants` hook manages all plant CRUD operations
- Firebase Firestore for data persistence
- Firebase Storage for image storage
- Real-time updates using Firestore snapshots

### 2. Disease Detection

**Features:**
- Camera-based plant image capture
- AI-powered disease identification
- Confidence score for detections
- Treatment recommendations
- Disease history tracking

**Implementation:**
- TensorFlow.js with MobileNet v2 model
- 15 disease categories including common plant diseases
- Fallback to simulated detection if model fails
- Recommendations database for each disease type

**Supported Diseases:**
- Healthy
- Bacterial Leaf Spot
- Early Blight
- Late Blight
- Leaf Mold
- Septoria Leaf Spot
- Spider Mites
- Target Spot
- Yellow Leaf Curl Virus
- Mosaic Virus
- Powdery Mildew
- Rust
- Anthracnose
- Black Spot
- Root Rot

### 3. AI Chatbot Assistant

**Features:**
- Context-aware plant care advice
- Integration with user's plant collection
- Weather-aware recommendations
- Disease-specific guidance
- Natural language interaction

**Implementation:**
- Google Gemini Pro model
- Context building with plant data, weather, and disease info
- Error handling for API limits and failures
- Conversation history support

### 4. Weather Integration

**Features:**
- Current weather conditions
- 5-day forecast
- Location-based data
- Watering recommendations based on weather
- Temperature, humidity, wind speed, precipitation

**Implementation:**
- OpenWeatherMap API
- Geolocation API for user location
- Local storage caching (30-minute TTL)
- Weather-based care advice

### 5. Dashboard & Analytics

**Features:**
- Total plant count
- Plants watered today
- Plants due for watering
- Health statistics (healthy vs neglected)
- Environmental impact (CO2 absorbed, O2 produced)
- Weekly watering activity chart
- Plant health distribution chart

**Implementation:**
- Recharts for data visualization
- Real-time calculations from plant data
- Responsive chart layouts

### 6. Smart Reminders

**Features:**
- Automatic watering reminders
- Overdue notifications
- Sunlight requirement reminders
- Sorted by urgency
- Days overdue tracking

**Implementation:**
- Calculated from watering frequency and last watered date
- Real-time updates
- Priority sorting (overdue first)

---

## Components Documentation

### Core Components

#### `<Navbar />`
**Location:** `src/components/Navbar.tsx`

Navigation bar with responsive design and mobile menu.

**Features:**
- Logo and branding
- Navigation links (Home, My Plants, Add Plant, Dashboard, Reminders, About)
- Mobile hamburger menu
- Active route highlighting

#### `<Footer />`
**Location:** `src/components/Footer.tsx`

Application footer with copyright and links.

#### `<PlantCard />`
**Location:** `src/components/PlantCard.tsx`

**Props:**
```typescript
interface PlantCardProps {
  plant: Plant;
  onWater: (id: string) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (id: string) => void;
}
```

**Features:**
- Plant image display
- Plant details (type, watering schedule, sunlight)
- Last watered date
- Days until next watering
- Quick water button
- Edit and delete actions
- Disease detection badge

#### `<PlantForm />`
**Location:** `src/components/PlantForm.tsx`

**Props:**
```typescript
interface PlantFormProps {
  onSubmit: (data: PlantFormData) => void;
  initialData?: Plant;
  isLoading?: boolean;
}
```

**Features:**
- Form validation with Zod
- Plant name input
- Type selection (flower, vegetable, indoor, outdoor, succulent, herb)
- Watering frequency selection
- Sunlight requirement selection
- Notes textarea
- Image upload (camera or file)
- Disease scanning integration

#### `<CameraCapture />`
**Location:** `src/components/CameraCapture.tsx`

**Props:**
```typescript
interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}
```

**Features:**
- Camera stream access
- Live video preview
- Capture button
- Cancel button
- Error handling for camera permissions

#### `<DiseaseScanner />`
**Location:** `src/components/DiseaseScanner.tsx`

**Props:**
```typescript
interface DiseaseScannerProps {
  onDetectionComplete: (result: DiseaseDetection) => void;
  currentImage?: string;
}
```

**Features:**
- Image preview
- Scan button
- Loading state
- Disease result display
- Confidence percentage
- Treatment recommendations

#### `<ChatBot />`
**Location:** `src/components/ChatBot.tsx`

**Props:**
```typescript
interface ChatBotProps {
  plants: Plant[];
  weather: WeatherData | null;
  selectedPlant?: Plant;
}
```

**Features:**
- Message history
- User input
- AI responses
- Context-aware suggestions
- Loading states
- Error handling

#### `<WeatherWidget />`
**Location:** `src/components/WeatherWidget.tsx`

**Features:**
- Current temperature
- Weather condition icon
- Feels like temperature
- Humidity percentage
- Wind speed
- 5-day forecast
- Watering advice

#### `<Charts />`
**Location:** `src/components/Charts.tsx`

**Components:**
- `PlantHealthChart` - Pie chart showing healthy vs neglected plants
- `WateringActivityChart` - Bar chart showing weekly watering activity

#### `<StatCard />`
**Location:** `src/components/StatCard.tsx`

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}
```

Displays a single statistic with icon and description.

#### `<ReminderCard />`
**Location:** `src/components/ReminderCard.tsx`

**Props:**
```typescript
interface ReminderCardProps {
  reminder: PlantReminder;
  onWater?: (plantId: string) => void;
}
```

Displays a reminder with urgency indicator and quick action button.

---

## Services & APIs

### Firebase Service
**Location:** `src/lib/firebase.ts`

**Configuration:**
```typescript
const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
};
```

**Exports:**
- `db` - Firestore database instance
- `storage` - Firebase Storage instance

### Storage Service
**Location:** `src/services/storageService.ts`

**Functions:**

```typescript
// Upload plant image to Firebase Storage
uploadPlantImage(imageData: string, plantId: string): Promise<string>

// Delete plant image from Firebase Storage
deletePlantImage(imageUrl: string): Promise<void>
```

### Gemini AI Service
**Location:** `src/services/geminiService.ts`

**Functions:**

```typescript
// Send chat message with context
sendChatMessage(
  message: string,
  context: {
    plants: Plant[];
    weather: WeatherData | null;
    selectedPlant?: Plant;
  }
): Promise<string>

// Get plant health summary
getPlantHealthSummary(
  plant: Plant,
  weather: WeatherData | null
): Promise<string>
```

**Context Building:**
- User's plant collection
- Current weather conditions
- 5-day forecast
- Selected plant details
- Disease detection results

### Weather Service
**Location:** `src/services/weatherService.ts`

**Functions:**

```typescript
// Get weather by coordinates
getWeatherByLocation(lat: number, lon: number): Promise<WeatherData | null>

// Get user's current location
getCurrentLocation(): Promise<{ lat: number; lon: number }>

// Get watering advice based on weather
getWateringAdvice(weather: WeatherData): string
```

**Weather Advice Logic:**
- Rain expected (>5mm) → Reduce watering
- Hot weather (>30°C) → Increase watering
- Cold weather (<10°C) → Reduce watering
- Low humidity (<30%) → Extra water needed
- High humidity (>80%) → Reduce watering

### Disease Detection Service
**Location:** `src/services/diseaseDetectionService.ts`

**Functions:**

```typescript
// Load TensorFlow model
loadModel(): Promise<void>

// Detect disease from image
detectDisease(imageElement: HTMLImageElement): Promise<{
  disease: string;
  confidence: number;
  recommendations: string[];
}>
```

**Model:**
- MobileNet v2 (224x224 input)
- TensorFlow Hub hosted
- 15 disease categories
- Confidence scoring

---

## State Management

### Custom Hooks

#### `usePlants()`
**Location:** `src/hooks/usePlants.ts`

**Returns:**
```typescript
{
  plants: Plant[];              // All plants
  loading: boolean;             // Loading state
  addPlant: (data) => Promise<Plant>;
  updatePlant: (id, updates) => Promise<void>;
  deletePlant: (id) => Promise<void>;
  waterPlant: (id) => Promise<void>;
  getPlantById: (id) => Plant | undefined;
}
```

**Features:**
- Real-time Firestore synchronization
- Automatic sorting by creation date
- Error handling
- Optimistic updates

#### `useWeather()`
**Location:** `src/hooks/useWeather.ts`

**Returns:**
```typescript
{
  weather: WeatherData | null;  // Current weather
  loading: boolean;             // Loading state
  error: string | null;         // Error message
  refetch: () => Promise<void>; // Manual refresh
}
```

**Features:**
- Automatic location detection
- 30-minute cache
- Fallback to cached data on error
- Manual refresh capability

#### `useCamera()`
**Location:** `src/hooks/useCamera.ts`

**Returns:**
```typescript
{
  videoRef: RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
}
```

**Features:**
- Camera permission handling
- Video stream management
- Image capture to base64
- Automatic cleanup

---

## Data Models

### Plant Interface
**Location:** `src/types/plant.ts`

```typescript
interface Plant {
  id: string;
  name: string;
  type: PlantType;
  waterFrequency: WaterFrequency;
  sunlight: SunlightRequirement;
  lastWatered: string;          // ISO date string
  createdAt: string;            // ISO date string
  notes?: string;
  image?: string;               // Firebase Storage URL
  diseaseDetection?: DiseaseDetection;
}
```

### Disease Detection
```typescript
interface DiseaseDetection {
  disease: string;
  confidence: number;           // 0-100
  detectedAt: string;           // ISO date string
  recommendations?: string[];
}
```

### Weather Data
```typescript
interface WeatherData {
  temperature: number;          // Celsius
  humidity: number;             // Percentage
  condition: string;            // e.g., "Clear", "Rain"
  feelsLike: number;           // Celsius
  windSpeed: number;           // km/h
  uvIndex: number;
  precipitation: number;        // mm
  forecast: WeatherForecast[];
}

interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitation: number;        // Percentage
  humidity: number;
}
```

### Plant Reminder
```typescript
interface PlantReminder {
  plantId: string;
  plantName: string;
  type: 'water' | 'sunlight';
  message: string;
  isOverdue: boolean;
  daysOverdue: number;
}
```

### Plant Statistics
```typescript
interface PlantStats {
  totalPlants: number;
  wateredToday: number;
  dueForWatering: number;
  healthyPlants: number;
  neglectedPlants: number;
  co2Absorbed: number;          // kg per year
  oxygenProduced: number;       // kg per year
}
```

### Enums

```typescript
type PlantType = 
  | 'flower' 
  | 'vegetable' 
  | 'indoor' 
  | 'outdoor' 
  | 'succulent' 
  | 'herb';

type WaterFrequency = 
  | 'daily' 
  | 'every-2-days' 
  | 'weekly' 
  | 'bi-weekly' 
  | 'monthly';

type SunlightRequirement = 
  | 'full-sun' 
  | 'partial-sun' 
  | 'shade' 
  | 'indirect-light';
```

---

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase account
- Google Gemini API key
- OpenWeatherMap API key

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd plant-pal
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# OpenWeatherMap
VITE_WEATHER_API_KEY=your_weather_api_key
```

See `API_SETUP_GUIDE.md` for detailed instructions on obtaining API keys.

### Step 4: Firebase Setup

1. Create Firestore Database:
   - Go to Firebase Console
   - Create database in test mode
   - Choose location

2. Enable Firebase Storage:
   - Go to Storage section
   - Click "Get Started"
   - Choose same location as Firestore

3. Configure Security Rules (Development):

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 5: Run Development Server
```bash
npm run dev
```

Application will be available at `http://localhost:8080`

---

## Development Guide

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Code Style Guidelines

1. **TypeScript:**
   - Use interfaces for object shapes
   - Avoid `any` type when possible
   - Use type inference where appropriate

2. **React:**
   - Functional components with hooks
   - Use `React.FC` or explicit return types
   - Extract reusable logic into custom hooks

3. **File Naming:**
   - Components: PascalCase (e.g., `PlantCard.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `usePlants.ts`)
   - Utilities: camelCase (e.g., `plantUtils.ts`)
   - Types: camelCase (e.g., `plant.ts`)

4. **Component Structure:**
   ```typescript
   // 1. Imports
   import { useState } from 'react';
   
   // 2. Types/Interfaces
   interface ComponentProps {
     // ...
   }
   
   // 3. Component
   export const Component = ({ prop }: ComponentProps) => {
     // 4. Hooks
     const [state, setState] = useState();
     
     // 5. Functions
     const handleClick = () => {
       // ...
     };
     
     // 6. JSX
     return (
       <div>
         {/* ... */}
       </div>
     );
   };
   ```

### Adding New Features

#### 1. Add New Plant Type

**Update types:**
```typescript
// src/types/plant.ts
type PlantType = 
  | 'flower' 
  | 'vegetable' 
  | 'indoor' 
  | 'outdoor' 
  | 'succulent' 
  | 'herb'
  | 'new-type';  // Add here

export const PLANT_TYPE_LABELS: Record<PlantType, string> = {
  // ... existing types
  'new-type': 'New Type',
};
```

#### 2. Add New Disease

**Update disease detection service:**
```typescript
// src/services/diseaseDetectionService.ts
const PLANT_DISEASES = [
  // ... existing diseases
  'New Disease',
];

const getRecommendations = (disease: string): string[] => {
  const recommendationsMap: Record<string, string[]> = {
    // ... existing recommendations
    'New Disease': [
      'Recommendation 1',
      'Recommendation 2',
    ],
  };
  // ...
};
```

#### 3. Add New Page

**Create page component:**
```typescript
// src/pages/NewPage.tsx
export const NewPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1>New Page</h1>
    </div>
  );
};
```

**Add route:**
```typescript
// src/App.tsx
import NewPage from './pages/NewPage';

// In Routes:
<Route path="/new-page" element={<NewPage />} />
```

**Add navigation link:**
```typescript
// src/components/Navbar.tsx
<NavLink to="/new-page">New Page</NavLink>
```

### Utility Functions

#### Plant Utilities
**Location:** `src/lib/plantUtils.ts`

```typescript
// Get days since last watered
getDaysSinceLastWatered(lastWatered: string): number

// Check if plant is overdue for watering
isPlantOverdue(plant: Plant): boolean

// Get days until next watering
getDaysUntilWatering(plant: Plant): number

// Get all reminders for plants
getPlantReminders(plants: Plant[]): PlantReminder[]

// Calculate plant statistics
getPlantStats(plants: Plant[]): PlantStats

// Get weekly watering data for charts
getWeeklyWateringData(plants: Plant[]): ChartData[]

// Generate unique ID
generateId(): string
```

---

## Testing

### Test Setup
**Location:** `src/test/setup.ts`

Configures:
- jsdom environment
- Testing Library matchers
- Global test utilities

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

**Example component test:**
```typescript
import { render, screen } from '@testing-library/react';
import { PlantCard } from '@/components/PlantCard';

describe('PlantCard', () => {
  const mockPlant = {
    id: '1',
    name: 'Rose',
    type: 'flower',
    waterFrequency: 'daily',
    sunlight: 'full-sun',
    lastWatered: '2024-01-01',
    createdAt: '2024-01-01',
  };

  it('renders plant name', () => {
    render(
      <PlantCard 
        plant={mockPlant}
        onWater={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    
    expect(screen.getByText('Rose')).toBeInTheDocument();
  });
});
```

### Test Coverage

Focus areas:
- Component rendering
- User interactions
- Form validation
- Utility functions
- API error handling

---

## Deployment

### Build for Production

```bash
npm run build
```

Output directory: `dist/`

### Environment Variables

Ensure all environment variables are set in your deployment platform:
- Firebase configuration
- Gemini API key
- Weather API key

### Deployment Platforms

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

### Production Considerations

1. **Firebase Security Rules:**
   - Implement proper authentication
   - Restrict read/write access
   - Validate data on write

2. **API Key Security:**
   - Use environment variables
   - Restrict API keys by domain
   - Monitor usage and quotas

3. **Performance:**
   - Enable code splitting
   - Optimize images
   - Use CDN for static assets
   - Implement lazy loading

4. **Monitoring:**
   - Set up error tracking (e.g., Sentry)
   - Monitor API usage
   - Track user analytics

---

## API Reference

### Firebase Firestore

**Collection:** `plants`

**Document Structure:**
```json
{
  "name": "Rose",
  "type": "flower",
  "waterFrequency": "daily",
  "sunlight": "full-sun",
  "lastWatered": "2024-01-01",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "notes": "Beautiful red roses",
  "image": "https://firebasestorage.googleapis.com/...",
  "diseaseDetection": {
    "disease": "Healthy",
    "confidence": 95.5,
    "detectedAt": "2024-01-01T00:00:00.000Z",
    "recommendations": ["Continue regular care"]
  }
}
```

### Google Gemini API

**Endpoint:** Gemini Pro model

**Request:**
```typescript
{
  model: 'gemini-pro',
  prompt: string,
  context: {
    plants: Plant[],
    weather: WeatherData,
    selectedPlant?: Plant
  }
}
```

**Response:**
```typescript
{
  text: string  // AI-generated response
}
```

### OpenWeatherMap API

**Current Weather:**
```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}
  &lon={lon}
  &appid={API_KEY}
  &units=metric
```

**5-Day Forecast:**
```
GET https://api.openweathermap.org/data/2.5/forecast
  ?lat={lat}
  &lon={lon}
  &appid={API_KEY}
  &units=metric
```

---

## Troubleshooting

### Common Issues

#### Firebase Connection Errors
**Problem:** "Firebase: Error (auth/invalid-api-key)"

**Solution:**
- Verify `.env` file exists
- Check all Firebase config values
- Ensure no extra spaces in values
- Restart development server

#### Camera Not Working
**Problem:** "Camera permission denied"

**Solution:**
- Check browser permissions
- Use HTTPS (required for camera access)
- Try different browser
- Check camera is not in use by another app

#### Weather Data Not Loading
**Problem:** "Invalid API key" or "Location permission denied"

**Solution:**
- Wait 10-15 minutes after creating OpenWeatherMap account
- Allow location permission in browser
- Check API key is correct
- Verify API key is activated

#### Gemini API Errors
**Problem:** "API key not valid" or "Quota exceeded"

**Solution:**
- Verify API key starts with "AIza"
- Wait a few minutes after creating key
- Check free tier limits (60 requests/minute)
- Regenerate API key if needed

#### Build Errors
**Problem:** TypeScript compilation errors

**Solution:**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript version compatibility
- Clear `node_modules` and reinstall
- Check for missing type definitions

---

## Performance Optimization

### Current Optimizations

1. **Code Splitting:**
   - React Router lazy loading
   - Dynamic imports for heavy components

2. **Caching:**
   - Weather data cached for 30 minutes
   - Firebase Firestore offline persistence
   - Service worker for static assets

3. **Image Optimization:**
   - JPEG compression (0.8 quality)
   - Responsive image sizing
   - Lazy loading for plant images

4. **Bundle Size:**
   - Tree shaking enabled
   - Production builds minified
   - Unused dependencies removed

### Future Improvements

1. **Virtual Scrolling:**
   - For large plant lists
   - Implement with `react-window`

2. **Image CDN:**
   - Use Firebase CDN
   - Implement image transformations

3. **Progressive Web App:**
   - Add service worker
   - Enable offline mode
   - Add to home screen

4. **Database Indexing:**
   - Index Firestore queries
   - Optimize query performance

---

## Security Best Practices

### Current Implementation

1. **Environment Variables:**
   - API keys in `.env` file
   - `.env` in `.gitignore`
   - No hardcoded secrets

2. **Firebase Rules:**
   - Test mode for development
   - Production rules needed

3. **Input Validation:**
   - Zod schema validation
   - Form input sanitization
   - Type checking with TypeScript

### Production Security Checklist

- [ ] Implement Firebase Authentication
- [ ] Update Firestore security rules
- [ ] Update Storage security rules
- [ ] Restrict API keys by domain
- [ ] Enable HTTPS only
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Regular dependency updates
- [ ] Security audit

---

## Contributing Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit pull request

### Pull Request Process

1. **Code Quality:**
   - Pass all linting checks
   - Follow code style guidelines
   - Add appropriate comments

2. **Testing:**
   - Add tests for new features
   - Ensure all tests pass
   - Maintain test coverage

3. **Documentation:**
   - Update relevant documentation
   - Add JSDoc comments
   - Update CHANGELOG

4. **Commit Messages:**
   - Use conventional commits
   - Be descriptive and clear
   - Reference issues when applicable

### Code Review

All pull requests require:
- Code review approval
- Passing CI/CD checks
- No merge conflicts
- Updated documentation

---

## License

This project is licensed under the MIT License.

---

## Support & Contact

For issues, questions, or contributions:
- GitHub Issues: [Repository Issues]
- Documentation: This file
- API Setup: See `API_SETUP_GUIDE.md`

---

## Changelog

### Version 1.0.0 (Current)

**Features:**
- Plant management system
- Disease detection with TensorFlow.js
- AI chatbot with Google Gemini
- Weather integration
- Dashboard with analytics
- Smart reminders
- Responsive design

**Tech Stack:**
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Firebase 12.9.0
- TensorFlow.js 4.22.0
- Tailwind CSS 3.4.17

---

## Acknowledgments

- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **TensorFlow.js** - Machine learning
- **Google Gemini** - AI capabilities
- **OpenWeatherMap** - Weather data
- **Firebase** - Backend services
- **Lucide** - Icon library
- **Recharts** - Data visualization

---

*Last Updated: February 2026*
