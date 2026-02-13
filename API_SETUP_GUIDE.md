# API Setup Guide - Plant-Pal App

## Required APIs

You need 3 services:
1. **Firebase** (Database + Storage)
2. **Google Gemini AI** (Chatbot)
3. **OpenWeatherMap** (Weather Data)

---

## 1. FIREBASE SETUP

### Step 1: Create Firebase Project
1. Go to: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `plant-pal` (or any name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Register Web App
1. In Firebase Console, click the **Web icon** `</>`
2. Enter app nickname: `plant-pal-web`
3. Click **"Register app"**
4. Copy the `firebaseConfig` object (you'll need these values)

### Step 3: Enable Firestore Database
1. In left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose location closest to you
5. Click **"Enable"**

### Step 4: Enable Storage
1. In left sidebar, click **"Storage"**
2. Click **"Get started"**
3. Click **"Next"** (keep default rules for now)
4. Choose same location as Firestore
5. Click **"Done"**

### Step 5: Get Firebase Config Values
From the Firebase config object, you need:
```javascript
{
  apiKey: "AIza...",              // VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",                   // VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...",        // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123..."                   // VITE_FIREBASE_APP_ID
}
```

---

## 2. GOOGLE GEMINI AI SETUP

### Step 1: Get API Key
1. Go to: https://makersuite.google.com/app/apikey
   OR: https://aistudio.google.com/app/apikey
2. Click **"Create API key"**
3. Select **"Create API key in new project"** (or use existing)
4. Copy the API key (starts with `AIza...`)

### Important Notes:
- Free tier: 60 requests per minute
- No credit card required
- API key format: `AIzaSy...` (39 characters)

---

## 3. OPENWEATHERMAP SETUP

### Step 1: Create Account
1. Go to: https://openweathermap.org/api
2. Click **"Sign Up"** (top right)
3. Fill in:
   - Username
   - Email
   - Password
4. Verify email

### Step 2: Get API Key
1. After login, go to: https://home.openweathermap.org/api_keys
2. You'll see a default API key already created
3. Copy the API key (32 characters)

### Step 3: Wait for Activation
- New API keys take **10-15 minutes** to activate
- You'll get "Invalid API key" error until activated
- Free tier: 1,000 calls/day, 60 calls/minute

---

## 4. CREATE .env FILE

Create a file named `.env` in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Google Gemini AI
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OpenWeatherMap
VITE_WEATHER_API_KEY=abcdef1234567890abcdef1234567890
```

---

## 5. VERIFY SETUP

### Test Firebase Connection
1. Run: `npm run dev`
2. Open browser console (F12)
3. Check for Firebase errors
4. Go to `/add-plant` and try adding a plant
5. Check Firebase Console > Firestore Database for new data

### Test Gemini AI
1. Go to `/my-plants`
2. Click **"Chat"** button
3. Ask: "How do I care for roses?"
4. Should get AI response

### Test Weather API
1. Allow location permission when prompted
2. Weather widget should show current temperature
3. Check browser console for errors

---

## TROUBLESHOOTING

### Firebase Errors

**"Firebase: Error (auth/invalid-api-key)"**
- Check `VITE_FIREBASE_API_KEY` is correct
- Ensure no extra spaces in `.env` file

**"Missing or insufficient permissions"**
- Go to Firestore Database > Rules
- Change to (for development only):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Storage upload fails**
- Go to Storage > Rules
- Change to (for development only):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### Gemini AI Errors

**"API key not valid"**
- Wait a few minutes after creating key
- Regenerate key if still not working
- Check key starts with `AIza`

**"Quota exceeded"**
- Free tier: 60 requests/minute
- Wait 1 minute and try again

### Weather API Errors

**"Invalid API key"**
- Wait 10-15 minutes after creating account
- Check key is exactly 32 characters
- No spaces in `.env` file

**"Location permission denied"**
- Browser will ask for location permission
- Click "Allow" to enable weather features
- Or manually enter coordinates in code

---

## SECURITY NOTES

### For Production:
1. **Never commit `.env` file to Git**
2. Add `.env` to `.gitignore` (already done)
3. Use Firebase Security Rules
4. Restrict API keys by domain/IP
5. Enable Firebase Authentication

### Firebase Security Rules (Production):
```javascript
// Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /plants/{plantId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

// Storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /plants/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## QUICK START CHECKLIST

- [ ] Create Firebase project
- [ ] Enable Firestore Database
- [ ] Enable Firebase Storage
- [ ] Copy Firebase config values
- [ ] Get Gemini API key from AI Studio
- [ ] Create OpenWeatherMap account
- [ ] Get Weather API key
- [ ] Wait 10-15 minutes for Weather API activation
- [ ] Create `.env` file with all keys
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test adding a plant
- [ ] Test chatbot
- [ ] Test weather widget

---

## COST INFORMATION

All services have **FREE TIERS**:

### Firebase (Free Spark Plan)
- Firestore: 50K reads/day, 20K writes/day
- Storage: 1GB storage, 10GB/month transfer
- Perfect for development and small apps

### Gemini AI (Free Tier)
- 60 requests per minute
- No daily limit
- No credit card required

### OpenWeatherMap (Free Tier)
- 1,000 API calls per day
- 60 calls per minute
- Current weather + 5-day forecast

**Total Cost: $0** for development and demo purposes!

---

## SUPPORT LINKS

- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Gemini AI Studio: https://aistudio.google.com/
- Gemini API Docs: https://ai.google.dev/docs
- OpenWeatherMap: https://openweathermap.org/
- Weather API Docs: https://openweathermap.org/api

---

## EXAMPLE .env FILE (FILLED)

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuv
VITE_FIREBASE_AUTH_DOMAIN=plant-pal-demo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plant-pal-demo
VITE_FIREBASE_STORAGE_BUCKET=plant-pal-demo.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# Google Gemini AI (from AI Studio)
VITE_GEMINI_API_KEY=AIzaSyD9876543210zyxwvutsrqponmlkjihgfedcba

# OpenWeatherMap (from OpenWeatherMap Dashboard)
VITE_WEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Replace the example values with your actual API keys!
