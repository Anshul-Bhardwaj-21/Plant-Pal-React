# PlantPal Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
- [ ] `VITE_GEMINI_API_KEY` - Google Gemini API key
- [ ] `VITE_FIREBASE_API_KEY` - Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID
- [ ] `VITE_WEATHER_API_KEY` - OpenWeatherMap API key

### 2. Firebase Setup
- [ ] Firestore database created
- [ ] Storage bucket enabled
- [ ] Security rules configured
- [ ] Authentication enabled (optional)

### 3. API Limits
- [ ] Gemini API quota checked
- [ ] OpenWeatherMap plan confirmed (60 calls/min free tier)
- [ ] Firebase quotas reviewed

## Build

```bash
npm run build
```

Output: `dist/` folder

## Deploy Options

### Option 1: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 2: Vercel
```bash
npm install -g vercel
vercel
```

### Option 3: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Post-Deployment

### 1. Test Core Features
- [ ] Camera permission works
- [ ] Plant identification returns results
- [ ] Weather data loads
- [ ] Disease detection works
- [ ] Chat responds
- [ ] Images upload to Firebase

### 2. Performance
- [ ] Initial load < 3s
- [ ] Camera opens < 1s
- [ ] AI response < 5s

### 3. Mobile Testing
- [ ] Camera works on mobile
- [ ] UI responsive
- [ ] Touch interactions work

## Hackathon Demo Script

### 1. Opening (30s)
"PlantPal is an AI-powered plant care assistant that helps you keep your plants healthy using computer vision and weather intelligence."

### 2. Demo Flow (2-3 min)

**Add Plant:**
1. Click "Add Plant"
2. Take photo of plant
3. Show top 3 AI predictions
4. Select correct one
5. Auto-filled care requirements

**Plant Dashboard:**
1. Open plant detail
2. Show health score
3. Display care history graph
4. Weather-based recommendations

**Disease Detection:**
1. Click "Scan for Disease"
2. Take leaf photo
3. Show detection result
4. Display treatment recommendations

**AI Chat:**
1. Ask "Why are my leaves yellow?"
2. Show context-aware response
3. Highlight weather integration

### 3. Key Points
- ✅ Real AI (Gemini Vision API)
- ✅ Weather integration (OpenWeatherMap)
- ✅ Smart caching (30min)
- ✅ Gamification (badges)
- ✅ Production-ready

### 4. Tech Highlights
- React + TypeScript
- Firebase backend
- Gemini AI
- TensorFlow.js
- Real-time weather

## Troubleshooting

### Camera Not Working
- Check HTTPS (required)
- Verify browser permissions
- Test on different device

### AI Not Responding
- Check Gemini API key
- Verify API quota
- Check console errors

### Weather Not Loading
- Verify OpenWeatherMap key
- Check network tab
- Clear localStorage cache

## Performance Tips

### Reduce Bundle Size
- Lazy load routes
- Code split heavy components
- Use dynamic imports

### Optimize Images
- Compress before upload
- Use WebP format
- Implement lazy loading

### Cache Strategy
- Weather: 30 minutes
- Plant data: Real-time
- Images: Browser cache

## Security

### API Keys
- Never commit `.env`
- Use environment variables
- Rotate keys regularly

### Firebase Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /plants/{plantId} {
      allow read, write: if true; // Adjust for auth
    }
  }
}
```

## Monitoring

### Key Metrics
- API call count
- Error rate
- Response time
- User engagement

### Firebase Analytics
- Enable in Firebase console
- Track key events
- Monitor usage patterns

## Support

For issues:
1. Check console errors
2. Verify API keys
3. Test network connectivity
4. Review Firebase logs

---

**Ready for Demo!** 🚀
