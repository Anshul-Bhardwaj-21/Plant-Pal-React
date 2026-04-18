# Implementation Plan: React Native (Expo) Mobile App Conversion

## Overview

This implementation plan converts the PlantPal React web application to a React Native mobile app using Expo. The implementation follows a layered architecture approach, building from the foundation (data layer) up through services, business logic, and finally the presentation layer. Each task builds incrementally to ensure continuous integration and early validation.

## Tasks

- [x] 1. Initialize Expo project and configure environment
  - Initialize new Expo project with TypeScript template
  - Install core dependencies: expo-router, @google/generative-ai, expo-camera, expo-location, expo-image-picker, expo-image-manipulator, expo-file-system, @react-native-async-storage/async-storage
  - Configure app.json with proper app name, bundle identifiers, and permissions (camera, location)
  - Create .env.example file with placeholder API keys (GEMINI_API_KEY, WEATHER_API_KEY)
  - Set up expo-constants for environment variable access
  - Configure TypeScript with strict mode and path aliases
  - _Requirements: 1.1, 1.2, 1.3, 18.1, 18.2, 18.6, 18.9_

- [ ] 2. Implement data layer and storage services
  - [x] 2.1 Create data models and TypeScript interfaces
    - Define Plant, CareAction, Badge, HealthSnapshot, ChatMessage interfaces
    - Define service interfaces: GeminiService, WeatherService, StorageService, PermissionService, ImageService
    - Create STORAGE_KEYS constant object
    - Create BADGE_DEFINITIONS constant object
    - _Requirements: 20.4, 20.5, 20.6_
  
  - [x] 2.2 Implement StorageService for AsyncStorage operations
    - Create src/services/storageService.ts
    - Implement getPlants(), savePlants(), getCareHistory(), saveCareHistory(), getBadges(), saveBadges()
    - Add JSON serialization/deserialization with error handling
    - Implement retry logic for failed writes
    - Add storage quota error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 17.1, 17.2, 17.3, 17.7_
  
  - [x] 2.3 Implement ImageService for file system operations
    - Create src/services/imageService.ts
    - Implement saveImage() with unique filename generation (plantId + timestamp)
    - Implement deleteImage() for cleanup
    - Implement processImage() for resizing (max 1024px) and compression (0.8 quality)
    - Add file system error handling with graceful fallbacks
    - _Requirements: 3.7, 3.8, 12.1, 12.2, 12.3, 12.4, 12.6, 12.8, 12.9_

- [x] 3. Implement permission handling service
  - Create src/services/permissionService.ts
  - Implement requestCameraPermission() and checkCameraPermission()
  - Implement requestLocationPermission() and checkLocationPermission()
  - Implement openSettings() to navigate to device settings
  - Add permission status type guards and error handling
  - _Requirements: 3.2, 3.3, 7.2, 7.3, 14.1, 14.2, 14.4, 14.5, 14.7, 14.8_

- [ ] 4. Implement external API services
  - [x] 4.1 Implement GeminiService for AI operations
    - Create src/services/geminiService.ts
    - Initialize Gemini client with API key from environment
    - Implement identifyPlant() with image upload and structured prompt
    - Implement detectDisease() with disease analysis prompt
    - Implement chat() with conversation context
    - Add 30-second timeout for all requests
    - Add error handling for 401, 429, 500 status codes with user-friendly messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8, 4.9, 5.1, 5.2, 5.3, 5.8, 5.9, 6.2, 6.8, 16.1, 16.2, 16.3_
  
  - [x] 4.2 Implement WeatherService for weather data
    - Create src/services/weatherService.ts
    - Implement getCurrentWeather() using OpenWeatherMap API
    - Implement getForecast() for 7-day forecast
    - Implement cacheWeather() and getCachedWeather() with 30-minute expiry
    - Add 15-second timeout for requests
    - Add error handling for 401, 429, 500 status codes
    - _Requirements: 7.5, 7.6, 7.7, 7.8, 7.9, 7.12, 7.13, 16.4, 16.5, 16.6_

