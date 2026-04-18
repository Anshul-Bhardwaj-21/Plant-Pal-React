# Requirements Document: React Native (Expo) Mobile App Conversion

## Introduction

This document specifies the requirements for converting the existing PlantPal React web application into a fully functional React Native mobile application using the Expo framework. The conversion must preserve all existing features including AI plant identification, disease detection, care tracking, weather integration, gamification, and chatbot functionality while adapting web-specific implementations to mobile-native equivalents. The application must be production-ready, stable, and capable of handling all edge cases including permission denials, network failures, and API errors.

## Glossary

- **PlantPal_App**: The React Native mobile application being created
- **Expo_Framework**: The React Native development framework used for building the mobile app
- **AsyncStorage**: React Native's local storage system for persisting data
- **Gemini_AI**: Google's generative AI service used for plant identification, disease detection, and chatbot
- **Camera_Module**: expo-camera package for capturing plant images
- **Image_Manipulator**: expo-image-manipulator package for image processing and optimization
- **Weather_API**: OpenWeatherMap API service for weather data
- **Location_Service**: Expo's location service for obtaining user coordinates
- **Plant_Dashboard**: The main interface displaying plant health, care history, and analytics
- **Gamification_System**: Badge and achievement system rewarding user engagement
- **Permission_Handler**: System for requesting and managing device permissions (camera, location)
- **Edge_Case**: Scenarios where normal operation is disrupted (no permissions, no internet, API failures)
- **Health_Score**: Calculated metric (0-100) representing plant health based on care consistency
- **Care_Score**: Calculated metric (0-100) representing user engagement with plant care
- **Disease_Scanner**: Feature using Gemini AI to detect plant diseases from images
- **Plant_Identifier**: Feature using Gemini AI to identify plant species from images
- **Care_History**: Log of all care actions (watering, disease checks, fertilizing, pruning, repotting)
- **Badge**: Achievement earned by users for consistent care or collection milestones

## Requirements

### Requirement 1: Project Structure Conversion

**User Story:** As a developer, I want to convert the React web project to React Native (Expo), so that the application runs natively on mobile devices.

#### Acceptance Criteria

1. THE PlantPal_App SHALL be initialized using Expo framework with TypeScript support
2. THE PlantPal_App SHALL use expo-router for navigation between screens
3. THE PlantPal_App SHALL replace all web-specific dependencies (react-router-dom, vite) with React Native equivalents
4. THE PlantPal_App SHALL replace all HTML elements (div, img, button) with React Native components (View, Image, Pressable)
5. THE PlantPal_App SHALL replace Tailwind CSS with React Native StyleSheet or styled-components
6. THE PlantPal_App SHALL replace shadcn/ui components with React Native UI components
7. THE PlantPal_App SHALL be startable using the command "npx expo start"
8. THE PlantPal_App SHALL support both iOS and Android platforms

### Requirement 2: Local Storage Implementation

**User Story:** As a user, I want my plant data to be stored locally on my device, so that I can access my plants without requiring an internet connection.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use AsyncStorage for all data persistence
2. THE PlantPal_App SHALL store plant collection data in AsyncStorage with key "plants"
3. THE PlantPal_App SHALL store care history data in AsyncStorage with key "care_history"
4. THE PlantPal_App SHALL store user badges in AsyncStorage with key "badges"
5. THE PlantPal_App SHALL store weather cache in AsyncStorage with key "weather_cache"
6. WHEN AsyncStorage write operations fail, THE PlantPal_App SHALL display an error message and retry once
7. WHEN AsyncStorage read operations fail, THE PlantPal_App SHALL return empty data structures and log the error
8. THE PlantPal_App SHALL serialize complex objects to JSON before storing in AsyncStorage
9. THE PlantPal_App SHALL parse JSON strings when retrieving data from AsyncStorage
10. THE PlantPal_App SHALL handle AsyncStorage quota exceeded errors gracefully

### Requirement 3: Camera Implementation

