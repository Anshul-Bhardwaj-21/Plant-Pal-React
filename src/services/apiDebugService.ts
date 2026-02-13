/**
 * API Debug Service
 * Helps troubleshoot API issues and provides fallback mechanisms
 */

export const checkGeminiAPIKey = (): { valid: boolean; message: string } => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      valid: false,
      message: 'Gemini API key not found. Add VITE_GEMINI_API_KEY to your .env file.'
    };
  }
  
  if (apiKey.length < 20) {
    return {
      valid: false,
      message: 'Gemini API key appears invalid (too short). Check your .env file.'
    };
  }
  
  return {
    valid: true,
    message: 'Gemini API key configured correctly.'
  };
};

export const testGeminiConnection = async (): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        message: 'API key not configured'
      };
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say "API working" if you can read this.');
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      message: `Gemini API connected successfully. Response: ${text.substring(0, 50)}...`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gemini API connection failed: ${error.message}`,
      error
    };
  }
};

export const logIdentificationAttempt = (
  imageSize: { width: number; height: number },
  success: boolean,
  method: 'gemini' | 'local',
  result?: any,
  error?: any
) => {
  const log = {
    timestamp: new Date().toISOString(),
    imageSize,
    success,
    method,
    result: success ? {
      commonName: result?.commonName,
      confidence: result?.confidence
    } : null,
    error: error?.message || null
  };
  
  console.log('[Plant Identification]', log);
  
  // Store in localStorage for debugging
  const logs = JSON.parse(localStorage.getItem('plantpal_debug_logs') || '[]');
  logs.push(log);
  // Keep only last 10 logs
  if (logs.length > 10) logs.shift();
  localStorage.setItem('plantpal_debug_logs', JSON.stringify(logs));
};

export const getDebugLogs = () => {
  return JSON.parse(localStorage.getItem('plantpal_debug_logs') || '[]');
};

export const clearDebugLogs = () => {
  localStorage.removeItem('plantpal_debug_logs');
};
