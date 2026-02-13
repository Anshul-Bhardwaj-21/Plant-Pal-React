import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { checkGeminiAPIKey, testGeminiConnection, getDebugLogs, clearDebugLogs } from '@/services/apiDebugService';

export const DiagnosticTool = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check environment variables
    diagnostics.checks.geminiKey = checkGeminiAPIKey();
    diagnostics.checks.weatherKey = {
      valid: !!import.meta.env.VITE_WEATHER_API_KEY,
      message: import.meta.env.VITE_WEATHER_API_KEY 
        ? 'Weather API key configured' 
        : 'Weather API key missing'
    };
    diagnostics.checks.firebaseKey = {
      valid: !!import.meta.env.VITE_FIREBASE_API_KEY,
      message: import.meta.env.VITE_FIREBASE_API_KEY 
        ? 'Firebase API key configured' 
        : 'Firebase API key missing'
    };

    // Test Gemini connection
    if (diagnostics.checks.geminiKey.valid) {
      diagnostics.checks.geminiConnection = await testGeminiConnection();
    } else {
      diagnostics.checks.geminiConnection = {
        success: false,
        message: 'Skipped - API key not configured'
      };
    }

    // Check browser capabilities
    diagnostics.checks.camera = {
      valid: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      message: navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ? 'Camera API available'
        : 'Camera API not supported'
    };

    diagnostics.checks.geolocation = {
      valid: !!navigator.geolocation,
      message: navigator.geolocation
        ? 'Geolocation API available'
        : 'Geolocation API not supported'
    };

    diagnostics.checks.localStorage = {
      valid: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })(),
      message: 'LocalStorage available'
    };

    setResults(diagnostics);
    setLogs(getDebugLogs());
    setTesting(false);
  };

  const StatusIcon = ({ valid }: { valid: boolean }) => {
    if (valid) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            PlantPal Diagnostic Tool
          </CardTitle>
          <CardDescription>
            Verify your setup and troubleshoot issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={testing} className="flex-1">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Diagnostics
                </>
              )}
            </Button>
            {logs.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  clearDebugLogs();
                  setLogs([]);
                }}
              >
                Clear Logs
              </Button>
            )}
          </div>

          {results && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Diagnostic completed at {new Date(results.timestamp).toLocaleString()}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Configuration Checks</h3>
                
                {Object.entries(results.checks).map(([key, check]: [string, any]) => (
                  <div key={key} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <StatusIcon valid={check.valid || check.success} />
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                      {check.error && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {check.error.message || JSON.stringify(check.error)}
                        </p>
                      )}
                    </div>
                    <Badge variant={check.valid || check.success ? 'default' : 'destructive'}>
                      {check.valid || check.success ? 'OK' : 'FAIL'}
                    </Badge>
                  </div>
                ))}
              </div>

              {!results.checks.geminiKey.valid && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Action Required:</strong> Create a <code>.env</code> file in your project root with:
                    <pre className="mt-2 p-2 bg-black/10 rounded text-xs">
                      VITE_GEMINI_API_KEY=your_api_key_here
                    </pre>
                    Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                    <br />
                    <strong>Then restart the development server!</strong>
                  </AlertDescription>
                </Alert>
              )}

              {results.checks.geminiKey.valid && !results.checks.geminiConnection.success && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Gemini API Connection Failed:</strong> {results.checks.geminiConnection.message}
                    <br />
                    Check your API key and internet connection.
                  </AlertDescription>
                </Alert>
              )}

              {logs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Recent Identification Attempts</h3>
                  <div className="space-y-2">
                    {logs.slice().reverse().map((log, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <div className="flex gap-2">
                            <Badge variant={log.success ? 'default' : 'destructive'}>
                              {log.success ? 'Success' : 'Failed'}
                            </Badge>
                            <Badge variant="outline">{log.method}</Badge>
                          </div>
                        </div>
                        {log.result && (
                          <p className="text-muted-foreground">
                            Identified: <strong>{log.result.commonName}</strong> ({log.result.confidence}% confidence)
                          </p>
                        )}
                        {log.error && (
                          <p className="text-red-500 text-xs mt-1">
                            Error: {log.error}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Image: {log.imageSize.width}x{log.imageSize.height}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!results && (
            <Alert>
              <AlertDescription>
                Click "Run Diagnostics" to check your PlantPal configuration and identify any issues.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Fixes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🔑 Missing API Keys</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Create <code>.env</code> file in project root</li>
                <li>Copy from <code>.env.example</code></li>
                <li>Add your actual API keys</li>
                <li>Restart dev server: <code>npm run dev</code></li>
              </ol>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🔄 Inconsistent Results</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Verify Gemini API key is configured</li>
                <li>Check browser console for errors</li>
                <li>Ensure good image quality</li>
                <li>Test with same image multiple times</li>
              </ol>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">📸 Camera Issues</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Grant camera permissions</li>
                <li>Use HTTPS (required for camera)</li>
                <li>Try different browser</li>
                <li>Check camera is not in use</li>
              </ol>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">🌤️ Weather Not Loading</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Allow location permissions</li>
                <li>Add Weather API key to <code>.env</code></li>
                <li>Wait 10-15 min after creating API key</li>
                <li>Check OpenWeatherMap dashboard</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