**User Story:** As a user, I want to capture plant photos using my device camera, so that I can identify plants and detect diseases.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use expo-camera for camera functionality
2. WHEN the user opens the camera, THE PlantPal_App SHALL request camera permissions
3. IF camera permission is denied, THEN THE PlantPal_App SHALL display a message explaining why camera access is needed and provide a button to open device settings
4. WHEN camera permission is granted, THE PlantPal_App SHALL display a live camera preview
5. THE PlantPal_App SHALL provide a button to capture photos
6. THE PlantPal_App SHALL provide a button to toggle between front and back cameras
7. WHEN a photo is captured, THE PlantPal_App SHALL use expo-image-manipulator to resize the image to maximum 1024px width while maintaining aspect ratio
8. WHEN a photo is captured, THE PlantPal_App SHALL compress the image to JPEG format with 0.8 quality
9. THE PlantPal_App SHALL provide a button to allow users to select images from their device gallery
10. WHEN the camera module fails to initialize, THE PlantPal_App SHALL display an error message and offer gallery selection as an alternative

### Requirement 4: Gemini AI Integration for Plant Identification

**User Story:** As a user, I want to identify plants by taking photos, so that I can learn about my plants and receive care recommendations.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use @google/generative-ai package with gemini-2.0-flash-exp model for plant identification
2. THE PlantPal_App SHALL read GEMINI_API_KEY from environment variables
3. WHEN a plant image is provided, THE PlantPal_App SHALL send the image to Gemini AI with a prompt requesting plant identification
4. THE PlantPal_App SHALL request the following information from Gemini AI: scientific name, common name, plant type, care requirements, and confidence score
5. WHEN Gemini AI returns identification results, THE PlantPal_App SHALL display the top 3 plant predictions with confidence scores
6. WHEN Gemini AI request fails due to network error, THE PlantPal_App SHALL display "No internet connection" message and allow retry
7. WHEN Gemini AI request fails due to API error, THE PlantPal_App SHALL display "AI service temporarily unavailable" message and allow retry
8. WHEN Gemini API key is missing or invalid, THE PlantPal_App SHALL display "AI service not configured" message
9. THE PlantPal_App SHALL include a timeout of 30 seconds for Gemini AI requests
10. THE PlantPal_App SHALL display a loading indicator while waiting for Gemini AI response

### Requirement 5: Gemini AI Integration for Disease Detection

**User Story:** As a user, I want to detect plant diseases by taking photos, so that I can treat my plants appropriately.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use Gemini AI to analyze plant images for disease detection
2. WHEN a plant disease scan is requested, THE PlantPal_App SHALL send the image to Gemini AI with a prompt requesting disease analysis
3. THE PlantPal_App SHALL request the following information from Gemini AI: disease name, confidence score, symptoms, causes, and treatment recommendations
4. WHEN Gemini AI detects a disease, THE PlantPal_App SHALL display the disease name, confidence score, and detailed treatment recommendations
5. WHEN Gemini AI detects a healthy plant, THE PlantPal_App SHALL display "Plant appears healthy" message
6. THE PlantPal_App SHALL store disease detection results in care history with timestamp
7. WHEN disease detection fails due to network error, THE PlantPal_App SHALL display "No internet connection" message and allow retry
8. WHEN disease detection fails due to API error, THE PlantPal_App SHALL display "Disease detection temporarily unavailable" message and allow retry
9. THE PlantPal_App SHALL include a timeout of 30 seconds for disease detection requests
10. THE PlantPal_App SHALL display a loading indicator while analyzing the image

### Requirement 6: Gemini AI Integration for Chatbot

**User Story:** As a user, I want to ask questions about plant care, so that I can get personalized advice for my plants.

#### Acceptance Criteria

1. THE PlantPal_App SHALL provide a chat interface for plant care questions
2. WHEN a user sends a message, THE PlantPal_App SHALL send the message to Gemini AI with context about user's plants and current weather
3. THE PlantPal_App SHALL maintain conversation history for context-aware responses
4. WHEN Gemini AI returns a response, THE PlantPal_App SHALL display it in the chat interface
5. THE PlantPal_App SHALL display user messages and AI responses with distinct visual styling
6. WHEN chat request fails due to network error, THE PlantPal_App SHALL display "No internet connection" message in the chat
7. WHEN chat request fails due to API error, THE PlantPal_App SHALL display "AI assistant temporarily unavailable" message in the chat
8. THE PlantPal_App SHALL include a timeout of 30 seconds for chat requests
9. THE PlantPal_App SHALL display a typing indicator while waiting for AI response
10. THE PlantPal_App SHALL store chat history locally using AsyncStorage

