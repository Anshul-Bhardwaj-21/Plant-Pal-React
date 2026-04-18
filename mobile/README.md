# PlantPal Mobile App

A React Native mobile application built with Expo for plant identification, disease detection, and care tracking.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

## Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to the `.env` file:
   - **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **WEATHER_API_KEY**: Get from [OpenWeatherMap](https://openweathermap.org/api)
   - **FIREBASE_API_KEY**: (Optional, for future use)

## Installation

```bash
npm install
```

## Running the App

Start the development server:
```bash
npx expo start
```

Then choose your platform:
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Press `w` for web browser
- Scan the QR code with Expo Go app on your physical device

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── add-plant.tsx  # Add plant screen
│   │   ├── weather.tsx    # Weather screen
│   │   └── chat.tsx       # Chat screen
│   └── _layout.tsx        # Root layout
├── assets/                # Images, fonts, and other assets
├── components/            # Reusable React components
├── constants/             # App constants and configuration
│   └── config.ts          # Environment variable configuration
├── hooks/                 # Custom React hooks
├── services/              # API services (Gemini AI, Weather)
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── app.config.js          # Expo configuration with env vars
├── app.json               # Expo app manifest
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Features

- 🌱 Plant identification using AI
- 🔍 Disease detection and treatment recommendations
- 📊 Plant health tracking and analytics
- 🌤️ Weather integration for care recommendations
- 💬 AI-powered plant care chatbot
- 🏆 Gamification with badges and achievements
- 📱 Offline support with local storage

## Required Permissions

- **Camera**: For capturing plant photos
- **Photo Library**: For selecting existing plant images
- **Location**: For weather-based care recommendations

## API Keys

This app requires the following API keys:

1. **Gemini API Key** (Required)
   - Used for plant identification, disease detection, and chatbot
   - Get it from: https://makersuite.google.com/app/apikey

2. **Weather API Key** (Required)
   - Used for weather data and care recommendations
   - Get it from: https://openweathermap.org/api

3. **Firebase API Key** (Optional)
   - For future cloud sync features
   - Get it from: https://console.firebase.google.com

## Development

- The app uses **expo-router** for file-based routing
- TypeScript is configured with strict mode
- Path aliases are set up for cleaner imports
- Dark theme with green accents for plant-focused UI

## Troubleshooting

### App won't start
- Make sure all dependencies are installed: `npm install`
- Clear the cache: `npx expo start -c`

### API features not working
- Check that your `.env` file exists and contains valid API keys
- Restart the development server after changing `.env`

### Permission errors
- Make sure you've granted the required permissions in your device settings
- On iOS, check Settings > PlantPal
- On Android, check Settings > Apps > PlantPal > Permissions

## Next Steps

This is the initial project setup. The following features will be implemented:

1. Plant identification with camera integration
2. Disease detection and analysis
3. Local storage with AsyncStorage
4. Weather integration with location services
5. Plant dashboard with health tracking
6. Gamification system with badges
7. AI chatbot for plant care advice

## License

Private - Hackathon Project
