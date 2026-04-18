/**
 * Sample Dataset Generator
 *
 * Creates synthetic plant leaf images for each disease class
 * so you can run training immediately without a real dataset.
 *
 * Each class gets visually distinct images (different colors/patterns)
 * so the model can actually learn to distinguish them.
 *
 * Run:
 *   node scripts/generate-sample-dataset.js
 *
 * Then train:
 *   node scripts/train-model.js
 *
 * NOTE: Replace with real PlantVillage images for production accuracy.
 */

import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, '..', 'training-data');
const IMG_SIZE  = 224;
const IMAGES_PER_CLASS = 40; // enough to train, fast to generate

// Each class has a distinct base color + pattern so the CNN can learn
const CLASSES = [
  { name: 'Healthy',              r: 34,  g: 139, b: 34,  pattern: 'solid'   },
  { name: 'Bacterial_Leaf_Spot',  r: 101, g: 67,  b: 33,  pattern: 'spots'   },
  { name: 'Early_Blight',         r: 139, g: 90,  b: 43,  pattern: 'rings'   },
  { name: 'Late_Blight',          r: 64,  g: 64,  b: 64,  pattern: 'blotch'  },
  { name: 'Leaf_Mold',            r: 107, g: 142, b: 35,  pattern: 'fuzzy'   },
  { name: 'Septoria_Leaf_Spot',   r: 160, g: 82,  b: 45,  pattern: 'dots'    },
  { name: 'Spider_Mites',         r: 188, g: 143, b: 143, pattern: 'web'     },
  { name: 'Target_Spot',          r: 139, g: 69,  b: 19,  pattern: 'target'  },
  { name: 'Yellow_Leaf_Curl_Virus',r: 210, g: 180, b: 40,  pattern: 'curl'   },
  { name: 'Mosaic_Virus',         r: 85,  g: 107, b: 47,  pattern: 'mosaic'  },
  { name: 'Powdery_Mildew',       r: 220, g: 220, b: 210, pattern: 'powder'  },
  { name: 'Rust',                 r: 183, g: 65,  b: 14,  pattern: 'rust'    },
  { name: 'Anthracnose',          r: 50,  g: 50,  b: 50,  pattern: 'dark'    },
  { name: 'Black_Spot',           r: 20,  g: 20,  b: 20,  pattern: 'black'   },
  { name: 'Root_Rot',             r: 101, g: 55,  b: 0,   pattern: 'rot'     },
];

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

/** Fill image with base leaf color + noise */
function fillBase(img, r, g, b, seed) {
  img.scan(0, 0, IMG_SIZE, IMG_SIZE, function (x, y, idx) {
    const noise = ((x * 7 + y * 13 + seed * 31) % 40) - 20;
    this.bitmap.data[idx]     = clamp(r + noise);
    this.bitmap.data[idx + 1] = clamp(g + noise);
    this.bitmap.data[idx + 2] = clamp(b + noise);
    this.bitmap.data[idx + 3] = 255;
  });
}

/** Draw pattern on top to make classes visually distinct */
function applyPattern(img, pattern, seed) {
  const rng = (n) => ((seed * 1103515245 + n * 12345) >>> 0) % 256;

  img.scan(0, 0, IMG_SIZE, IMG_SIZE, function (x, y, idx) {
    let modify = false;

    switch (pattern) {
      case 'spots':
        modify = ((x + seed * 3) % 30 < 8) && ((y + seed * 5) % 30 < 8);
        break;
      case 'rings':
        { const cx = IMG_SIZE / 2, cy = IMG_SIZE / 2;
          const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          modify = (d % 25) < 5; }
        break;
      case 'blotch':
        modify = ((x * y + seed) % 50) < 15;
        break;
      case 'fuzzy':
        modify = rng(x + y) < 80;
        break;
      case 'dots':
        modify = ((x % 15 < 4) && (y % 15 < 4));
        break;
      case 'web':
        modify = (x % 20 === 0) || (y % 20 === 0);
        break;
      case 'target':
        { const cx = IMG_SIZE / 2, cy = IMG_SIZE / 2;
          const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          modify = d < 40 || (d > 60 && d < 80); }
        break;
      case 'curl':
        modify = (Math.sin((x + seed) / 15) * 20 + y) % 30 < 8;
        break;
      case 'mosaic':
        modify = (Math.floor(x / 20) + Math.floor(y / 20)) % 2 === 0;
        break;
      case 'powder':
        modify = rng(x * 3 + y) < 120;
        break;
      case 'rust':
        modify = ((x + y + seed) % 18) < 6;
        break;
      case 'dark':
        modify = rng(x + y * 2) < 60;
        break;
      case 'black':
        modify = rng(x * 2 + y) < 100;
        break;
      case 'rot':
        modify = ((x * y) % 40) < 12;
        break;
    }

    if (modify) {
      this.bitmap.data[idx]     = clamp(this.bitmap.data[idx]     - 60);
      this.bitmap.data[idx + 1] = clamp(this.bitmap.data[idx + 1] - 40);
      this.bitmap.data[idx + 2] = clamp(this.bitmap.data[idx + 2] + 20);
    }
  });
}

async function generateClass(cls, count) {
  const dir = path.join(DATA_DIR, cls.name);
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < count; i++) {
    const seed = i * 17 + cls.r;
    const img  = new Jimp(IMG_SIZE, IMG_SIZE);

    fillBase(img, cls.r, cls.g, cls.b, seed);
    applyPattern(img, cls.pattern, seed);

    // Slight rotation/brightness variation per image
    img.brightness((seed % 20 - 10) / 100);

    const filePath = path.join(dir, `sample_${String(i + 1).padStart(3, '0')}.jpg`);
    await img.writeAsync(filePath);
  }

  console.log(`  ✅ ${cls.name.padEnd(28)} ${count} images`);
}

async function main() {
  console.log('=== Generating Sample Dataset ===\n');
  console.log(`Output: ${DATA_DIR}`);
  console.log(`Images per class: ${IMAGES_PER_CLASS}\n`);

  for (const cls of CLASSES) {
    await generateClass(cls, IMAGES_PER_CLASS);
  }

  const total = CLASSES.length * IMAGES_PER_CLASS;
  console.log(`\n✅ Done — ${total} images across ${CLASSES.length} classes`);
  console.log('\nNow run:  node scripts/train-model.js\n');
}

main().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
