import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import NotFound from './NotFound';

export default function BackendHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error' | 'idle'>('idle');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const checkHealth = async (attempt = 1, maxAttempts = 4) => {
    setStatus('checking');
    setError(null);
    setResponse(null);
    if (attempt === 1) {
      setLogs([]);
    }
    
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/health`;
    
    addLog(`🚀 Starting health check (Attempt ${attempt}/${maxAttempts})...`);
    if (attempt === 1) {
      addLog(`📡 URL: ${url}`);
      addLog(`🔑 Using project: ${projectId}`);
    }

    try {
      const controller = new AbortController();
      // Longer timeout for first attempt (cold start), shorter for retries
      const timeout = attempt === 1 ? 30000 : 15000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      addLog(`⏳ Sending request (${timeout/1000}s timeout)...`);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      addLog(`📥 Response received: ${res.status} ${res.statusText}`);
      
      const data = await res.json();
      
      if (res.ok) {
        addLog('✅ Backend is HEALTHY!');
        setStatus('healthy');
        setResponse(data);
      } else {
        addLog(`❌ Backend returned error: ${res.status}`);
        setStatus('error');
        setError(`HTTP ${res.status}: ${JSON.stringify(data)}`);
        setResponse(data);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        addLog(`⏱️ Request timed out after ${attempt === 1 ? 30 : 15} seconds`);
        
        // Retry if we haven't exhausted attempts
        if (attempt < maxAttempts) {
          const waitTime = 5000; // Wait 5 seconds between retries
          addLog(`⏳ Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return checkHealth(attempt + 1, maxAttempts);
        } else {
          setError('Request timed out after multiple attempts. The Edge Function may not be deployed or is experiencing issues.');
        }
      } else {
        addLog(`❌ Network error: ${err.message}`);
        
        // Retry on network errors too
        if (attempt < maxAttempts) {
          const waitTime = 5000;
          addLog(`⏳ Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return checkHealth(attempt + 1, maxAttempts);
        } else {
          setError(`Network error after ${maxAttempts} attempts: ${err.message}`);
        }
      }
      setStatus('error');
    }
  };

  useEffect(() => {
    // Auto-check on mount
    checkHealth();
  }, []);

  return (
    <>
      <NotFound />
      {/* The actual health check UI is not rendered since NotFound is shown */}
    </>
  );
}
