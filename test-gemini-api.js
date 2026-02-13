/**
 * Gemini API Test Script
 * Run this to verify your Gemini API key is working correctly
 * 
 * Usage: node test-gemini-api.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Load API key from environment
const API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyDH9_3NE_chAdFgnEonNQSQjwBACBJyT-Y';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Connection...\n');
  
  try {
    // Initialize the API
    console.log('1️⃣ Initializing GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✅ API initialized\n');
    
    // Get the model
    console.log('2️⃣ Getting Gemini 1.5 Flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Model loaded\n');
    
    // Test 1: Simple text generation
    console.log('3️⃣ Test 1: Simple text generation');
    console.log('Prompt: "Explain how AI works in a few words"');
    const result1 = await model.generateContent('Explain how AI works in a few words');
    const response1 = await result1.response;
    console.log('Response:', response1.text());
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Structured contents
    console.log('4️⃣ Test 2: Structured contents format');
    const result2 = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'What are the top 3 benefits of indoor plants?' }]
        }
      ]
    });
    const response2 = await result2.response;
    console.log('Response:', response2.text());
    console.log('✅ Test 2 passed\n');
    
    // Test 3: Plant identification prompt (similar to your app)
    console.log('5️⃣ Test 3: Plant care advice (app-like prompt)');
    const plantPrompt = `You are a professional botanist. Provide care advice for a Monstera plant.

Respond in JSON format:
{
  "commonName": "Monstera",
  "careInstructions": ["instruction 1", "instruction 2", "instruction 3"],
  "interestingFacts": ["fact 1", "fact 2"]
}`;
    
    const result3 = await model.generateContent(plantPrompt);
    const response3 = await result3.response;
    console.log('Response:', response3.text());
    console.log('✅ Test 3 passed\n');
    
    console.log('🎉 All tests passed! Your Gemini API is working correctly.\n');
    console.log('✅ Your PlantPal app should work perfectly now!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n💡 Fix: Check your API key in .env file');
      console.error('   Make sure VITE_GEMINI_API_KEY is set correctly');
    } else if (error.message.includes('quota')) {
      console.error('\n💡 Fix: API quota exceeded. Wait a minute and try again.');
    } else if (error.message.includes('400')) {
      console.error('\n💡 Fix: Invalid request format. Check the API documentation.');
    } else {
      console.error('\n💡 Check your internet connection and API key');
    }
    
    process.exit(1);
  }
}

// Run the test
testGeminiAPI();
