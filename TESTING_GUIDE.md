# PlantPal Testing & Verification Guide

## 🔍 Current Issue: Inconsistent Plant Identification

### Problem
When uploading an image of an apple plant (or any plant), you're getting different results each time.

### Root Cause Analysis
1. **Missing `.env` file** - Gemini API key not configured
2. **Fallback to local classification** - Works but less accurate
3. **API errors not visible** - Silent failures

---

## ✅ SOLUTION: Step-by-Step Fix

### Step 1: Create `.env` File

**CRITICAL**: You must create a `.env` file in the project root with your API keys.

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` and add your actual API keys:
```env
# Get Gemini API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE

# Firebase keys (from Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123

# Weather API key (from OpenWeatherMap)
VITE_WEATHER_API_KEY=your_weather_key
```

### Step 2: Restart Development Server

After creating `.env`, you MUST restart:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Verify API Configuration

Open browser console (F12) and check for:
- ✅ "Gemini API key configured correctly"
- ❌ "Gemini API key not configured" (means .env not loaded)

---

## 🧪 Testing Each Feature

### 1. Test Plant Identification

#### Test Case: Apple Plant (or any plant)
1. Go to "Add Plant" page
2. Click "Scan Plant" tab
3. Upload the same apple plant image **3 times**
4. **Expected Result**: Same identification each time
   - Same common name
   - Same scientific name
   - Similar confidence score (±2%)

#### What to Check:
- [ ] Identification is consistent
- [ ] Confidence score is reasonable (60-95%)
- [ ] Shows "Top 3 Predictions"
- [ ] Displays AI analysis
- [ ] Shows care instructions
- [ ] No errors in console

#### If Still Inconsistent:
Check browser console for:
```
[PlantPal] Attempting Gemini Vision API identification...
[PlantPal] Gemini identification successful: [Plant Name]
```

If you see:
```
[PlantPal] Gemini identification failed: [error]
[PlantPal] Falling back to local classification...
```
Then Gemini API is not working - check your API key.

---

### 2. Test Watering Calculator

1. Add a plant with these details:
   - Pot Size: Medium (20cm)
   - Soil Type: Loamy
   - Plant Height: 30cm
   - Location: Indoor

2. Go to plant details → "Care Guide" tab
3. Check watering recommendations

**Expected Output**:
```
💧 Watering Amount: 450ml
📅 Frequency: Every 5 days
⏰ Best Time: Evening (6-8 PM)
```

#### What to Check:
- [ ] Shows specific ml amount
- [ ] Frequency is reasonable
- [ ] Time recommendation makes sense
- [ ] Weather adjustments shown
- [ ] No "undefined" or "NaN" values

---

### 3. Test Kitchen Waste Composting

1. Open any plant details
2. Go to "Care Guide" tab → "Composting" section
3. Review recommendations

**Expected Output**:
- ✅ 8 recommended items (banana peels, eggshells, etc.)
- ❌ 6 items to avoid (meat, dairy, etc.)
- 📋 7-step preparation guide

#### What to Check:
- [ ] All items display correctly
- [ ] Icons show properly
- [ ] Preparation steps are clear
- [ ] Benefits explained

---

### 4. Test Age Estimation

1. Go to plant details
2. Find "Age Estimator" component
3. Upload 4 images:
   - Full plant view
   - Stem close-up
   - Leaves detail
   - Roots (optional)

4. Click "Estimate Age"

**Expected Output**:
```
Estimated Age: 12 months
Confidence: 85%
Analysis: [Detailed reasoning]
```

#### What to Check:
- [ ] Age is reasonable (1-48 months)
- [ ] Confidence score shown
- [ ] Analysis explains reasoning
- [ ] Same images give same result

---

### 5. Test Disease Detection

1. Open plant details
2. Scroll to "Disease Scanner"
3. Upload leaf image
4. Click "Scan for Disease"

**Expected Output**:
- Disease name (if detected)
- Severity level
- Confidence score
- Treatment recommendations

#### What to Check:
- [ ] Detection completes
- [ ] Results are clear
- [ ] Recommendations provided
- [ ] History is saved

---

### 6. Test Weather Integration

1. Allow location permission when prompted
2. Check weather widget on dashboard

**Expected Output**:
- Current temperature
- Humidity
- 7-day forecast
- Weather-based care advice

#### What to Check:
- [ ] Location detected
- [ ] Weather data loads
- [ ] Forecast displays
- [ ] Cache works (30min)
- [ ] No repeated API calls

---

### 7. Test AI Chatbot

1. Go to any plant details
2. Click "Chat" button
3. Ask: "Why are my leaves turning yellow?"

**Expected Output**:
- Context-aware response
- Mentions your specific plant
- Considers current weather
- Provides actionable advice

#### What to Check:
- [ ] Response is relevant
- [ ] Uses plant context
- [ ] Mentions weather if relevant
- [ ] Provides specific advice
- [ ] No generic responses

---

### 8. Test Gamification

1. Add multiple plants
2. Water them consistently
3. Perform disease scans
4. Check badge progress

**Expected Badges**:
- 🌱 Plant Parent (first plant)
- 💧 Water Warrior (consistent watering)
- 🛡️ Disease Defender (early detection)
- 🧠 AI Gardener (follows AI advice)
- 📸 Photo Pro (growth timeline)
- 🌟 Green Thumb (high care score)
- 🏆 Master Gardener (all achievements)

#### What to Check:
- [ ] Badges unlock correctly
- [ ] Progress tracked
- [ ] Notifications show
- [ ] Care score updates

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find Gemini API key"
**Solution**: 
1. Create `.env` file in project root
2. Add `VITE_GEMINI_API_KEY=your_key`
3. Restart dev server

### Issue 2: Different results each time
**Cause**: Gemini API not working, falling back to local classification
**Solution**: 
1. Verify `.env` file exists
2. Check API key is valid
3. Check browser console for errors
4. Test API connection:
```javascript
// Open browser console and run:
const test = await fetch('https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY');
console.log(await test.json());
```

### Issue 3: Low confidence scores
**Cause**: Poor image quality or uncommon plant
**Solution**:
- Use clear, well-lit photos
- Include distinctive features
- Try multiple angles
- Ensure plant fills frame

### Issue 4: Camera not working
**Solution**:
- Grant camera permissions
- Use HTTPS (required)
- Try different browser
- Check camera is not in use

### Issue 5: Weather not loading
**Solution**:
1. Allow location permission
2. Check `VITE_WEATHER_API_KEY` in `.env`
3. Wait 10-15 minutes after creating API key
4. Check OpenWeatherMap dashboard

---

## 📊 Performance Benchmarks

### Expected Performance:
- **Plant Identification**: 2-5 seconds
- **Age Estimation**: 3-6 seconds
- **Disease Detection**: 2-4 seconds
- **Weather Fetch**: 1-2 seconds (cached: <100ms)
- **Chatbot Response**: 2-5 seconds

### If Slower:
- Check internet connection
- Verify API rate limits
- Check browser console for errors
- Clear cache and reload

---

## 🔬 Debug Tools

### 1. Check API Configuration
Open browser console:
```javascript
// Check if API key is loaded
console.log('Gemini Key:', import.meta.env.VITE_GEMINI_API_KEY ? 'Configured' : 'Missing');
console.log('Weather Key:', import.meta.env.VITE_WEATHER_API_KEY ? 'Configured' : 'Missing');
```

### 2. View Debug Logs
```javascript
// Get identification logs
const logs = JSON.parse(localStorage.getItem('plantpal_debug_logs') || '[]');
console.table(logs);
```

### 3. Test Gemini Connection
```javascript
// Import and test
import { testGeminiConnection } from './src/services/apiDebugService';
const result = await testGeminiConnection();
console.log(result);
```

### 4. Clear Debug Logs
```javascript
localStorage.removeItem('plantpal_debug_logs');
```

---

## ✅ Final Checklist

Before reporting issues, verify:

- [ ] `.env` file exists in project root
- [ ] All API keys are configured
- [ ] Development server restarted after creating `.env`
- [ ] Browser console shows no errors
- [ ] Camera permissions granted
- [ ] Location permissions granted
- [ ] Internet connection stable
- [ ] Using supported browser (Chrome, Firefox, Edge)
- [ ] Images are clear and well-lit
- [ ] Tested same image multiple times

---

## 📞 Still Having Issues?

### Collect This Information:
1. Browser console errors (F12 → Console tab)
2. Network tab errors (F12 → Network tab)
3. Debug logs: `localStorage.getItem('plantpal_debug_logs')`
4. Screenshot of the issue
5. Steps to reproduce

### Check These Files:
- `src/services/plantIdentificationService.ts` - Main identification logic
- `src/services/apiDebugService.ts` - Debug utilities
- `src/components/PlantIdentifier.tsx` - UI component
- `.env` - API configuration

---

## 🎯 Expected Behavior Summary

### Consistent Identification:
✅ Same image → Same result  
✅ Confidence 60-95%  
✅ Top 3 predictions shown  
✅ AI analysis provided  
✅ Care instructions included  

### Smart Calculations:
✅ Exact watering amounts (ml)  
✅ Weather-based adjustments  
✅ Time recommendations  
✅ Personalized schedules  

### Accurate Age Estimation:
✅ Multi-image analysis  
✅ Confidence scores  
✅ Detailed reasoning  
✅ Consistent results  

---

**Last Updated**: February 9, 2026  
**Version**: 1.0.0
