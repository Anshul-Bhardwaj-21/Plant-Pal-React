# PlantPal Quick Start Guide

## 🚀 What's New

PlantPal now features a **hybrid AI plant identification system** that combines:
- **Local Visual Classification**: Fast, client-side plant recognition
- **Gemini AI Enhancement**: Detailed care instructions and insights
- **Comprehensive Plant Database**: 15+ pre-configured plants with full data

## 📸 How It Works

### 1. Capture Plant Photo
- Open "Add Plant" page
- Click "Scan Plant" tab
- Take a photo or upload an image

### 2. Automatic Identification
The system performs three steps:
1. **Visual Analysis**: Extracts color, texture, and shape features
2. **Local Classification**: Matches features against plant database
3. **AI Enhancement**: Gemini provides detailed information

### 3. Get Comprehensive Results
- Scientific and common names
- Plant family and species
- Confidence score
- AI-generated description
- Personalized care instructions
- Interesting facts
- Seasonal tips
- Safety/toxicity information

## 🌱 Supported Plants

The app recognizes 15 common plants:
- **Indoor**: Monstera, Snake Plant, Pothos, Peace Lily, Rubber Plant, ZZ Plant, Fiddle Leaf Fig, Spider Plant, Boston Fern
- **Succulents**: Aloe Vera, Prickly Pear Cactus
- **Herbs**: Basil, Lavender
- **Vegetables**: Tomato
- **Flowers**: Rose

## 🎯 Key Features

### AI-Powered Identification
- Automatic plant recognition from photos
- 65-95% confidence scoring
- Detailed AI analysis of plant condition
- Age estimation from image

### Comprehensive Plant Profiles
- Health score (0-100)
- Care score tracking
- Visual analytics and graphs
- Complete care history
- Disease tracking

### Gamification
- Earn badges for consistent care
- Track achievements
- Monitor progress
- Compete with yourself

### Smart Features
- Weather integration
- AI chat assistant
- Disease detection
- Care reminders

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_WEATHER_API_KEY=your_weather_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Browser
Navigate to `http://localhost:5173`

## 📚 Documentation

- **README.md**: Complete feature documentation
- **MODEL_TRAINING_GUIDE.md**: Train custom models
- **FEATURES.md**: Detailed feature descriptions
- **API_SETUP_GUIDE.md**: API configuration
- **IMPLEMENTATION_STATUS.md**: Development status

## 🎓 Usage Examples

### Add a Plant with AI
1. Click "Add Plant"
2. Select "Scan Plant" tab
3. Take photo of your plant
4. Review AI identification
5. Edit details if needed
6. Click "Add Plant"

### Track Plant Health
1. Open plant details
2. View "Health" tab
3. See 30-day health trend
4. Check care activity
5. Monitor watering schedule

### Detect Diseases
1. Open plant details
2. Scroll to "Disease Scanner"
3. Capture plant photo
4. View detection results
5. Follow recommendations

### Earn Badges
1. Water plants consistently
2. Perform disease checks
3. Maintain high health scores
4. Grow your collection
5. View badges in plant profile

## 🔬 Model Architecture

### Visual Feature Extraction
- Dominant color analysis
- Green pixel ratio calculation
- Texture complexity measurement
- Brightness analysis

### Classification Process
1. Extract visual features from image
2. Score each plant in database
3. Select best match
4. Calculate confidence

### AI Enhancement
1. Send image to Gemini AI
2. Request detailed analysis
3. Get care instructions
4. Receive interesting facts

## 🎨 Customization

### Add New Plants
Edit `src/data/plantDatabase.ts`:
```typescript
{
  id: 'your-plant-id',
  commonName: 'Your Plant',
  scientificName: 'Plantus yourplantus',
  // ... add all required fields
}
```

### Train Custom Model
See `MODEL_TRAINING_GUIDE.md` for:
- Dataset preparation
- Model training
- Integration steps
- Performance optimization

## 🐛 Troubleshooting

### Camera Not Working
- Grant browser camera permissions
- Use HTTPS (required for camera)
- Try different browser

### Identification Fails
- Ensure good image quality
- Check Gemini API key
- Verify internet connection

### Low Confidence Scores
- Take clearer photos
- Ensure good lighting
- Include distinctive features
- Try multiple angles

## 📊 Performance Tips

### Better Identification
- ✅ Clear, focused images
- ✅ Good lighting
- ✅ Plant fills frame
- ✅ Show distinctive features
- ❌ Avoid blurry images
- ❌ Avoid poor lighting
- ❌ Avoid cluttered backgrounds

### Faster Loading
- Use compressed images
- Enable caching
- Optimize network

## 🤝 Contributing

Want to improve PlantPal?
1. Add more plants to database
2. Improve classification algorithm
3. Train better models
4. Submit feedback
5. Report issues

## 📞 Support

- Check documentation files
- Review troubleshooting section
- Open GitHub issue
- Contact support

## 🌟 What's Next

- [ ] More plant species
- [ ] Better classification accuracy
- [ ] Offline mode
- [ ] Mobile app
- [ ] Community features
- [ ] Social sharing
- [ ] Advanced analytics

---

**Happy Planting! 🌱**
