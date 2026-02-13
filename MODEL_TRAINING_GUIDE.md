# Plant Identification Model Training Guide

This guide explains how to train a custom TensorFlow.js model for plant identification in PlantPal.

## Overview

PlantPal uses a hybrid approach for plant identification:
1. **Local Classification**: Fast, client-side classification using visual features
2. **Gemini AI Enhancement**: Detailed information retrieval and contextual analysis
3. **Plant Database**: 15+ pre-configured plants with comprehensive data

## Current Implementation

### Plant Database (`src/data/plantDatabase.ts`)

The app includes a comprehensive database of 15 common plants:
- Monstera
- Snake Plant
- Pothos
- Aloe Vera
- Spider Plant
- Peace Lily
- Rubber Plant
- ZZ Plant
- Fiddle Leaf Fig
- Basil
- Tomato
- Lavender
- Rose
- Prickly Pear Cactus
- Boston Fern

Each plant includes:
- Scientific and common names
- Visual features (leaf shape, color, texture)
- Care requirements (water, sunlight, temperature, humidity)
- Characteristics and benefits
- Common issues
- Toxicity information

### Visual Feature Extraction

The system extracts these features from plant images:
- **Dominant Colors**: RGB analysis to identify primary colors
- **Green Ratio**: Percentage of green pixels (foliage detection)
- **Texture Complexity**: Color distribution complexity
- **Average Brightness**: Overall image brightness

### Classification Algorithm

The local classifier scores each plant in the database based on:
1. Green ratio matching (succulents vs leafy plants)
2. Brightness matching (dark vs bright foliage)
3. Texture complexity (glossy vs fuzzy leaves)
4. Plant type characteristics

## Training a Custom TensorFlow.js Model

### Step 1: Collect Training Data

#### Dataset Structure
```
training-data/
├── monstera/
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
├── snake-plant/
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
└── [other-plants]/
    └── ...
```

#### Requirements
- **Minimum**: 100 images per plant species
- **Recommended**: 500+ images per species
- **Image Quality**: Clear, well-lit photos
- **Variety**: Different angles, growth stages, lighting conditions
- **Resolution**: 224x224 pixels (will be resized)

#### Data Sources
- Your own photos
- Public datasets (PlantCLEF, iNaturalist)
- Creative Commons images
- Community contributions

### Step 2: Prepare the Dataset

#### Install Dependencies
```bash
npm install @tensorflow/tfjs-node
npm install @tensorflow/tfjs-converter
npm install sharp  # For image processing
```

#### Create Data Preparation Script

```javascript
// scripts/prepare-dataset.js
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_SIZE = 224;
const TRAIN_SPLIT = 0.8;

async function loadAndProcessImage(imagePath) {
  const imageBuffer = await sharp(imagePath)
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .toBuffer();
  
  const tensor = tf.node.decodeImage(imageBuffer, 3);
  return tensor.div(255.0); // Normalize to [0, 1]
}

async function prepareDataset(dataDir) {
  const classes = fs.readdirSync(dataDir);
  const data = [];
  const labels = [];
  
  for (let classIdx = 0; classIdx < classes.length; classIdx++) {
    const className = classes[classIdx];
    const classDir = path.join(dataDir, className);
    const images = fs.readdirSync(classDir);
    
    for (const image of images) {
      const imagePath = path.join(classDir, image);
      const tensor = await loadAndProcessImage(imagePath);
      data.push(tensor);
      labels.push(classIdx);
    }
  }
  
  return {
    data: tf.stack(data),
    labels: tf.oneHot(tf.tensor1d(labels, 'int32'), classes.length),
    classes
  };
}

module.exports = { prepareDataset };
```

### Step 3: Train the Model

#### Create Training Script

```javascript
// scripts/train-model.js
const tf = require('@tensorflow/tfjs-node');
const { prepareDataset } = require('./prepare-dataset');

async function createModel(numClasses) {
  // Use MobileNetV2 as base (transfer learning)
  const mobilenet = await tf.loadLayersModel(
    'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/feature_vector/3/default/1',
    { fromTFHub: true }
  );
  
  // Freeze base model layers
  mobilenet.layers.forEach(layer => {
    layer.trainable = false;
  });
  
  // Add custom classification layers
  const model = tf.sequential({
    layers: [
      tf.layers.inputLayer({ inputShape: [224, 224, 3] }),
      mobilenet,
      tf.layers.dropout({ rate: 0.5 }),
      tf.layers.dense({ units: 128, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ units: numClasses, activation: 'softmax' })
    ]
  });
  
  model.compile({
    optimizer: tf.train.adam(0.0001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}

async function trainModel() {
  console.log('Loading dataset...');
  const { data, labels, classes } = await prepareDataset('./training-data');
  
  console.log('Creating model...');
  const model = await createModel(classes.length);
  
  console.log('Training model...');
  await model.fit(data, labels, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
      }
    }
  });
  
  console.log('Saving model...');
  await model.save('file://./public/models/plant-classifier');
  
  // Save class labels
  fs.writeFileSync(
    './public/models/plant-classifier/classes.json',
    JSON.stringify(classes)
  );
  
  console.log('Training complete!');
}

trainModel().catch(console.error);
```

#### Run Training
```bash
node scripts/train-model.js
```

### Step 4: Integrate Trained Model

#### Update Plant Identification Service