- [ ] 5. Implement business logic layer
  - [x] 5.1 Create health calculation utilities
    - Create src/utils/healthCalculator.ts
    - Implement calculateHealthScore() algorithm with watering, disease, care frequency, and age factors
    - Implement calculateCareScore() algorithm with weighted action types
    - Implement getDaysSince() helper function
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.8, 9.9_
  
  - [x] 5.2 Create gamification engine
    - Create src/utils/gamificationEngine.ts
    - Implement checkBadgeEligibility() for all 7 badge types
    - Implement badge awarding logic for Health Monitor, Year Keeper, Week Warrior, Monthly Master, Perfect Health, Plant Collector, Green Thumb
    - Implement streak calculation for consecutive watering days
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_
  
  - [x] 5.3 Create plant manager for CRUD operations
    - Create src/utils/plantManager.ts
    - Implement addPlant(), updatePlant(), deletePlant(), getPlant(), getAllPlants()
    - Implement addCareAction() with automatic health score recalculation
    - Implement logWatering(), logDiseaseCheck(), logFertilizing(), logPruning(), logRepotting()
    - Add data validation before storage operations
    - Integrate health calculator and gamification engine
    - _Requirements: 8.13, 11.1, 11.2, 11.3, 11.4, 11.5, 11.9, 17.6_

- [x] 6. Checkpoint - Ensure core services are functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement camera and image capture screens
  - [x] 7.1 Create CameraScreen component
    - Create app/camera.tsx
    - Implement camera permission request flow
    - Display live camera preview when permission granted
    - Add capture button with image processing
    - Add camera flip button (front/back toggle)
    - Display permission denial modal with settings button and gallery fallback
    - Add loading indicator during image processing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10, 14.1, 14.2, 14.3_
  
  - [~] 7.2 Implement gallery picker integration
    - Add expo-image-picker for gallery selection
    - Implement selectFromGallery() in ImageService
    - Add gallery button to camera screen
    - Process selected images same as captured images
    - _Requirements: 3.9_

- [~] 8. Implement plant identification flow
  - Create app/add.tsx (Add Plant screen)
  - Add camera/gallery buttons to capture plant image
  - Call GeminiService.identifyPlant() with captured image
  - Display top 3 identification results with confidence scores
  - Display loading indicator during AI processing
  - Allow user to select identified plant or enter custom name
  - Save new plant with identification data
  - Handle network errors with retry button
  - Handle API errors with user-friendly messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 15.2, 15.5_

- [~] 9. Implement navigation structure
  - Create app/(tabs)/_layout.tsx for bottom tab navigator
  - Create app/(tabs)/index.tsx (Home screen)
  - Create app/(tabs)/add.tsx (Add Plant screen - link to identification flow)
  - Create app/(tabs)/weather.tsx (Weather screen)
  - Create app/(tabs)/chat.tsx (Chat screen)
  - Configure tab bar with icons and labels
  - Set up stack navigation for detail screens
  - Add header configuration with titles
  - _Requirements: 1.2, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 10. Implement home screen and plant list
  - [~] 10.1 Create PlantCard component
    - Create src/components/PlantCard.tsx
    - Display plant image, name, type
    - Display health score with color indicator (red <50, yellow 50-75, green >75)
    - Display last watered date in human-readable format
    - Add onPress handler for navigation
    - Style with card layout and dark theme
    - _Requirements: 8.1, 8.3, 8.4, 13.8, 13.9_
  
  - [~] 10.2 Implement home screen plant list
    - Implement app/(tabs)/index.tsx
    - Load plants from StorageService on mount
    - Display plants in FlatList with PlantCard components
    - Add pull-to-refresh functionality
    - Display empty state when no plants exist
    - Add navigation to plant detail on card press
    - _Requirements: 8.1, 8.2, 13.7, 15.3_