### Requirement 7: Weather Integration

**User Story:** As a user, I want to see current weather and forecasts, so that I can adjust my plant care based on environmental conditions.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use expo-location to obtain user's geographic coordinates
2. WHEN the app starts, THE PlantPal_App SHALL request location permissions
3. IF location permission is denied, THEN THE PlantPal_App SHALL display a message explaining why location access is needed and allow manual city entry
4. WHEN location permission is granted, THE PlantPal_App SHALL retrieve user's latitude and longitude
5. THE PlantPal_App SHALL use OpenWeatherMap API to fetch weather data using coordinates
6. THE PlantPal_App SHALL read WEATHER_API_KEY from environment variables
7. THE PlantPal_App SHALL display current weather including temperature, humidity, wind speed, and conditions
8. THE PlantPal_App SHALL display 7-day weather forecast
9. THE PlantPal_App SHALL cache weather data for 30 minutes to reduce API calls
10. WHEN weather API request fails due to network error, THE PlantPal_App SHALL display "No internet connection" message and show cached data if available
11. WHEN weather API request fails due to API error, THE PlantPal_App SHALL display "Weather service temporarily unavailable" message
12. WHEN weather API key is missing or invalid, THE PlantPal_App SHALL display "Weather service not configured" message
13. THE PlantPal_App SHALL include a timeout of 15 seconds for weather API requests

### Requirement 8: Plant Dashboard

**User Story:** As a user, I want to view comprehensive information about my plants, so that I can track their health and care history.

#### Acceptance Criteria

1. THE PlantPal_App SHALL display a list of all user's plants on the home screen
2. WHEN a plant is selected, THE PlantPal_App SHALL navigate to the plant detail screen
3. THE PlantPal_App SHALL display plant image, name, type, and age on the detail screen
4. THE PlantPal_App SHALL display health score (0-100) calculated from care consistency
5. THE PlantPal_App SHALL display care score (0-100) calculated from user engagement
6. THE PlantPal_App SHALL display last watered date and next watering due date
7. THE PlantPal_App SHALL display a 30-day health score trend chart using a charting library
8. THE PlantPal_App SHALL display a care activity breakdown chart showing counts by activity type
9. THE PlantPal_App SHALL display a 7-day watering schedule chart
10. THE PlantPal_App SHALL display complete care history in chronological order
11. THE PlantPal_App SHALL display earned badges for the plant
12. THE PlantPal_App SHALL provide buttons for quick actions: water now, scan disease, add note
13. WHEN "water now" is pressed, THE PlantPal_App SHALL log the watering action and update the last watered date
14. THE PlantPal_App SHALL use card-based layout with clean dark theme
15. THE PlantPal_App SHALL support smooth scrolling for long content

### Requirement 9: Plant Health Calculation

**User Story:** As a user, I want my plant's health to be automatically calculated, so that I can quickly assess if my care routine is adequate.

#### Acceptance Criteria

1. THE PlantPal_App SHALL calculate health score based on watering consistency, disease status, and care frequency
2. WHEN a plant is watered on schedule, THE PlantPal_App SHALL increase health score
3. WHEN a plant is overdue for watering, THE PlantPal_App SHALL decrease health score proportionally to days overdue
4. WHEN a disease is detected, THE PlantPal_App SHALL decrease health score by 20 points
5. WHEN a disease is marked as treated, THE PlantPal_App SHALL restore health score
6. THE PlantPal_App SHALL recalculate health score after every care action
7. THE PlantPal_App SHALL store daily health score snapshots for trend analysis
8. THE PlantPal_App SHALL calculate care score based on total care actions in the last 30 days
9. THE PlantPal_App SHALL normalize care score to 0-100 range
10. THE PlantPal_App SHALL update health and care scores in real-time