```javascript
// src/services/plantIdentificationService.ts

let model: tf.LayersModel | null = null;
let classLabels: string[] = [];

export const loadPlantModel = async (): Promise<void> => {
  try {
    // Load your trained model
    model = await tf.loadLayersModel('/models/plant-classifier/model.json');
    
    // Load class labels
    const response = await fetch('/models/plant-classifier/classes.json');
    classLabels = await response.json();
    
    console.log('Plant classification model loaded successfully');
  } catch (error) {
    console.error('Error loading plant model:', error);
  }
};

const classifyPlantWithModel = async (imageElement: HTMLImageElement): Promise<{
  plantId: string;
  confidence: number;
}> => {
  if (!model) {
    throw new Error('Model not loaded');
  }
  
  // Preprocess image
  const tensor = tf.browser
    .fromPixels(imageElement)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims(0);
  
  // Make prediction
  const predictions = await model.predict(tensor) as tf.Tensor;
  const probabilities = await predictions.data();
  
  // Get top prediction
  const maxProb = Math.max(...Array.from(probabilities));
  const maxIndex = Array.from(probabilities).indexOf(maxProb);
  
  tensor.dispose();
  predictions.dispose();
  
  return {
    plantId: classLabels[maxIndex],
    confidence: maxProb * 100
  };
};
```

## Model Performance Optimization

### Data Augmentation

Add variety to your training data:

```javascript
async function augmentImage(tensor) {
  // Random flip
  if (Math.random() > 0.5) {
    tensor = tf.image.flipLeftRight(tensor);
  }
  
  // Random brightness
  const brightness = tf.randomUniform([1], -0.2, 0.2);
  tensor = tf.image.adjustBrightness(tensor, brightness);
  
  // Random contrast
  const contrast = tf.randomUniform([1], 0.8, 1.2);
  tensor = tf.image.adjustContrast(tensor, contrast);
  
  // Random rotation (small angles)
  const angle = tf.randomUniform([1], -0.1, 0.1);
  tensor = tf.image.rotateWithOffset(tensor, angle);
  
  return tensor;
}
```

### Transfer Learning

Use pre-trained models for better accuracy:

1. **MobileNetV2**: Fast, mobile-optimized (recommended)
2. **ResNet50**: Higher accuracy, larger size
3. **EfficientNet**: Best accuracy/size trade-off

### Model Compression

Reduce model size for faster loading:

```bash
# Convert to TensorFlow.js format with quantization
tensorflowjs_converter \
  --input_format=keras \
  --output_format=tfjs_layers_model \
  --quantization_bytes=2 \
  ./model.h5 \
  ./public/models/plant-classifier
```

## Testing and Validation

### Create Test Script

```javascript
// scripts/test-model.js
async function testModel() {
  const model = await tf.loadLayersModel('./public/models/plant-classifier/model.json');
  const testData = await prepareDataset('./test-data');
  
  const evaluation = model.evaluate(testData.data, testData.labels);
  const [loss, accuracy] = await Promise.all([
    evaluation[0].data(),
    evaluation[1].data()
  ]);
  
  console.log(`Test Loss: ${loss[0].toFixed(4)}`);
  console.log(`Test Accuracy: ${(accuracy[0] * 100).toFixed(2)}%`);
}
```

### Confusion Matrix

```javascript
async function generateConfusionMatrix(model, testData) {
  const predictions = model.predict(testData.data);
  const predClasses = predictions.argMax(-1);
  const trueClasses = testData.labels.argMax(-1);
  
  // Calculate confusion matrix
  const confusionMatrix = await tf.math.confusionMatrix(
    trueClasses,
    predClasses,
    testData.classes.length
  );
  
  console.log('Confusion Matrix:');
  confusionMatrix.print();
}
```

## Deployment

### Model Files Structure
```
public/
└── models/
    └── plant-classifier/
        ├── model.json          # Model architecture
        ├── group1-shard1of1.bin  # Model weights
        └── classes.json        # Class labels
```

### Loading in Production

The model is automatically loaded when the app starts:

```javascript
// In plantIdentificationService.ts
loadPlantModel(); // Called on module load
```

## Continuous Improvement

### Collect User Feedback

Add feedback mechanism to improve model:

```javascript
export const submitFeedback = async (
  imageId: string,
  predictedClass: string,
  actualClass: string,
  correct: boolean
) => {
  // Store feedback for retraining
  await db.collection('model-feedback').add({
    imageId,
    predictedClass,
    actualClass,
    correct,
    timestamp: new Date()
  });
};
```

### Retrain Periodically

1. Collect misclassified images
2. Add to training dataset
3. Retrain model
4. Validate improvements
5. Deploy updated model

## Best Practices

### Image Quality
- ✅ Clear, focused images
- ✅ Good lighting
- ✅ Plant fills frame
- ✅ Multiple angles
- ❌ Blurry images
- ❌ Poor lighting
- ❌ Cluttered background

### Dataset Balance
- Equal number of images per class
- Diverse growth stages
- Various lighting conditions
- Different camera angles

### Model Monitoring
- Track prediction confidence
- Monitor accuracy over time
- Collect edge cases
- Regular retraining

## Troubleshooting

### Low Accuracy
- Increase training data
- Use data augmentation
- Try different base models
- Adjust learning rate

### Slow Inference
- Use model quantization
- Reduce model size
- Use MobileNet instead of ResNet
- Implement caching

### Memory Issues
- Reduce batch size
- Use smaller images
- Dispose tensors properly
- Implement lazy loading

## Resources

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Transfer Learning Guide](https://www.tensorflow.org/tutorials/images/transfer_learning)
- [PlantCLEF Dataset](https://www.imageclef.org/lifeclef/2023/plant)
- [iNaturalist Dataset](https://www.inaturalist.org/)

## Next Steps

1. Collect more training data
2. Train initial model
3. Test and validate
4. Deploy to production
5. Monitor performance
6. Iterate and improve

---

For questions or issues, please refer to the main README.md or open an issue on GitHub.
