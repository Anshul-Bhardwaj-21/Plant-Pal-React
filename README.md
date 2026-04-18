# 🌱 PlantPal - AI-Powered Plant Care Assistant

Production-ready plant care app with AI identification, disease detection, and **personalized care calculations**.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: Firebase (Firestore + Storage + Auth)
- **AI**: Google Gemini (Vision + Chat)
- **Weather**: OpenWeatherMap API
- **Charts**: Recharts
- **Camera**: Web Camera API

## Features

✅ **AI Plant Identification** - Gemini Vision API with top 3 predictions  
✅ **Smart Watering Calculator** - Calculates exact ml based on pot size, soil, weather, plant height  
✅ **Kitchen Waste Composting Guide** - What to add/avoid with preparation steps  
✅ **Fertilizer Schedule** - Personalized NPK recommendations with timing  
✅ **Multi-Image Age Estimation** - Analyze full plant, stem, leaves for accurate age  
✅ **Auto Location & Weather** - Geolocation + 7-day forecast with 30min cache  
✅ **Disease Detection** - TensorFlow.js + treatment recommendations  
✅ **Smart Camera** - Proper permission handling, resize to 1024px, JPEG compression  
✅ **Weather-Based Advice** - AI suggestions based on forecast  
✅ **Health Dashboard** - Scores, graphs, care history  
✅ **Gamification** - 7 badges for consistent care  
✅ **AI Chatbot** - Context-aware with plant + weather data  
✅ **Growth Timeline** - Track plant progress with photos  
✅ **Smart Reminders** - Weather-aware watering alerts  

## 🌟 Unique Features

### 1. Intelligent Watering Calculator
Calculates precise watering amount considering:
- Pot size (small to extra-large)
- Soil type (clay, sandy, loamy, peat, chalky)
- Plant height
- Current weather (temperature, humidity, rain)
- Plant type
- Time of day recommendation

**Example Output**: "Water with 650ml every 5 days in the evening"

### 2. Kitchen Waste Composting
Complete guide with:
- ✅ 8 recommended items (banana peels, eggshells, coffee grounds, etc.)
- ❌ 6 items to avoid (meat, dairy, oily food, etc.)
- 📋 7-step preparation guide
- 💡 Benefits and usage instructions for each item

### 3. Multi-Image Age Estimation
Upload 4 types of images:
- Full plant view
- Stem close-up
- Leaves detail
- Roots (optional)

AI analyzes all images for accurate age estimation with confidence score.

### 4. Personalized Fertilizer Schedule
- NPK ratio recommendations by plant type
- Timing based on plant age
- Amount calculations
- Application instructions
- Seasonal adjustments

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

Create `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_WEATHER_API_KEY=your_openweather_key
```

### 3. Run
```bash
npm run dev
```

Open `http://localhost:5173`

## How It Works

### Watering Calculation Pipeline
1. **Base Amount**: Determined by pot size (200ml - 2000ml)
2. **Plant Type Adjustment**: Succulents 0.5x, Vegetables 1.3x, etc.
3. **Soil Adjustment**: Clay retains water (0.8x), Sandy drains fast (1.3x)
4. **Height Factor**: Larger plants need more water
5. **Weather Integration**: Hot weather 1.3x, High humidity 0.8x
6. **Time Recommendation**: Morning/evening based on temperature

### Kitchen Waste Processing
1. User selects plant type
2. System provides customized waste recommendations
3. Shows preparation steps
4. Warns about items to avoid
5. Explains benefits of each ingredient

### Age Estimation Process
1. User uploads multiple plant images
2. AI analyzes foliage density, stem thickness, leaf maturity
3. Combines indicators from all images
4. Calculates age with confidence score
5. Provides detailed reasoning

## API Keys

### OpenWeatherMap
Get key: https://openweathermap.org/api

### Firebase
1. Create project: https://console.firebase.google.com/
2. Enable Firestore, Storage, Auth
3. Copy config to `.env`

## Build

```bash
npm run build
```

Output in `dist/` folder.

## License

MIT