### Requirement 10: Gamification System

**User Story:** As a user, I want to earn badges for taking care of my plants, so that I feel motivated to maintain consistent care.

#### Acceptance Criteria

1. THE PlantPal_App SHALL implement 4 badge types: Care Badges, Streak Badges, Health Badges, and Collection Badges
2. THE PlantPal_App SHALL award "Health Monitor" badge when user performs 10 disease checks
3. THE PlantPal_App SHALL award "Year Keeper" badge when a plant reaches 365 days old
4. THE PlantPal_App SHALL award "Week Warrior" badge when user waters a plant for 7 consecutive days
5. THE PlantPal_App SHALL award "Monthly Master" badge when user waters a plant for 30 consecutive days
6. THE PlantPal_App SHALL award "Perfect Health" badge when a plant maintains 90+ health score for 7 days
7. THE PlantPal_App SHALL award "Plant Collector" badge when user owns 5 plants
8. THE PlantPal_App SHALL award "Green Thumb" badge when user owns 10 plants
9. THE PlantPal_App SHALL check badge eligibility after every care action
10. WHEN a badge is earned, THE PlantPal_App SHALL display a congratulatory notification
11. THE PlantPal_App SHALL display all earned badges on the plant detail screen
12. THE PlantPal_App SHALL display badge progress indicators for badges not yet earned
13. THE PlantPal_App SHALL store badge data in AsyncStorage

### Requirement 11: Care History Logging

**User Story:** As a user, I want all my care actions to be automatically logged, so that I can review my plant care history.

#### Acceptance Criteria

1. WHEN a plant is watered, THE PlantPal_App SHALL create a care history entry with type "watering" and timestamp
2. WHEN a disease check is performed, THE PlantPal_App SHALL create a care history entry with type "disease_check", results, and timestamp
3. WHEN fertilizer is applied, THE PlantPal_App SHALL create a care history entry with type "fertilizing", notes, and timestamp
4. WHEN pruning is performed, THE PlantPal_App SHALL create a care history entry with type "pruning", notes, and timestamp
5. WHEN repotting is performed, THE PlantPal_App SHALL create a care history entry with type "repotting", notes, and timestamp
6. THE PlantPal_App SHALL display care history in reverse chronological order (newest first)
7. THE PlantPal_App SHALL allow filtering care history by action type
8. THE PlantPal_App SHALL display care history entries with icons corresponding to action type
9. THE PlantPal_App SHALL store care history in AsyncStorage
10. THE PlantPal_App SHALL limit care history to 500 entries per plant to prevent storage overflow

### Requirement 12: Image Storage and Management

**User Story:** As a user, I want my plant photos to be stored locally, so that I can view them without internet connection.

#### Acceptance Criteria

1. WHEN a plant photo is captured or selected, THE PlantPal_App SHALL save it to the device's local file system using expo-file-system
2. THE PlantPal_App SHALL generate unique filenames for plant images using plant ID and timestamp
3. THE PlantPal_App SHALL store image file paths in AsyncStorage as part of plant data
4. WHEN a plant is deleted, THE PlantPal_App SHALL delete associated image files from the file system
5. WHEN an image file is missing, THE PlantPal_App SHALL display a placeholder image
6. THE PlantPal_App SHALL compress images to reduce storage usage
7. THE PlantPal_App SHALL support updating plant images
8. WHEN a plant image is updated, THE PlantPal_App SHALL delete the old image file
9. THE PlantPal_App SHALL handle file system errors gracefully and display appropriate error messages
10. THE PlantPal_App SHALL limit image storage to 100MB total to prevent excessive storage usage

### Requirement 13: Navigation and User Interface

