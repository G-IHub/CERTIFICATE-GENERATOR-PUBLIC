import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BackendStatusIndicatorProps {
  className?: string;
}

export default function BackendStatusIndicator({ className = '' }: BackendStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkBackendHealth = async () => {
    setStatus('checking');
    setErrorMessage('');
    
    try {
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (allows for cold starts)
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('online');
        setLastCheck(new Date());
      } else {
        // Try to get error details
        const errorText = await response.text().catch(() => 'No error details');
        console.error('❌ Backend health check failed:', response.status, response.statusText);
        console.error('❌ Error body:', errorText);
        console.error('❌ Response headers:', Array.from(response.headers.entries()));
        
        setStatus('offline');
        let errorMsg = `Server returned ${response.status}`;
        if (response.status === 401) {
          errorMsg = '401 Unauthorized - Health endpoint should not require auth. Backend may need redeployment.';
        }
        setErrorMessage(errorMsg);
        setLastCheck(new Date());
      }
    } catch (error: any) {
      console.error('❌ Backend health check error:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      setStatus('offline');
      if (error.name === 'AbortError') {
        setErrorMessage('Connection timeout (15s) - Edge Function may not be deployed or is not responding. Check deployment status.');
      } else if (error.message?.includes('Failed to fetch')) {
        setErrorMessage('Network error - Cannot reach Edge Function. Check if it\'s deployed.');
      } else {
        setErrorMessage(error.message || 'Cannot connect to server');
      }
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkBackendHealth();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLastCheck = () => {
    if (!lastCheck) return '';
    const seconds = Math.floor((Date.now() - lastCheck.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (status === 'checking') {
    return (
      <div className={className}>
        <Alert className="bg-blue-50 border-blue-200">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <AlertDescription className="ml-2 text-blue-800">
            Checking backend status...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'offline') {
    // Determine error type for better messaging
    const is401 = errorMessage.includes('401');
    const isTimeout = errorMessage.includes('timeout');
    const isNetworkError = errorMessage.includes('Network error');
    const needsDeployment = isTimeout || isNetworkError || is401;
    
    return (
      <div className={className}>
        <Alert className={is401 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}>
          <AlertCircle className={`w-4 h-4 ${is401 ? 'text-yellow-600' : 'text-red-600'}`} />
          <AlertDescription className="ml-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`${is401 ? 'text-yellow-800' : 'text-red-800'} mb-1`}>
                  <strong>
                    {isTimeout ? 'Backend timeout - Edge Function not responding' :
                     isNetworkError ? 'Backend unreachable - Edge Function not deployed' :
                     is401 ? 'Backend auth issue (401)' : 
                     'Backend server is offline'}
                  </strong>
                </p>
                <p className={`${is401 ? 'text-yellow-700' : 'text-red-700'} text-xs`}>
                  {errorMessage || 'Cannot connect to server'}
                  {lastCheck && ` (checked ${formatLastCheck()})`}
                </p>
                <p className={`${is401 ? 'text-yellow-700' : 'text-red-700'} text-xs mt-1`}>
                  {needsDeployment 
                    ? '⚠️ Run: npx supabase functions deploy make-server-a611b057'
                    : 'Check backend status and logs.'}
                </p>
              </div>
              <Button 
                onClick={checkBackendHealth}
                variant="outline" 
                size="sm"
                className={`flex-shrink-0 ${is401 ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' : 'border-red-300 text-red-700 hover:bg-red-100'}`}
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Online status - show minimal success indicator
  return (
    <div className={className}>
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertDescription className="ml-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-green-800 text-sm">
                Backend server is online
              </span>
              {lastCheck && (
                <span className="text-green-600 text-xs ml-2">
                  (checked {formatLastCheck()})
                </span>
              )}
            </div>
            <Button 
              onClick={checkBackendHealth}
              variant="ghost" 
              size="sm"
              className="flex-shrink-0 text-green-700 hover:bg-green-100"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Recheck
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
