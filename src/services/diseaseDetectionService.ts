/**
 * Disease Detection Service
 *
 * Priority:
 *  1. Custom trained model  → public/models/plant-disease/model.json
 *  2. Gemini Vision API     → fallback until model is trained
 *
 * Train the model:
 *   node scripts/generate-sample-dataset.js   (sample data)
 *   node scripts/train-model.js               (train)
 */

import * as tf from '@tensorflow/tfjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Must match IMAGE_SIZE in scripts/train-model.js
const MODEL_INPUT_SIZE = 32;

const HEAD_MODEL_PATH = '/models/plant-disease/model.json';
const CLASSES_PATH    = '/models/plant-disease/classes.json';

const DEFAULT_CLASSES = [
  'Healthy', 'Bacterial_Leaf_Spot', 'Early_Blight', 'Late_Blight',
  'Leaf_Mold', 'Septoria_Leaf_Spot', 'Spider_Mites', 'Target_Spot',
  'Yellow_Leaf_Curl_Virus', 'Mosaic_Virus', 'Powdery_Mildew',
  'Rust', 'Anthracnose', 'Black_Spot', 'Root_Rot',
];

const toDisplay = (cls: string) => cls.replace(/_/g, ' ');

let trainedModel: tf.LayersModel | null = null;
let classLabels: string[] = DEFAULT_CLASSES;
let loadAttempted = false;

export const loadModel = async (): Promise<boolean> => {
  if (loadAttempted) return trainedModel !== null;
  loadAttempted = true;
  try {
    trainedModel = await tf.loadLayersModel(HEAD_MODEL_PATH);
    try {
      const res = await fetch(CLASSES_PATH);
      if (res.ok) classLabels = await res.json();
    } catch { /* keep defaults */ }
    console.log('[PlantPal] Custom disease model loaded');
    return true;
  } catch {
    console.log('[PlantPal] No trained model — using Gemini fallback');
    return false;
  }
};

const toTensor = (img: HTMLImageElement): tf.Tensor2D =>
  tf.tidy(() =>
    tf.browser
      .fromPixels(img)
      .resizeBilinear([MODEL_INPUT_SIZE, MODEL_INPUT_SIZE])
      .toFloat()
      .div(255.0)
      .reshape([1, MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3]) as tf.Tensor2D
  );

const detectWithModel = async (img: HTMLImageElement) => {
  const input  = toTensor(img);
  const logits = trainedModel!.predict(input) as tf.Tensor;
  const probs  = await logits.data();
  input.dispose();
  logits.dispose();

  const maxProb = Math.max(...Array.from(probs));
  const maxIdx  = Array.from(probs).indexOf(maxProb);
  return { disease: toDisplay(classLabels[maxIdx] ?? 'Healthy'), confidence: Math.min(maxProb * 100, 100) };
};

const detectWithGemini = async (img: HTMLImageElement) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  canvas.getContext('2d')?.drawImage(img, 0, 0, 512, 512);
  const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

  const labels = DEFAULT_CLASSES.map(toDisplay).join(', ');
  const prompt = `You are a plant pathologist. Identify any disease in this plant image.\nReply ONLY with valid JSON (no markdown):\n{"disease":"<one of: ${labels}>","confidence":<integer 0-100>}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent([prompt, { inlineData: { mimeType: 'image/jpeg', data: base64 } }]);
  const match = result.response.text().match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('Could not parse Gemini response');
  const parsed = JSON.parse(match[0]);
  return { disease: parsed.disease ?? 'Unknown', confidence: parsed.confidence ?? 50 };
};

export type DetectionResult = {
  disease: string;
  confidence: number;
  recommendations: string[];
  source: 'model' | 'gemini' | 'unavailable';
};

export const detectDisease = async (imageElement: HTMLImageElement): Promise<DetectionResult> => {
  const modelReady = await loadModel();
  if (modelReady) {
    try {
      const r = await detectWithModel(imageElement);
      return { ...r, recommendations: getRecommendations(r.disease), source: 'model' };
    } catch (err) { console.error('[PlantPal] Model inference error:', err); }
  }
  try {
    const r = await detectWithGemini(imageElement);
    return { ...r, recommendations: getRecommendations(r.disease), source: 'gemini' };
  } catch (err) { console.error('[PlantPal] Gemini fallback error:', err); }

  return { disease: 'Unable to detect', confidence: 0, recommendations: ['Configure API key or train the model.'], source: 'unavailable' };
};

const getRecommendations = (disease: string): string[] => {
  const map: Record<string, string[]> = {
    'Healthy':             ['Continue regular watering', 'Maintain current light conditions', 'Monitor for changes'],
    'Bacterial Leaf Spot': ['Remove affected leaves', 'Avoid overhead watering', 'Apply copper-based fungicide'],
    'Early Blight':        ['Remove infected leaves', 'Apply fungicide', 'Mulch around base'],
    'Late Blight':         ['Remove infected plants', 'Apply fungicide preventatively', 'Ensure air circulation'],
    'Leaf Mold':           ['Reduce humidity', 'Improve ventilation', 'Remove affected leaves'],
    'Septoria Leaf Spot':  ['Remove infected leaves', 'Mulch to prevent soil splash', 'Apply fungicide'],
    'Spider Mites':        ['Spray with water', 'Apply insecticidal soap', 'Increase humidity'],
    'Powdery Mildew':      ['Improve air circulation', 'Reduce humidity', 'Apply sulfur or neem oil'],
    'Rust':                ['Remove infected leaves', 'Apply fungicide', 'Avoid overhead watering'],
  };
  return map[disease] ?? ['Monitor plant closely', 'Isolate from other plants', 'Consult a plant expert'];
};