**User Story:** As a user, I want smooth and intuitive navigation, so that I can easily access all app features.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use expo-router for screen navigation
2. THE PlantPal_App SHALL implement a bottom tab navigator with 4 tabs: Home, Add Plant, Weather, Chat
3. THE PlantPal_App SHALL use stack navigation within each tab for detail screens
4. THE PlantPal_App SHALL display a header with screen title on all screens
5. THE PlantPal_App SHALL provide a back button on detail screens
6. THE PlantPal_App SHALL use smooth transitions between screens
7. THE PlantPal_App SHALL implement pull-to-refresh on list screens
8. THE PlantPal_App SHALL use card-based layout for plant items
9. THE PlantPal_App SHALL implement a clean dark theme with green accents
10. THE PlantPal_App SHALL use consistent spacing, typography, and color scheme throughout
11. THE PlantPal_App SHALL display loading indicators during async operations
12. THE PlantPal_App SHALL display success/error toast notifications for user actions

### Requirement 14: Edge Case Handling - Permissions

**User Story:** As a user, I want clear guidance when permissions are denied, so that I understand how to enable features.

#### Acceptance Criteria

1. WHEN camera permission is denied, THE PlantPal_App SHALL display a modal explaining why camera access is needed
2. WHEN camera permission is denied, THE PlantPal_App SHALL provide a button to open device settings
3. WHEN camera permission is denied, THE PlantPal_App SHALL offer gallery selection as an alternative
4. WHEN location permission is denied, THE PlantPal_App SHALL display a modal explaining why location access is needed
5. WHEN location permission is denied, THE PlantPal_App SHALL provide a button to open device settings
6. WHEN location permission is denied, THE PlantPal_App SHALL allow manual city entry for weather
7. THE PlantPal_App SHALL check permission status before attempting to use camera or location
8. THE PlantPal_App SHALL handle "never ask again" permission status appropriately
9. THE PlantPal_App SHALL provide in-app instructions for enabling permissions in device settings
10. THE PlantPal_App SHALL gracefully degrade functionality when permissions are unavailable

### Requirement 15: Edge Case Handling - Network Failures

**User Story:** As a user, I want the app to work offline and handle network failures gracefully, so that I can still use core features without internet.

#### Acceptance Criteria

1. WHEN network is unavailable, THE PlantPal_App SHALL display "No internet connection" message for features requiring network
2. WHEN network is unavailable, THE PlantPal_App SHALL allow viewing locally stored plant data
3. WHEN network is unavailable, THE PlantPal_App SHALL allow logging care actions locally
4. WHEN network is unavailable, THE PlantPal_App SHALL display cached weather data if available
5. WHEN network is unavailable, THE PlantPal_App SHALL disable AI features (identification, disease detection, chatbot)
6. WHEN network request times out, THE PlantPal_App SHALL display "Request timed out" message and offer retry
7. WHEN network is restored, THE PlantPal_App SHALL automatically retry failed requests
8. THE PlantPal_App SHALL implement exponential backoff for retrying failed network requests
9. THE PlantPal_App SHALL display network status indicator in the app header
10. THE PlantPal_App SHALL queue AI requests when offline and process them when network is restored

### Requirement 16: Edge Case Handling - API Failures

**User Story:** As a user, I want clear error messages when APIs fail, so that I understand what went wrong and can take appropriate action.

#### Acceptance Criteria

1. WHEN Gemini API returns 401 error, THE PlantPal_App SHALL display "AI service authentication failed - check API key"
2. WHEN Gemini API returns 429 error, THE PlantPal_App SHALL display "AI service rate limit exceeded - please try again later"
3. WHEN Gemini API returns 500 error, THE PlantPal_App SHALL display "AI service temporarily unavailable - please try again"
4. WHEN Weather API returns 401 error, THE PlantPal_App SHALL display "Weather service authentication failed - check API key"
5. WHEN Weather API returns 429 error, THE PlantPal_App SHALL display "Weather service rate limit exceeded - please try again later"
6. WHEN Weather API returns 500 error, THE PlantPal_App SHALL display "Weather service temporarily unavailable - please try again"
7. THE PlantPal_App SHALL log all API errors to console for debugging
8. THE PlantPal_App SHALL provide retry buttons for failed API requests
9. THE PlantPal_App SHALL implement circuit breaker pattern to prevent repeated failed requests
10. THE PlantPal_App SHALL display user-friendly error messages without exposing technical details

### Requirement 17: Edge Case Handling - Storage Errors