- [ ] 11. Implement plant detail screen
  - [~] 11.1 Create plant detail screen layout
    - Create app/plant/[id].tsx
    - Load plant data and care history from storage
    - Display plant image, name, type, age
    - Display health score and care score with visual indicators
    - Display last watered date and next watering due date
    - Add quick action buttons: Water Now, Scan Disease, Add Note
    - Style with card-based layout and dark theme
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.12, 8.14_
  
  - [~] 11.2 Implement health and care charts
    - Install react-native-chart-kit or victory-native
    - Create 30-day health score trend line chart
    - Create care activity breakdown pie chart
    - Create 7-day watering schedule bar chart
    - _Requirements: 8.7, 8.8, 8.9_
  
  - [~] 11.3 Implement care history timeline
    - Display care history in reverse chronological order
    - Add icons for each action type (watering, disease check, fertilizing, pruning, repotting)
    - Display timestamps in human-readable format
    - Add filtering by action type
    - Limit display to 500 entries
    - _Requirements: 8.10, 11.6, 11.7, 11.8, 11.10_
  
  - [~] 11.4 Implement badge display
    - Display earned badges with icons and descriptions
    - Display badge progress indicators for unearned badges
    - Style badges with visual distinction
    - _Requirements: 8.11, 10.11, 10.12_
  
  - [~] 11.5 Implement quick actions
    - Implement "Water Now" button to log watering action
    - Update last watered date and recalculate health score
    - Navigate to camera for "Scan Disease" button
    - Show success toast after actions
    - _Requirements: 8.13, 9.6, 9.10_

- [~] 12. Checkpoint - Ensure plant management is functional
  - Ensure all tests pass, ask the user if questions arise.

- [~] 13. Implement disease detection feature
  - Create disease scanning flow from plant detail screen
  - Navigate to camera screen with disease scan mode
  - Call GeminiService.detectDisease() with captured image
  - Display disease detection results: name, confidence, symptoms, causes, treatment
  - Display "Plant appears healthy" when no disease detected
  - Save disease detection result to care history
  - Update plant disease status
  - Recalculate health score (decrease by 20 if disease detected)
  - Handle network and API errors with retry
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 9.4, 15.5_

- [ ] 14. Implement weather dashboard
  - [~] 14.1 Create WeatherDashboard component
    - Create app/(tabs)/weather.tsx
    - Request location permission on mount
    - Display permission denial modal with manual city entry option
    - Fetch user location coordinates when permission granted
    - Call WeatherService.getCurrentWeather() and getForecast()
    - Display current weather: temperature, humidity, wind speed, conditions, icon
    - Display 7-day forecast with daily high/low and conditions
    - Show cached data when network unavailable
    - Add pull-to-refresh to update weather
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8, 7.10, 14.4, 14.5, 14.6, 15.4_
  
  - [~] 14.2 Implement weather error handling
    - Display "No internet connection" when network unavailable
    - Display "Weather service temporarily unavailable" for API errors
    - Display "Weather service not configured" when API key missing
    - Show retry button for failed requests
    - _Requirements: 7.10, 7.11, 7.12, 16.4, 16.5, 16.6_

- [ ] 15. Implement AI chatbot
  - [~] 15.1 Create ChatScreen component
    - Create app/(tabs)/chat.tsx
    - Display conversation history with user and AI messages
    - Style user messages and AI messages distinctly
    - Add text input for user messages
    - Add send button
    - Implement auto-scroll to latest message
    - _Requirements: 6.1, 6.4, 6.5_
  
  - [~] 15.2 Implement chat functionality
    - Load chat history from AsyncStorage on mount
    - Build chat context with user's plants and current weather
    - Call GeminiService.chat() when user sends message
    - Display typing indicator while waiting for response
    - Append AI response to conversation
    - Save chat history to AsyncStorage
    - Handle network errors with in-chat error messages
    - Handle API errors with user-friendly messages
    - _Requirements: 6.2, 6.3, 6.6, 6.7, 6.8, 6.9, 6.10, 15.5_

