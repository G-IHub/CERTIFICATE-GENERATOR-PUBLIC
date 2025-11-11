import React from 'react';
import { useLocation } from 'react-router-dom';

export default function NotFound() {
  const location = useLocation();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ 404 NOT FOUND PAGE RENDERED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 URL:', window.location.href);
  console.log('📍 Pathname:', location.pathname);
  console.log('📍 Search:', location.search);
  console.log('📍 Hash:', location.hash);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or couldn't be loaded.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">Debug Info:</p>
          <p className="text-xs text-gray-600 break-all">
            <strong>URL:</strong> {window.location.href}
          </p>
          <p className="text-xs text-gray-600 break-all mt-1">
            <strong>Path:</strong> {location.pathname}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/#/dashboard'}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reload Page
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Check the browser console for detailed error logs
        </p>
      </div>
    </div>
  );
}