**User Story:** As a user, I want the app to handle storage errors gracefully, so that I don't lose data or experience crashes.

#### Acceptance Criteria

1. WHEN AsyncStorage write fails, THE PlantPal_App SHALL display "Failed to save data" message and retry once
2. WHEN AsyncStorage read fails, THE PlantPal_App SHALL return empty data and log the error
3. WHEN AsyncStorage quota is exceeded, THE PlantPal_App SHALL display "Storage full - please delete old plants or care history"
4. WHEN file system write fails, THE PlantPal_App SHALL display "Failed to save image" message
5. WHEN file system read fails, THE PlantPal_App SHALL display placeholder image
6. THE PlantPal_App SHALL implement data validation before storing to prevent corrupted data
7. THE PlantPal_App SHALL implement data migration for schema changes
8. THE PlantPal_App SHALL provide a "Clear Cache" option in settings to free up storage
9. THE PlantPal_App SHALL backup critical data before performing destructive operations
10. THE PlantPal_App SHALL handle JSON parse errors gracefully when reading from AsyncStorage

### Requirement 18: Environment Configuration

**User Story:** As a developer, I want API keys to be configured via environment variables, so that sensitive credentials are not hardcoded.

#### Acceptance Criteria

1. THE PlantPal_App SHALL read GEMINI_API_KEY from .env file
2. THE PlantPal_App SHALL read WEATHER_API_KEY from .env file
3. THE PlantPal_App SHALL read FIREBASE_API_KEY from .env file (for future use)
4. THE PlantPal_App SHALL validate that required API keys are present on app startup
5. WHEN required API keys are missing, THE PlantPal_App SHALL display "App not configured - missing API keys" message
6. THE PlantPal_App SHALL use expo-constants to access environment variables
7. THE PlantPal_App SHALL not log or expose API keys in production builds
8. THE PlantPal_App SHALL provide clear documentation on required environment variables
9. THE PlantPal_App SHALL include a .env.example file with placeholder values
10. THE PlantPal_App SHALL gracefully disable features when their API keys are missing

### Requirement 19: Performance and Stability

**User Story:** As a user, I want the app to be fast and stable, so that I can use it reliably for my hackathon demo.

#### Acceptance Criteria

1. THE PlantPal_App SHALL start and display the home screen within 3 seconds on average devices
2. THE PlantPal_App SHALL respond to user interactions within 100ms
3. THE PlantPal_App SHALL handle lists of up to 100 plants without performance degradation
4. THE PlantPal_App SHALL optimize image loading using lazy loading and caching
5. THE PlantPal_App SHALL implement error boundaries to prevent app crashes
6. THE PlantPal_App SHALL catch and handle all unhandled promise rejections
7. THE PlantPal_App SHALL implement proper memory management to prevent memory leaks
8. THE PlantPal_App SHALL use React.memo and useMemo for expensive computations
9. THE PlantPal_App SHALL debounce user input in search and chat interfaces
10. THE PlantPal_App SHALL achieve zero crashes during normal operation

### Requirement 20: Data Migration and Compatibility

**User Story:** As a developer, I want to ensure data structures are compatible with future Firebase integration, so that migration is seamless.

#### Acceptance Criteria

1. THE PlantPal_App SHALL use data structures compatible with Firestore document format
2. THE PlantPal_App SHALL include unique IDs for all plants using UUID format
3. THE PlantPal_App SHALL include timestamps for all care actions in ISO 8601 format
4. THE PlantPal_App SHALL structure plant data with fields: id, name, type, image, createdAt, lastWatered, wateringFrequency, sunlight, healthScore, careScore, age
5. THE PlantPal_App SHALL structure care history with fields: id, plantId, type, timestamp, notes, metadata
6. THE PlantPal_App SHALL structure badge data with fields: id, type, name, description, earnedAt, plantId
7. THE PlantPal_App SHALL implement data export functionality to JSON format
8. THE PlantPal_App SHALL implement data import functionality from JSON format
9. THE PlantPal_App SHALL validate imported data structure before loading
10. THE PlantPal_App SHALL provide migration utilities for future Firebase integration