- [~] 16. Implement error boundaries and global error handling
  - Create src/components/ErrorBoundary.tsx
  - Wrap app root with error boundary
  - Implement global unhandled promise rejection handler
  - Add error logging to console
  - Display user-friendly error screens
  - _Requirements: 19.5, 19.6_

- [~] 17. Implement toast notifications and loading states
  - Install or create toast notification utility
  - Add success toasts for user actions (plant added, watered, etc.)
  - Add error toasts for failed operations
  - Implement loading indicators for all async operations
  - Add network status indicator in app header
  - _Requirements: 13.11, 13.12, 15.9_

- [~] 18. Implement performance optimizations
  - Add React.memo to PlantCard and other list item components
  - Implement useMemo for expensive calculations (health scores, badge eligibility)
  - Implement lazy loading for plant images
  - Add image caching strategy
  - Debounce chat input and search fields
  - Optimize FlatList with proper keyExtractor and getItemLayout
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.7, 19.8, 19.9_

- [~] 19. Implement data export and import utilities
  - Create src/utils/dataExport.ts
  - Implement exportData() to JSON format
  - Implement importData() with validation
  - Add data migration utilities for future Firebase integration
  - Validate imported data structure before loading
  - _Requirements: 20.1, 20.2, 20.7, 20.8, 20.9_

- [~] 20. Implement settings screen and app configuration
  - Create app/settings.tsx
  - Add "Clear Cache" button to free up storage
  - Add "Export Data" button
  - Add "Import Data" button
  - Display app version and API configuration status
  - Add links to open device settings for permissions
  - _Requirements: 17.8, 18.4, 18.5, 18.10_

- [ ] 21. Final integration and polish
  - [~] 21.1 Implement health snapshot tracking
    - Create daily health snapshot recording
    - Store snapshots for 30-day trend analysis
    - Implement cleanup for old snapshots
    - _Requirements: 9.7_
  
  - [~] 21.2 Implement circuit breaker for API requests
    - Add circuit breaker pattern to prevent repeated failed requests
    - Implement exponential backoff for retries
    - _Requirements: 15.8, 16.9_
  
  - [~] 21.3 Add environment validation on startup
    - Check for required API keys on app launch
    - Display configuration errors clearly
    - Gracefully disable features when API keys missing
    - _Requirements: 18.4, 18.5, 18.10_
  
  - [~] 21.4 Implement storage management
    - Add storage quota monitoring
    - Implement automatic cleanup of old data when approaching limits
    - Limit care history to 500 entries per plant
    - Limit total image storage to 100MB
    - _Requirements: 2.10, 11.10, 12.10, 17.3_
  
  - [~] 21.5 Add comprehensive error handling
    - Ensure all async operations have try-catch blocks
    - Add user-friendly error messages for all error scenarios
    - Implement proper error logging
    - Test all edge cases: no permissions, no network, API failures, storage errors
    - _Requirements: 14.9, 14.10, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 16.7, 16.8, 16.10, 17.4, 17.5, 17.9, 17.10_

- [~] 22. Final checkpoint - Complete testing and validation
  - Test app on both iOS and Android
  - Verify all features work without internet connection
  - Test all permission denial scenarios
  - Test all API error scenarios
  - Verify data persistence across app restarts
  - Test with 100+ plants for performance
  - Verify zero crashes during normal operation
  - Ensure app starts within 3 seconds
  - Ensure UI responds within 100ms
  - _Requirements: 1.8, 15.10, 19.1, 19.2, 19.3, 19.10_

## Notes

- All tasks build incrementally from data layer to presentation layer
- Each checkpoint ensures stability before moving to next phase
- TypeScript is used throughout for type safety
- All requirements are covered by implementation tasks
- Error handling and edge cases are integrated throughout
- Performance optimizations are applied in dedicated task
- Data structures are Firebase-compatible for future migration
