# Services Documentation

This directory contains all service modules for the PlantPal mobile app.

## Available Services

- [StorageService](#storageservice) - AsyncStorage wrapper for data persistence
- [ImageService](#imageservice) - File system operations for plant images
- [PermissionService](#permissionservice) - Device permission management
- [GeminiService](#geminiservice) - AI operations using Google Gemini API

---

# StorageService Documentation

## Overview

The `StorageService` provides a robust wrapper around React Native's AsyncStorage for persisting app data locally. It includes automatic retry logic, error handling, and storage quota management.

## Features

- ✅ JSON serialization/deserialization with error handling
- ✅ Automatic retry logic for failed writes (1 retry with 500ms delay)
- ✅ Storage quota error detection and handling
- ✅ Type-safe operations with TypeScript
- ✅ Graceful error handling (returns empty data on read failures)
- ✅ Cache management utilities

## Installation

The service is already set up and ready to use. Simply import it:

```typescript
import { storageService } from './services/storageService';
// or
import { storageService } from './services';
```

## API Reference

### Core Methods

#### `getPlants(): Promise<Plant[]>`
Retrieves all plants from storage. Returns empty array if read fails.

```typescript
const plants = await storageService.getPlants();
```

#### `savePlants(plants: Plant[]): Promise<void>`
Saves plants to storage. Retries once on failure. Throws error if quota exceeded.

```typescript
await storageService.savePlants(plants);
```

#### `getCareHistory(): Promise<CareAction[]>`
Retrieves care history from storage. Returns empty array if read fails.

```typescript
const history = await storageService.getCareHistory();
```

#### `saveCareHistory(history: CareAction[]): Promise<void>`
Saves care history to storage. Retries once on failure.

```typescript
await storageService.saveCareHistory(history);
```

#### `getBadges(): Promise<Badge[]>`
Retrieves badges from storage. Returns empty array if read fails.

```typescript
const badges = await storageService.getBadges();
```

#### `saveBadges(badges: Badge[]): Promise<void>`
Saves badges to storage. Retries once on failure.

```typescript
await storageService.saveBadges(badges);
```

#### `getHealthSnapshots(): Promise<HealthSnapshot[]>`
Retrieves health snapshots from storage. Returns empty array if read fails.

```typescript
const snapshots = await storageService.getHealthSnapshots();
```

#### `saveHealthSnapshots(snapshots: HealthSnapshot[]): Promise<void>`
Saves health snapshots to storage. Retries once on failure.

```typescript
await storageService.saveHealthSnapshots(snapshots);
```

#### `getChatHistory(): Promise<ChatMessage[]>`
Retrieves chat history from storage. Returns empty array if read fails.

```typescript
const messages = await storageService.getChatHistory();
```

#### `saveChatHistory(messages: ChatMessage[]): Promise<void>`
Saves chat history to storage. Retries once on failure.

```typescript
await storageService.saveChatHistory(messages);
```

#### `getWeatherCache(): Promise<WeatherData | null>`
Retrieves cached weather data. Returns null if no cache exists or read fails.

```typescript
const weather = await storageService.getWeatherCache();
```

#### `saveWeatherCache(data: WeatherData): Promise<void>`
Saves weather data to cache. Retries once on failure.

```typescript
await storageService.saveWeatherCache(weatherData);
```

#### `clearCache(): Promise<void>`
Clears cached data (weather and chat history) to free up storage space.

```typescript
await storageService.clearCache();
```

### Utility Methods

The `storageUtils` export provides additional utilities:

#### `getAllKeys(): Promise<string[]>`
Returns all storage keys used by the app.

```typescript
import { storageUtils } from './services/storageService';
const keys = await storageUtils.getAllKeys();
```

#### `clearAll(): Promise<void>`
⚠️ **Use with caution!** Clears ALL app data from storage.

```typescript
await storageUtils.clearAll();
```

#### `getStorageInfo(): Promise<{ keys: string[], count: number }>`
Returns information about current storage usage.

```typescript
const info = await storageUtils.getStorageInfo();
console.log(`Storage contains ${info.count} keys`);
```

## Error Handling

### Read Operations
Read operations never throw errors. They return empty data structures (empty arrays or null) and log errors to console.

```typescript
// Safe - will return [] if read fails
const plants = await storageService.getPlants();
```

### Write Operations
Write operations can throw errors in two scenarios:

1. **Storage Quota Exceeded**: Throws `"Storage full - please delete old plants or care history"`
2. **Max Retries Reached**: Throws `"Failed to save data"` after 1 retry attempt

```typescript
try {
  await storageService.savePlants(plants);
} catch (error) {
  if (error.message.includes('Storage full')) {
    // Handle quota error - offer to clear cache
    await storageService.clearCache();
  } else {
    // Handle other errors
    console.error('Failed to save:', error);
  }
}
```

## Storage Keys

The service uses the following keys (defined in `STORAGE_KEYS` constant):

- `plants` - Plant collection data
- `care_history` - Care action logs
- `badges` - User badges and achievements
- `health_snapshots` - Daily health score snapshots
- `chat_history` - Chat conversation history
- `weather_cache` - Cached weather data

## Best Practices

### 1. Limit Data Size
Keep care history to 500 entries per plant (Requirement 11.10):

```typescript
const history = await storageService.getCareHistory();
history.push(newAction);

if (history.length > 500) {
  history.shift(); // Remove oldest entry
}

await storageService.saveCareHistory(history);
```

### 2. Cache Validation
Check cache age before using cached data:

```typescript
const cachedWeather = await storageService.getWeatherCache();

if (cachedWeather) {
  const cacheAge = Date.now() - new Date(cachedWeather.timestamp).getTime();
  const thirtyMinutes = 30 * 60 * 1000;
  
  if (cacheAge < thirtyMinutes) {
    // Use cached data
  } else {
    // Fetch fresh data
  }
}
```

### 3. Error Recovery
Always handle storage quota errors gracefully:

```typescript
try {
  await storageService.savePlants(plants);
} catch (error) {
  if (error.message.includes('Storage full')) {
    // Offer user options:
    // 1. Clear cache
    // 2. Delete old plants
    // 3. Delete old care history
  }
}
```

### 4. Batch Operations
When updating multiple related items, do it in sequence:

```typescript
// Update plant and log care action
const plants = await storageService.getPlants();
const plantIndex = plants.findIndex(p => p.id === plantId);
plants[plantIndex].lastWatered = new Date().toISOString();
await storageService.savePlants(plants);

const history = await storageService.getCareHistory();
history.push(careAction);
await storageService.saveCareHistory(history);
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **2.1**: Uses AsyncStorage for all data persistence
- **2.2**: Stores plant collection data with key "plants"
- **2.3**: Stores care history data with key "care_history"
- **2.4**: Stores user badges with key "badges"
- **2.5**: Stores weather cache with key "weather_cache"
- **2.6**: Displays error message and retries once on write failures
- **2.7**: Returns empty data structures and logs errors on read failures
- **2.8**: Serializes complex objects to JSON before storing
- **2.9**: Parses JSON strings when retrieving data
- **17.1**: Displays error message and retries once on AsyncStorage write failures
- **17.2**: Returns empty data and logs errors on AsyncStorage read failures
- **17.3**: Displays appropriate message on quota exceeded errors
- **17.7**: Handles JSON parse errors gracefully

## Testing

See `storageService.example.ts` for usage examples and test scenarios.

## Future Enhancements

Potential improvements for future versions:

- [ ] Add data migration utilities for schema changes
- [ ] Implement data compression for large datasets
- [ ] Add encryption for sensitive data
- [ ] Implement background sync with Firebase
- [ ] Add data export/import functionality


---

# PermissionService Documentation

## Overview

The `PermissionService` provides a unified interface for managing device permissions (camera and location) in the PlantPal mobile app. It handles permission requests, status checks, and provides utilities for opening device settings when permissions are denied.

## Features

- ✅ Camera permission management (expo-camera)
- ✅ Location permission management (expo-location)
- ✅ Permission status type guards
- ✅ Device settings navigation
- ✅ User-friendly error messages
- ✅ Cross-platform support (iOS & Android)
- ✅ Graceful error handling

## Installation

The service is already set up and ready to use. Simply import it:

```typescript
import { permissionService, permissionUtils } from './services/permissionService';
// or
import { permissionService, permissionUtils } from './services';
```

## API Reference

### Core Methods

#### `requestCameraPermission(): Promise<PermissionStatus>`
Requests camera permission from the user. Returns the permission status after the request.

```typescript
const status = await permissionService.requestCameraPermission();
// Returns: 'granted' | 'denied' | 'undetermined'
```

#### `checkCameraPermission(): Promise<PermissionStatus>`
Checks current camera permission status without requesting. Useful for checking before showing UI.

```typescript
const status = await permissionService.checkCameraPermission();
if (status === 'granted') {
  // Open camera
}
```

#### `requestLocationPermission(): Promise<PermissionStatus>`
Requests location permission from the user. Returns the permission status after the request.

```typescript
const status = await permissionService.requestLocationPermission();
// Returns: 'granted' | 'denied' | 'undetermined'
```

#### `checkLocationPermission(): Promise<PermissionStatus>`
Checks current location permission status without requesting.

```typescript
const status = await permissionService.checkLocationPermission();
if (status === 'granted') {
  // Get location
}
```

#### `openSettings(): Promise<void>`
Opens the device settings page where users can manually enable permissions. Useful when permissions are permanently denied.

```typescript
await permissionService.openSettings();
```

### Utility Methods

The `permissionUtils` export provides helpful utilities:

#### `isGranted(status: PermissionStatus): boolean`
Type guard to check if permission is granted.

```typescript
const status = await permissionService.checkCameraPermission();
if (permissionUtils.isGranted(status)) {
  // Permission granted
}
```

#### `isDenied(status: PermissionStatus): boolean`
Type guard to check if permission is denied.

```typescript
if (permissionUtils.isDenied(status)) {
  // Show explanation and settings button
}
```

#### `isUndetermined(status: PermissionStatus): boolean`
Type guard to check if permission hasn't been requested yet.

```typescript
if (permissionUtils.isUndetermined(status)) {
  // First time - show explanation before requesting
}
```

#### `getCameraPermissionMessage(): string`
Returns a user-friendly message explaining why camera permission is needed.

```typescript
const message = permissionUtils.getCameraPermissionMessage();
// "Camera access is needed to capture plant photos for identification and disease detection..."
```

#### `getLocationPermissionMessage(): string`
Returns a user-friendly message explaining why location permission is needed.

```typescript
const message = permissionUtils.getLocationPermissionMessage();
// "Location access is needed to provide accurate weather information..."
```

#### `checkAllPermissions(): Promise<{ camera: PermissionStatus, location: PermissionStatus, allGranted: boolean }>`
Checks both camera and location permissions at once.

```typescript
const result = await permissionUtils.checkAllPermissions();
console.log('Camera:', result.camera);
console.log('Location:', result.location);
console.log('All granted:', result.allGranted);
```

#### `requestAllPermissions(): Promise<{ camera: PermissionStatus, location: PermissionStatus, allGranted: boolean }>`
Requests both camera and location permissions at once. Useful for onboarding.

```typescript
const result = await permissionUtils.requestAllPermissions();
if (result.allGranted) {
  // All permissions granted - proceed to main app
}
```

## Usage Examples

### Example 1: Request Camera Permission Before Opening Camera

```typescript
import { Alert } from 'react-native';
import { permissionService, permissionUtils } from './services/permissionService';

const openCamera = async () => {
  // Check current status
  const currentStatus = await permissionService.checkCameraPermission();
  
  if (permissionUtils.isGranted(currentStatus)) {
    // Already granted - open camera
    return true;
  }
  
  // Request permission
  const status = await permissionService.requestCameraPermission();
  
  if (permissionUtils.isGranted(status)) {
    // Permission granted - open camera
    return true;
  } else {
    // Permission denied - show explanation
    Alert.alert(
      'Camera Permission Required',
      permissionUtils.getCameraPermissionMessage(),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => permissionService.openSettings(),
        },
      ]
    );
    return false;
  }
};
```

### Example 2: Request Location Permission for Weather

```typescript
const getWeather = async () => {
  const status = await permissionService.requestLocationPermission();
  
  if (permissionUtils.isGranted(status)) {
    // Get location and fetch weather
    return true;
  } else {
    // Offer manual city entry as alternative
    Alert.alert(
      'Location Permission Required',
      permissionUtils.getLocationPermissionMessage(),
      [
        { text: 'Enter City Manually', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => permissionService.openSettings(),
        },
      ]
    );
    return false;
  }
};
```

### Example 3: React Component with Permission Handling

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { permissionService, permissionUtils } from '../services/permissionService';

export const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await permissionService.checkCameraPermission();
    setHasPermission(permissionUtils.isGranted(status));
    setIsLoading(false);
  };

  const requestPermission = async () => {
    const status = await permissionService.requestCameraPermission();
    
    if (permissionUtils.isGranted(status)) {
      setHasPermission(true);
    } else {
      Alert.alert(
        'Camera Permission Required',
        permissionUtils.getCameraPermissionMessage(),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => permissionService.openSettings(),
          },
        ]
      );
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!hasPermission) {
    return (
      <View>
        <Text>Camera permission is required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View>
      <Text>Camera is ready!</Text>
      {/* Camera component here */}
    </View>
  );
};
```

### Example 4: Onboarding Flow with All Permissions

```typescript
const onboardingFlow = async () => {
  const result = await permissionUtils.requestAllPermissions();
  
  if (result.allGranted) {
    // All permissions granted - proceed to main app
    navigation.navigate('Home');
  } else {
    // Show which permissions are missing
    const missing = [];
    if (!permissionUtils.isGranted(result.camera)) {
      missing.push('Camera');
    }
    if (!permissionUtils.isGranted(result.location)) {
      missing.push('Location');
    }
    
    Alert.alert(
      'Permissions Required',
      `The following permissions are needed: ${missing.join(', ')}`,
      [
        { text: 'Skip', onPress: () => navigation.navigate('Home') },
        {
          text: 'Open Settings',
          onPress: () => permissionService.openSettings(),
        },
      ]
    );
  }
};
```

## Permission Status Types

The service uses a simple `PermissionStatus` type:

```typescript
type PermissionStatus = 'granted' | 'denied' | 'undetermined';
```

- **granted**: User has granted permission
- **denied**: User has denied permission (may be permanent)
- **undetermined**: Permission hasn't been requested yet

## Error Handling

The service handles errors gracefully:

- **Request failures**: Returns `'denied'` status instead of throwing
- **Check failures**: Returns `'undetermined'` status instead of throwing
- **Settings open failures**: Tries fallback methods before throwing

All errors are logged to console for debugging.

```typescript
// Safe - never throws
const status = await permissionService.checkCameraPermission();

// Safe - returns 'denied' on error
const status = await permissionService.requestCameraPermission();

// May throw if all methods fail
try {
  await permissionService.openSettings();
} catch (error) {
  console.error('Could not open settings:', error);
}
```

## Platform Differences

### iOS
- Denied permission is permanent until user manually enables in settings
- Settings URL: `app-settings:`

### Android
- Can request permission multiple times
- Settings URL: `android.settings.APPLICATION_DETAILS_SETTINGS`

The service handles these differences automatically.

## Best Practices

### 1. Check Before Requesting
Always check permission status before requesting to avoid unnecessary prompts:

```typescript
const status = await permissionService.checkCameraPermission();
if (!permissionUtils.isGranted(status)) {
  // Show explanation first
  await permissionService.requestCameraPermission();
}
```

### 2. Provide Context
Always explain why you need the permission before requesting:

```typescript
Alert.alert(
  'Camera Access',
  'We need camera access to identify your plants',
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'OK',
      onPress: async () => {
        await permissionService.requestCameraPermission();
      },
    },
  ]
);
```

### 3. Offer Alternatives
When permission is denied, offer alternative ways to use the app:

```typescript
if (permissionUtils.isDenied(locationStatus)) {
  // Offer manual city entry instead of location
  showManualCityInput();
}

if (permissionUtils.isDenied(cameraStatus)) {
  // Offer gallery picker instead of camera
  await imageService.selectFromGallery();
}
```

### 4. Handle Settings Navigation
Always provide a way to open settings when permission is permanently denied:

```typescript
Alert.alert(
  'Permission Required',
  permissionUtils.getCameraPermissionMessage(),
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Open Settings',
      onPress: () => permissionService.openSettings(),
    },
  ]
);
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **3.2**: Requests camera permissions when user opens camera
- **3.3**: Displays message and settings button when camera permission denied
- **7.2**: Requests location permissions when app starts
- **7.3**: Displays message and allows manual city entry when location denied
- **14.1**: Displays modal explaining why camera access is needed
- **14.2**: Provides button to open device settings
- **14.4**: Displays modal explaining why location access is needed
- **14.5**: Provides button to open device settings
- **14.7**: Checks permission status before attempting to use camera or location
- **14.8**: Handles "never ask again" permission status appropriately

## Testing

See `permissionService.example.ts` for comprehensive usage examples and test scenarios.

## Related Services

- **ImageService**: Uses camera permissions for capturing photos
- **WeatherService**: Uses location permissions for weather data

## Future Enhancements

Potential improvements for future versions:

- [ ] Add photo library permission management
- [ ] Add notification permission management
- [ ] Add permission request queue for better UX
- [ ] Add analytics for permission grant/deny rates
- [ ] Add A/B testing for permission request timing


---

# GeminiService Documentation

## Overview

The `GeminiService` provides AI-powered functionality for plant identification, disease detection, and chatbot interactions using Google's Gemini API (gemini-2.0-flash-exp model). It includes comprehensive error handling, timeout management, and user-friendly error messages.

## Features

- ✅ Plant identification from images (top 3 predictions)
- ✅ Disease detection with treatment recommendations
- ✅ Context-aware chatbot for plant care advice
- ✅ 30-second timeout for all requests
- ✅ Comprehensive error handling (401, 429, 500 status codes)
- ✅ Network error detection
- ✅ User-friendly error messages
- ✅ API key validation
- ✅ Image processing and base64 conversion

## Installation

The service is already set up and ready to use. Simply import it:

```typescript
import { geminiService, geminiUtils } from './services/geminiService';
// or
import { geminiService, geminiUtils } from './services';
```

## Configuration

### Environment Variables

The service requires a Gemini API key to be configured in your environment:

1. Add your API key to `mobile/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

2. Or configure it in `app.json` under `extra`:
```json
{
  "expo": {
    "extra": {
      "GEMINI_API_KEY": "your_api_key_here"
    }
  }
}
```

### Get an API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## API Reference

### Core Methods

#### `identifyPlant(imageUri: string): Promise<PlantIdentificationResult>`
Identifies a plant from an image and returns the top 3 predictions with care requirements.

**Parameters:**
- `imageUri` - Local file URI of the plant image

**Returns:**
```typescript
{
  predictions: [
    {
      scientificName: string;
      commonName: string;
      type: string;
      confidence: number; // 0-1
      careRequirements?: {
        wateringFrequency: number; // days
        sunlight: 'low' | 'medium' | 'high';
        notes?: string;
      };
    }
  ]
}
```

**Example:**
```typescript
try {
  const result = await geminiService.identifyPlant('file:///path/to/image.jpg');
  
  const topPrediction = result.predictions[0];
  console.log(`Identified as: ${topPrediction.commonName}`);
  console.log(`Confidence: ${(topPrediction.confidence * 100).toFixed(1)}%`);
  console.log(`Water every ${topPrediction.careRequirements?.wateringFrequency} days`);
} catch (error) {
  console.error('Identification failed:', error.message);
}
```

#### `detectDisease(imageUri: string): Promise<DiseaseDetectionResult>`
Analyzes a plant image for diseases and provides treatment recommendations.

**Parameters:**
- `imageUri` - Local file URI of the plant image

**Returns:**
```typescript
{
  isHealthy: boolean;
  disease?: {
    name: string;
    confidence: number; // 0-1
    symptoms: string;
    causes: string;
    treatment: string;
  };
}
```

**Example:**
```typescript
try {
  const result = await geminiService.detectDisease('file:///path/to/image.jpg');
  
  if (result.isHealthy) {
    console.log('Plant appears healthy!');
  } else if (result.disease) {
    console.log(`Disease detected: ${result.disease.name}`);
    console.log(`Treatment: ${result.disease.treatment}`);
  }
} catch (error) {
  console.error('Disease detection failed:', error.message);
}
```

#### `chat(message: string, context: ChatContext): Promise<string>`
Sends a message to the AI chatbot with context about user's plants and weather.

**Parameters:**
- `message` - User's question or message
- `context` - Context object containing:
  - `plants` - Array of user's plants
  - `weather` - Current weather data (optional)
  - `conversationHistory` - Previous messages (last 5 used)

**Returns:**
- AI assistant's response as a string

**Example:**
```typescript
const context: ChatContext = {
  plants: [
    {
      id: '1',
      name: 'My Succulent',
      type: 'Succulent',
      healthScore: 85,
      careScore: 90,
      lastWatered: '2024-01-15T10:00:00Z',
      wateringFrequency: 7,
      sunlight: 'high',
      age: 30,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  weather: {
    temperature: 22,
    humidity: 65,
    windSpeed: 5,
    conditions: 'Partly Cloudy',
    icon: '02d',
    location: 'San Francisco',
    timestamp: '2024-01-15T12:00:00Z',
  },
  conversationHistory: [],
};

try {
  const response = await geminiService.chat(
    'How often should I water my succulent?',
    context
  );
  console.log('AI:', response);
} catch (error) {
  console.error('Chat failed:', error.message);
}
```

### Utility Methods

The `geminiUtils` export provides helpful utilities:

#### `validateApiKey(): boolean`
Checks if the Gemini API key is configured.

```typescript
if (geminiUtils.validateApiKey()) {
  console.log('API key is configured');
} else {
  console.log('API key is missing');
}
```

#### `getConfigStatus(): { configured: boolean, error?: string }`
Returns detailed configuration status.

```typescript
const status = geminiUtils.getConfigStatus();
if (!status.configured) {
  console.error('Configuration error:', status.error);
}
```

#### `resetClient(): void`
Resets the Gemini client (useful for testing or re-initialization).

```typescript
geminiUtils.resetClient();
```

## Error Handling

The service provides comprehensive error handling with user-friendly messages:

### Error Types

All errors are instances of `GeminiApiError` with the following properties:
- `message` - User-friendly error message
- `code` - Error code (ApiErrorCode)
- `statusCode` - HTTP status code (if applicable)

### Error Codes

```typescript
type ApiErrorCode = 
  | 'NETWORK_ERROR'        // No internet connection
  | 'API_UNAUTHORIZED'     // Invalid API key (401)
  | 'API_RATE_LIMIT'       // Rate limit exceeded (429)
  | 'API_SERVER_ERROR'     // Server error (500+)
  | 'API_TIMEOUT'          // Request timed out (30s)
  | 'API_NOT_CONFIGURED'   // Missing API key
  | 'UNKNOWN_ERROR';       // Other errors
```

### Error Messages

The service provides user-friendly error messages:

| Error Code | User Message |
|------------|--------------|
| `NETWORK_ERROR` | "No internet connection - please check your network" |
| `API_UNAUTHORIZED` | "AI service authentication failed - check API key" |
| `API_RATE_LIMIT` | "AI service rate limit exceeded - please try again later" |
| `API_SERVER_ERROR` | "AI service temporarily unavailable - please try again" |
| `API_TIMEOUT` | "Request timed out - please try again" |
| `API_NOT_CONFIGURED` | "AI service not configured - missing API key" |
| `UNKNOWN_ERROR` | "AI service error - please try again" |

### Handling Errors

```typescript
try {
  const result = await geminiService.identifyPlant(imageUri);
} catch (error: any) {
  // Check error code
  switch (error.code) {
    case 'NETWORK_ERROR':
      // Show offline message, disable AI features
      showOfflineMessage();
      break;
    
    case 'API_UNAUTHORIZED':
      // Show configuration error
      showConfigError();
      break;
    
    case 'API_RATE_LIMIT':
      // Show rate limit message, suggest retry later
      showRateLimitMessage();
      break;
    
    case 'API_SERVER_ERROR':
      // Show temporary error, offer retry
      showRetryButton();
      break;
    
    case 'API_TIMEOUT':
      // Show timeout message, offer retry
      showTimeoutMessage();
      break;
    
    case 'API_NOT_CONFIGURED':
      // Show setup instructions
      showSetupInstructions();
      break;
    
    default:
      // Show generic error
      showGenericError(error.message);
  }
}
```

## Usage Examples

### Example 1: Complete Plant Identification Flow

```typescript
import { geminiService, geminiUtils } from './services/geminiService';
import { imageService } from './services/imageService';

const identifyPlantFlow = async (imageUri: string) => {
  // Step 1: Validate API configuration
  if (!geminiUtils.validateApiKey()) {
    Alert.alert('Setup Required', 'Please configure your Gemini API key');
    return;
  }

  // Step 2: Show loading indicator
  setLoading(true);

  try {
    // Step 3: Identify plant
    const result = await geminiService.identifyPlant(imageUri);
    
    // Step 4: Display results
    const predictions = result.predictions.map((p, index) => ({
      rank: index + 1,
      name: p.commonName,
      scientificName: p.scientificName,
      type: p.type,
      confidence: `${(p.confidence * 100).toFixed(1)}%`,
      wateringFrequency: p.careRequirements?.wateringFrequency,
      sunlight: p.careRequirements?.sunlight,
    }));
    
    // Step 5: Let user select or enter custom name
    showPredictions(predictions);
    
  } catch (error: any) {
    // Step 6: Handle errors
    if (error.code === 'NETWORK_ERROR') {
      Alert.alert(
        'No Internet',
        'Plant identification requires an internet connection',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', error.message, [
        { text: 'Cancel' },
        { text: 'Retry', onPress: () => identifyPlantFlow(imageUri) },
      ]);
    }
  } finally {
    setLoading(false);
  }
};
```

### Example 2: Disease Detection with Care History

```typescript
const detectDiseaseFlow = async (plantId: string, imageUri: string) => {
  setScanning(true);

  try {
    // Detect disease
    const result = await geminiService.detectDisease(imageUri);
    
    // Create care action
    const careAction: CareAction = {
      id: uuid.v4(),
      plantId,
      type: 'disease_check',
      timestamp: new Date().toISOString(),
      metadata: {
        isHealthy: result.isHealthy,
        diseaseName: result.disease?.name,
        confidence: result.disease?.confidence,
        symptoms: result.disease?.symptoms,
        causes: result.disease?.causes,
        treatment: result.disease?.treatment,
      },
    };
    
    // Save to care history
    const history = await storageService.getCareHistory();
    history.push(careAction);
    await storageService.saveCareHistory(history);
    
    // Update plant disease status
    if (!result.isHealthy && result.disease) {
      const plants = await storageService.getPlants();
      const plant = plants.find(p => p.id === plantId);
      if (plant) {
        plant.diseaseStatus = {
          hasDisease: true,
          diseaseName: result.disease.name,
          detectedAt: new Date().toISOString(),
          treated: false,
        };
        // Decrease health score by 20
        plant.healthScore = Math.max(0, plant.healthScore - 20);
        await storageService.savePlants(plants);
      }
    }
    
    // Show results
    if (result.isHealthy) {
      Alert.alert('Good News!', 'Your plant appears healthy! 🌱');
    } else if (result.disease) {
      Alert.alert(
        `Disease Detected: ${result.disease.name}`,
        `Confidence: ${(result.disease.confidence * 100).toFixed(1)}%\n\n` +
        `Symptoms: ${result.disease.symptoms}\n\n` +
        `Treatment: ${result.disease.treatment}`,
        [{ text: 'OK' }]
      );
    }
    
  } catch (error: any) {
    Alert.alert('Scan Failed', error.message);
  } finally {
    setScanning(false);
  }
};
```

### Example 3: Context-Aware Chatbot

```typescript
const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: uuid.v4(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Load context
      const plants = await storageService.getPlants();
      const weather = await storageService.getWeatherCache();
      
      // Build context
      const context: ChatContext = {
        plants,
        weather: weather || undefined,
        conversationHistory: messages,
      };
      
      // Get AI response
      const response = await geminiService.chat(inputText, context);
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: uuid.v4(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save chat history
      const updatedMessages = [...messages, userMessage, assistantMessage];
      await storageService.saveChatHistory(updatedMessages);
      
    } catch (error: any) {
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: uuid.v4(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={item} />
        )}
      />
      {isTyping && <TypingIndicator />}
      <TextInput
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={sendMessage}
      />
    </View>
  );
};
```

### Example 4: Error Handling with Retry Logic

```typescript
const identifyWithRetry = async (
  imageUri: string,
  maxRetries = 2
): Promise<PlantIdentificationResult | null> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await geminiService.identifyPlant(imageUri);
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error.code === 'API_NOT_CONFIGURED' ||
        error.code === 'API_UNAUTHORIZED'
      ) {
        throw error;
      }
      
      // Retry on network or server errors
      if (
        error.code === 'NETWORK_ERROR' ||
        error.code === 'API_SERVER_ERROR' ||
        error.code === 'API_TIMEOUT'
      ) {
        if (attempt < maxRetries) {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError;
};
```

## Best Practices

### 1. Validate Configuration on Startup

```typescript
useEffect(() => {
  const status = geminiUtils.getConfigStatus();
  if (!status.configured) {
    Alert.alert(
      'Setup Required',
      'Please add your Gemini API key to continue using AI features'
    );
  }
}, []);
```

### 2. Show Loading Indicators

```typescript
const [isIdentifying, setIsIdentifying] = useState(false);

const identify = async (imageUri: string) => {
  setIsIdentifying(true);
  try {
    const result = await geminiService.identifyPlant(imageUri);
    // Handle result
  } finally {
    setIsIdentifying(false);
  }
};
```

### 3. Provide Retry Options

```typescript
const handleError = (error: any, retryFn: () => void) => {
  Alert.alert(
    'Error',
    error.message,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: retryFn },
    ]
  );
};
```

### 4. Cache Results When Appropriate

```typescript
// Cache plant identification results
const identificationCache = new Map<string, PlantIdentificationResult>();

const identifyWithCache = async (imageUri: string) => {
  const cached = identificationCache.get(imageUri);
  if (cached) return cached;
  
  const result = await geminiService.identifyPlant(imageUri);
  identificationCache.set(imageUri, result);
  return result;
};
```

### 5. Limit Conversation History

```typescript
// Keep only last 10 messages for context
const context: ChatContext = {
  plants,
  weather,
  conversationHistory: messages.slice(-10),
};
```

## Performance Considerations

### Timeout Management
- All requests have a 30-second timeout
- Timeout errors are caught and converted to user-friendly messages
- Consider showing a progress indicator for long-running requests

### Image Processing
- Images are converted to base64 before sending
- Large images may take time to process
- Consider compressing images before identification (use ImageService)

### Rate Limiting
- Gemini API has rate limits
- Handle 429 errors gracefully
- Consider implementing request queuing for multiple rapid requests

## Requirements Coverage

This implementation satisfies the following requirements:

**Plant Identification (4.x):**
- **4.1**: Uses @google/generative-ai with gemini-2.0-flash-exp model
- **4.2**: Reads GEMINI_API_KEY from environment variables
- **4.3**: Sends image to Gemini AI with identification prompt
- **4.4**: Requests scientific name, common name, type, care requirements, confidence
- **4.8**: Displays "AI service not configured" when API key missing
- **4.9**: Includes 30-second timeout for requests
- **4.10**: Displays loading indicator (handled by caller)

**Disease Detection (5.x):**
- **5.1**: Uses Gemini AI for disease analysis
- **5.2**: Sends image with disease analysis prompt
- **5.3**: Requests disease name, confidence, symptoms, causes, treatment
- **5.8**: Displays error messages for network/API failures
- **5.9**: Includes 30-second timeout for requests

**Chatbot (6.x):**
- **6.2**: Sends messages with context about plants and weather
- **6.8**: Includes 30-second timeout for requests

**Error Handling (16.x):**
- **16.1**: Displays "AI service authentication failed" for 401 errors
- **16.2**: Displays "AI service rate limit exceeded" for 429 errors
- **16.3**: Displays "AI service temporarily unavailable" for 500 errors

## Testing

See `geminiService.example.ts` for comprehensive usage examples and test scenarios.

## Troubleshooting

### "AI service not configured"
- Check that GEMINI_API_KEY is set in `.env` file
- Verify the API key is valid
- Restart the Expo development server

### "AI service authentication failed"
- API key is invalid or expired
- Get a new API key from Google AI Studio
- Update `.env` file and restart

### "Request timed out"
- Network is slow or unstable
- Image is too large (compress before sending)
- Try again with better network connection

### "AI service rate limit exceeded"
- Too many requests in short time
- Wait a few minutes before retrying
- Consider implementing request queuing

## Related Services

- **ImageService**: Processes images before sending to Gemini
- **StorageService**: Stores chat history and care actions
- **WeatherService**: Provides weather context for chatbot

## Future Enhancements

Potential improvements for future versions:

- [ ] Add request caching to reduce API calls
- [ ] Implement request queue for rate limit management
- [ ] Add streaming responses for chat
- [ ] Support multiple image analysis
- [ ] Add plant care reminders based on AI recommendations
- [ ] Implement offline mode with cached responses


---

# WeatherService Documentation

## Overview

The `WeatherService` provides weather data integration using the OpenWeatherMap API. It fetches current weather and 7-day forecasts with intelligent caching (30-minute expiry) to reduce API calls and provide offline fallback data.

## Features

- ✅ Current weather data (temperature, humidity, wind speed, conditions)
- ✅ 7-day weather forecast
- ✅ 30-minute caching to reduce API calls
- ✅ 15-second timeout for all requests
- ✅ Comprehensive error handling (401, 429, 500 status codes)
- ✅ Network error detection
- ✅ User-friendly error messages
- ✅ API key validation
- ✅ Offline support with cached data

## Installation

The service is already set up and ready to use. Simply import it:

```typescript
import { weatherService, weatherUtils } from './services/weatherService';
// or
import { weatherService, weatherUtils } from './services';
```

## Configuration

### Environment Variables

The service requires an OpenWeatherMap API key to be configured in your environment:

1. Add your API key to `mobile/.env`:
```env
WEATHER_API_KEY=your_api_key_here
```

2. Or configure it in `app.json` under `extra`:
```json
{
  "expo": {
    "extra": {
      "WEATHER_API_KEY": "your_api_key_here"
    }
  }
}
```

### Get an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

## API Reference

### Core Methods

#### `getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData>`
Fetches current weather data for the given coordinates. Automatically caches the result for 30 minutes.

**Parameters:**
- `latitude` - Geographic latitude
- `longitude` - Geographic longitude

**Returns:**
```typescript
{
  temperature: number;      // Celsius
  humidity: number;         // Percentage
  windSpeed: number;        // m/s
  conditions: string;       // e.g., "Clear", "Cloudy", "Rainy"
  icon: string;            // Weather icon code
  location: string;        // Location name
  timestamp: string;       // ISO 8601 format
}
```

**Example:**
```typescript
try {
  const weather = await weatherService.getCurrentWeather(37.7749, -122.4194);
  
  console.log(`Temperature: ${weather.temperature}°C`);
  console.log(`Humidity: ${weather.humidity}%`);
  console.log(`Conditions: ${weather.conditions}`);
} catch (error) {
  console.error('Failed to get weather:', error.message);
}
```

#### `getForecast(latitude: number, longitude: number): Promise<WeatherForecast>`
Fetches 7-day weather forecast for the given coordinates.

**Parameters:**
- `latitude` - Geographic latitude
- `longitude` - Geographic longitude

**Returns:**
```typescript
{
  daily: [
    {
      date: string;          // YYYY-MM-DD
      tempHigh: number;      // Celsius
      tempLow: number;       // Celsius
      conditions: string;    // e.g., "Clear", "Cloudy"
      icon: string;         // Weather icon code
      humidity: number;     // Percentage
    }
  ]
}
```

**Example:**
```typescript
try {
  const forecast = await weatherService.getForecast(37.7749, -122.4194);
  
  forecast.daily.forEach(day => {
    console.log(`${day.date}: ${day.tempLow}°C - ${day.tempHigh}°C, ${day.conditions}`);
  });
} catch (error) {
  console.error('Failed to get forecast:', error.message);
}
```

#### `getCachedWeather(): Promise<WeatherData | null>`
Retrieves cached weather data if available and still valid (less than 30 minutes old).

**Returns:**
- `WeatherData` if cache is valid
- `null` if cache is expired or doesn't exist

**Example:**
```typescript
const cachedWeather = await weatherService.getCachedWeather();

if (cachedWeather) {
  console.log('Using cached weather data');
  displayWeather(cachedWeather);
} else {
  console.log('Cache expired, fetching fresh data');
  const weather = await weatherService.getCurrentWeather(lat, lon);
  displayWeather(weather);
}
```

#### `cacheWeather(data: WeatherData): Promise<void>`
Manually caches weather data. This is automatically called by `getCurrentWeather()`, but can be used to cache data from other sources.

**Parameters:**
- `data` - Weather data to cache

**Example:**
```typescript
await weatherService.cacheWeather(weatherData);
```

### Utility Methods

The `weatherUtils` export provides helpful utilities:

#### `validateApiKey(): boolean`
Checks if the OpenWeatherMap API key is configured.

```typescript
if (weatherUtils.validateApiKey()) {
  console.log('API key is configured');
} else {
  console.log('API key is missing');
}
```

#### `getConfigStatus(): { configured: boolean, error?: string }`
Returns detailed configuration status.

```typescript
const status = weatherUtils.getConfigStatus();
if (!status.configured) {
  console.error('Configuration error:', status.error);
}
```

#### `isCacheValid(cachedData: WeatherData | null): boolean`
Checks if cached weather data is still valid (less than 30 minutes old).

```typescript
const cached = await weatherService.getCachedWeather();
if (weatherUtils.isCacheValid(cached)) {
  console.log('Cache is valid');
}
```

#### `getCacheDuration(): number`
Returns the cache duration in milliseconds (30 minutes).

```typescript
const duration = weatherUtils.getCacheDuration();
console.log(`Cache duration: ${duration / 60000} minutes`);
```

## Error Handling

The service provides comprehensive error handling with user-friendly messages:

### Error Types

All errors are instances of `WeatherApiError` with the following properties:
- `message` - User-friendly error message
- `code` - Error code (ApiErrorCode)
- `statusCode` - HTTP status code (if applicable)

### Error Codes

```typescript
type ApiErrorCode = 
  | 'NETWORK_ERROR'        // No internet connection
  | 'API_UNAUTHORIZED'     // Invalid API key (401)
  | 'API_RATE_LIMIT'       // Rate limit exceeded (429)
  | 'API_SERVER_ERROR'     // Server error (500+)
  | 'API_TIMEOUT'          // Request timed out (15s)
  | 'API_NOT_CONFIGURED'   // Missing API key
  | 'UNKNOWN_ERROR';       // Other errors
```

### Error Messages

The service provides user-friendly error messages:

| Error Code | User Message |
|------------|--------------|
| `NETWORK_ERROR` | "No internet connection - please check your network" |
| `API_UNAUTHORIZED` | "Weather service authentication failed - check API key" |
| `API_RATE_LIMIT` | "Weather service rate limit exceeded - please try again later" |
| `API_SERVER_ERROR` | "Weather service temporarily unavailable - please try again" |
| `API_TIMEOUT` | "Request timed out - please try again" |
| `API_NOT_CONFIGURED` | "Weather service not configured - missing API key" |
| `UNKNOWN_ERROR` | "Weather service error - please try again" |

### Handling Errors

```typescript
try {
  const weather = await weatherService.getCurrentWeather(lat, lon);
} catch (error: any) {
  // Check error code
  switch (error.code) {
    case 'NETWORK_ERROR':
      // Try to use cached data
      const cached = await weatherService.getCachedWeather();
      if (cached) {
        displayWeather(cached);
        showMessage('Using cached weather data');
      } else {
        showMessage('No internet connection');
      }
      break;
    
    case 'API_UNAUTHORIZED':
      // Show configuration error
      showConfigError();
      break;
    
    case 'API_RATE_LIMIT':
      // Show rate limit message
      showMessage('Too many requests, please try again later');
      break;
    
    case 'API_SERVER_ERROR':
      // Show temporary error, offer retry
      showRetryButton();
      break;
    
    case 'API_TIMEOUT':
      // Show timeout message
      showMessage('Request timed out, please try again');
      break;
    
    case 'API_NOT_CONFIGURED':
      // Show setup instructions
      showSetupInstructions();
      break;
    
    default:
      // Show generic error
      showGenericError(error.message);
  }
}
```

## Usage Examples

### Example 1: Get Weather with Caching

```typescript
import { weatherService } from './services/weatherService';

const getWeatherWithCache = async (latitude: number, longitude: number) => {
  // First, try to get cached weather
  const cachedWeather = await weatherService.getCachedWeather();
  
  if (cachedWeather) {
    console.log('Using cached weather data');
    return cachedWeather;
  }

  // If no valid cache, fetch fresh data
  console.log('Fetching fresh weather data');
  const weather = await weatherService.getCurrentWeather(latitude, longitude);
  
  return weather;
};
```

### Example 2: Weather Dashboard Component

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { weatherService } from '../services/weatherService';
import * as Location from 'expo-location';

export const WeatherDashboard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Try cached weather first
      const cached = await weatherService.getCachedWeather();
      if (cached) {
        setWeather(cached);
      }

      // Fetch fresh weather and forecast
      const [weatherData, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getForecast(latitude, longitude),
      ]);

      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err: any) {
      setError(err.message);
      
      // Try to use cached data on error
      const cached = await weatherService.getCachedWeather();
      if (cached) {
        setWeather(cached);
        setError('Using cached weather data (offline)');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error && !weather) {
    return (
      <View>
        <Text>Error: {error}</Text>
        <Button title="Retry" onPress={loadWeather} />
      </View>
    );
  }

  return (
    <View>
      {error && <Text style={{ color: 'orange' }}>{error}</Text>}
      
      {weather && (
        <View>
          <Text>Location: {weather.location}</Text>
          <Text>Temperature: {weather.temperature}°C</Text>
          <Text>Humidity: {weather.humidity}%</Text>
          <Text>Wind: {weather.windSpeed} m/s</Text>
          <Text>Conditions: {weather.conditions}</Text>
        </View>
      )}

      {forecast && (
        <View>
          <Text>7-Day Forecast:</Text>
          {forecast.daily.map(day => (
            <View key={day.date}>
              <Text>
                {day.date}: {day.tempLow}°C - {day.tempHigh}°C, {day.conditions}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Button title="Refresh" onPress={loadWeather} />
    </View>
  );
};
```

### Example 3: Offline Support

```typescript
const getWeatherOfflineSupport = async (lat: number, lon: number) => {
  try {
    // Try to fetch fresh weather
    const weather = await weatherService.getCurrentWeather(lat, lon);
    return { weather, source: 'live' };
  } catch (error: any) {
    if (error.code === 'NETWORK_ERROR') {
      // Network error - try cached data
      const cached = await weatherService.getCachedWeather();
      if (cached) {
        return { weather: cached, source: 'cached' };
      }
      throw new Error('No internet connection and no cached data available');
    }
    throw error;
  }
};

// Usage
const result = await getWeatherOfflineSupport(37.7749, -122.4194);
if (result.source === 'cached') {
  console.log('⚠️ Using cached weather data (offline)');
}
displayWeather(result.weather);
```

### Example 4: Weather Context for Chatbot

```typescript
const getChatContext = async (): Promise<ChatContext> => {
  const plants = await storageService.getPlants();
  
  // Try to get weather for context
  let weather: WeatherData | undefined;
  try {
    const cached = await weatherService.getCachedWeather();
    weather = cached || undefined;
  } catch (error) {
    console.log('Weather not available for chat context');
  }

  return {
    plants,
    weather,
    conversationHistory: [],
  };
};
```

### Example 5: Pull-to-Refresh Weather

```typescript
import { RefreshControl, ScrollView } from 'react-native';

const WeatherScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const weatherData = await weatherService.getCurrentWeather(
        latitude,
        longitude
      );
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to refresh weather:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Weather content */}
    </ScrollView>
  );
};
```

### Example 6: Display Weather Icons

```typescript
const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

const WeatherIcon = ({ iconCode }: { iconCode: string }) => {
  return (
    <Image
      source={{ uri: getWeatherIconUrl(iconCode) }}
      style={{ width: 50, height: 50 }}
    />
  );
};

// Usage
<WeatherIcon iconCode={weather.icon} />
```

## Best Practices

### 1. Always Check Cache First

```typescript
// Good - check cache first
const cached = await weatherService.getCachedWeather();
if (cached) {
  displayWeather(cached);
}

// Then fetch fresh data in background
const fresh = await weatherService.getCurrentWeather(lat, lon);
displayWeather(fresh);
```

### 2. Handle Offline Gracefully

```typescript
try {
  const weather = await weatherService.getCurrentWeather(lat, lon);
  displayWeather(weather);
} catch (error: any) {
  if (error.code === 'NETWORK_ERROR') {
    const cached = await weatherService.getCachedWeather();
    if (cached) {
      displayWeather(cached);
      showBanner('Using cached weather data');
    } else {
      showOfflineMessage();
    }
  }
}
```

### 3. Validate Configuration on Startup

```typescript
useEffect(() => {
  const status = weatherUtils.getConfigStatus();
  if (!status.configured) {
    Alert.alert(
      'Setup Required',
      'Please add your OpenWeatherMap API key to use weather features'
    );
  }
}, []);
```

### 4. Show Cache Age

```typescript
const displayWeatherWithAge = (weather: WeatherData) => {
  const cacheAge = Date.now() - new Date(weather.timestamp).getTime();
  const minutesOld = Math.floor(cacheAge / 60000);
  
  if (minutesOld > 0) {
    console.log(`Weather data is ${minutesOld} minutes old`);
  }
};
```

### 5. Implement Retry Logic

```typescript
const getWeatherWithRetry = async (
  lat: number,
  lon: number,
  maxRetries = 2
): Promise<WeatherData> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await weatherService.getCurrentWeather(lat, lon);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error.code === 'API_NOT_CONFIGURED' ||
        error.code === 'API_UNAUTHORIZED'
      ) {
        throw error;
      }
      
      // Retry on network or server errors
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }
  
  throw lastError;
};
```

## Performance Considerations

### Caching Strategy
- Weather data is cached for 30 minutes
- Always check cache before making API requests
- Cache is automatically updated on successful API calls
- Cache survives app restarts (stored in AsyncStorage)

### API Rate Limits
- OpenWeatherMap free tier: 60 calls/minute, 1,000,000 calls/month
- Caching reduces API calls significantly
- Handle 429 errors gracefully

### Timeout Management
- All requests have a 15-second timeout
- Shorter than Gemini's 30s to fail fast for weather
- Consider showing cached data immediately while fetching fresh data

## Requirements Coverage

This implementation satisfies the following requirements:

**Weather Integration (7.x):**
- **7.5**: Uses OpenWeatherMap API to fetch weather data
- **7.6**: Reads WEATHER_API_KEY from environment variables
- **7.7**: Displays current weather (temperature, humidity, wind speed, conditions)
- **7.8**: Displays 7-day weather forecast
- **7.9**: Caches weather data for 30 minutes
- **7.10**: Displays "No internet connection" and shows cached data when available
- **7.11**: Displays "Weather service temporarily unavailable" for API errors
- **7.12**: Displays "Weather service not configured" when API key missing
- **7.13**: Includes 15-second timeout for weather API requests

**Error Handling (16.x):**
- **16.4**: Displays "Weather service authentication failed" for 401 errors
- **16.5**: Displays "Weather service rate limit exceeded" for 429 errors
- **16.6**: Displays "Weather service temporarily unavailable" for 500 errors

## Testing

See `weatherService.example.ts` for comprehensive usage examples and test scenarios.

## Troubleshooting

### "Weather service not configured"
- Check that WEATHER_API_KEY is set in `.env` file
- Verify the API key is valid
- Restart the Expo development server

### "Weather service authentication failed"
- API key is invalid or expired
- Get a new API key from OpenWeatherMap
- Update `.env` file and restart

### "Request timed out"
- Network is slow or unstable
- Try again with better network connection
- Check if cached data is available

### "Weather service rate limit exceeded"
- Too many requests in short time
- Wait a few minutes before retrying
- Caching should prevent this in normal usage

### No weather data displayed
- Check location permissions
- Verify coordinates are valid
- Check console for error messages

## Related Services

- **StorageService**: Stores cached weather data
- **GeminiService**: Uses weather data for chatbot context
- **PermissionService**: Manages location permissions

## Future Enhancements

Potential improvements for future versions:

- [ ] Add weather alerts and warnings
- [ ] Support multiple location tracking
- [ ] Add hourly forecast
- [ ] Implement weather-based plant care suggestions
- [ ] Add weather history tracking
- [ ] Support manual city entry as fallback
- [ ] Add weather condition icons and animations
- [ ] Implement background weather updates
