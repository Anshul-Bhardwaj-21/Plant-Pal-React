/**
 * PlantPal - Plant Disease Model Training Script
 *
 * Works on ANY Node version — no native compilation needed.
 * Uses: @tensorflow/tfjs (pure JS) + jimp (pure JS image loading)
 *
 * Dataset structure:
 *   training-data/
 *     Healthy/           ← folder name = class label
 *       img001.jpg
 *     Early_Blight/
 *       img001.jpg
 *     ...
 *
 * Setup (one time):
 *   npm install jimp@0.22.12 --save-dev
 *
 * Run:
 *   node scripts/train-model.js
 *
 * Output:
 *   public/models/plant-disease/model.json
 *   public/models/plant-disease/classes.json
 */

import * as tf from '@tensorflow/tfjs';
import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ────────────────────────────────────────────────────────────────
const IMAGE_SIZE  = 32;   // 32×32 — fast on CPU, upgrade to 64/224 with tfjs-node
const BATCH_SIZE  = 32;
const EPOCHS      = 25;
const LR          = 0.001;
const TRAIN_SPLIT = 0.8;
const DATA_DIR    = path.join(__dirname, '..', 'training-data');
const OUTPUT_DIR  = path.join(__dirname, '..', 'public', 'models', 'plant-disease');
// ──────────────────────────────────────────────────────────────────────────

/** Load image → flat Float32Array [224*224*3], normalised [0,1] */
async function loadImageData(imagePath) {
  const img = await Jimp.read(imagePath);
  img.resize(IMAGE_SIZE, IMAGE_SIZE);

  const pixels = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);
  let idx = 0;
  img.scan(0, 0, IMAGE_SIZE, IMAGE_SIZE, function (x, y, offset) {
    pixels[idx++] = this.bitmap.data[offset]     / 255; // R
    pixels[idx++] = this.bitmap.data[offset + 1] / 255; // G
    pixels[idx++] = this.bitmap.data[offset + 2] / 255; // B
  });
  return pixels;
}

/** Walk DATA_DIR, return { allPixels, labels, classes } */
async function loadDataset() {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(
      `training-data/ not found.\nCreate it with one sub-folder per class:\n` +
      `  training-data/Healthy/\n  training-data/Early_Blight/\n  ...`
    );
  }

  const classes = fs
    .readdirSync(DATA_DIR)
    .filter(f => fs.statSync(path.join(DATA_DIR, f)).isDirectory())
    .sort();

  if (classes.length < 2) {
    throw new Error('Need at least 2 class folders in training-data/');
  }

  console.log(`\nClasses found (${classes.length}):`);
  classes.forEach(c => console.log(`  • ${c}`));

  const allPixels = [];
  const labels    = [];

  for (let ci = 0; ci < classes.length; ci++) {
    const classDir = path.join(DATA_DIR, classes[ci]);
    const files = fs
      .readdirSync(classDir)
      .filter(f => /\.(jpe?g|png|bmp|webp)$/i.test(f));

    process.stdout.write(`\nLoading ${classes[ci]} (${files.length} images)... `);

    for (const file of files) {
      try {
        const pixels = await loadImageData(path.join(classDir, file));
        allPixels.push(pixels);
        labels.push(ci);
        process.stdout.write('.');
      } catch (e) {
        process.stdout.write('x');
      }
    }
  }

  console.log(`\n\nTotal loaded: ${allPixels.length} images`);
  return { allPixels, labels, classes };
}

/** Lightweight model — fast on CPU, good enough for sample data.
 *  Upgrade to CNN when using real PlantVillage dataset + tfjs-node. */
function buildModel(numClasses) {
  const inputDim = IMAGE_SIZE * IMAGE_SIZE * 3;
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [inputDim], units: 512, activation: 'relu' }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.4 }),
      tf.layers.dense({ units: 256, activation: 'relu' }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ units: 128, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: numClasses, activation: 'softmax' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(LR),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  model.summary();
  return model;
}

async function main() {
  console.log('=== PlantPal Disease Model Training ===');
  console.log(`TF.js backend: ${tf.getBackend()}`);

  // 1. Load dataset
  const { allPixels, labels, classes } = await loadDataset();
  const N = allPixels.length;

  if (N < 4) {
    throw new Error(`Only ${N} images. Need at least 4 (ideally 50+ per class).`);
  }

  // 2. Shuffle
  const order = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const shuffledPixels = order.map(i => allPixels[i]);
  const shuffledLabels = order.map(i => labels[i]);

  // 3. Build tensors — flatten to 1D per image for dense model
  console.log('\nBuilding tensors...');
  const flatDim = IMAGE_SIZE * IMAGE_SIZE * 3;
  const xs = tf.tensor2d(
    new Float32Array(shuffledPixels.flatMap(p => Array.from(p))),
    [N, flatDim]
  );
  const ys = tf.oneHot(tf.tensor1d(shuffledLabels, 'int32'), classes.length);

  // 4. Split
  const splitAt = Math.floor(N * TRAIN_SPLIT);
  const xTrain  = xs.slice([0, 0],       [splitAt, -1]);
  const yTrain  = ys.slice([0, 0],       [splitAt, -1]);
  const xVal    = xs.slice([splitAt, 0], [-1, -1]);
  const yVal    = ys.slice([splitAt, 0], [-1, -1]);
  xs.dispose();
  ys.dispose();

  console.log(`Train: ${splitAt}  |  Val: ${N - splitAt}`);

  // 5. Build model
  const model = buildModel(classes.length);

  // 6. Train
  console.log(`\nTraining ${EPOCHS} epochs (batch=${BATCH_SIZE}, lr=${LR})...\n`);
  await model.fit(xTrain, yTrain, {
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    validationData: [xVal, yVal],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        const e   = String(epoch + 1).padStart(2);
        const acc = (logs.acc     * 100).toFixed(1);
        const va  = (logs.val_acc * 100).toFixed(1);
        console.log(
          `  Epoch ${e}/${EPOCHS}` +
          `  loss=${logs.loss.toFixed(4)}  acc=${acc}%` +
          `  val_loss=${logs.val_loss.toFixed(4)}  val_acc=${va}%`
        );
      },
    },
  });

  xTrain.dispose();
  yTrain.dispose();
  xVal.dispose();
  yVal.dispose();

  // 7. Save model using Node fs (no tfjs-node required)
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Serialize model to JSON + binary weights
  const saveResult = await model.save(tf.io.withSaveHandler(async (artifacts) => {
    // Write model topology
    const modelJSON = {
      modelTopology: artifacts.modelTopology,
      weightsManifest: [{
        paths: ['weights.bin'],
        weights: artifacts.weightSpecs,
      }],
      format: artifacts.format,
      generatedBy: artifacts.generatedBy,
      convertedBy: artifacts.convertedBy,
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'model.json'),
      JSON.stringify(modelJSON)
    );

    // Write weight data
    const weightData = artifacts.weightData;
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'weights.bin'),
      Buffer.from(weightData)
    );

    return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
  }));
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'classes.json'),
    JSON.stringify(classes, null, 2)
  );

  console.log(`\n✅ Model  → ${OUTPUT_DIR}/model.json`);
  console.log(`✅ Labels → ${OUTPUT_DIR}/classes.json`);
  console.log('\nRun  npm run dev  — app will auto-load the trained model.\n');
}

main().catch(err => {
  console.error('\n❌ Training failed:', err.message);
  process.exit(1);
});
