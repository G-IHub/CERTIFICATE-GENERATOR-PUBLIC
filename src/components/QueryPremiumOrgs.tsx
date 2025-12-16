import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Crown, Loader2 } from 'lucide-react';

export default function QueryPremiumOrgs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const queryBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/platform-data`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      
      // Log to console for easy inspection
      } catch (err: any) {
      setError(err.message);
      console.error('❌ Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const premiumOrgs = data?.organizations?.filter(
    (org: any) => org.subscription?.status === 'active' && org.subscription?.plan !== 'free'
  ) || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Query Premium Organizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={queryBackend} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Querying Backend...
              </>
            ) : (
              'Query Backend for Premium Organizations'
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Backend Response Summary:</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Total Organizations: {data.organizations?.length || 0}</li>
                  <li>• Total Users: {data.users?.length || 0}</li>
                  <li>• Total Certificates: {data.certificates?.length || 0}</li>
                  <li className="font-bold text-primary">• Premium Organizations: {premiumOrgs.length}</li>
                </ul>
              </div>

              {premiumOrgs.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Organizations with Premium Plans
                  </h3>
                  {premiumOrgs.map((org: any) => (
                    <div 
                      key={org.id} 
                      className="p-4 bg-orange-50 border-2 border-primary rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-lg">{org.name}</h4>
                            <span className="px-2 py-1 bg-primary text-white text-xs rounded">
                              PREMIUM
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Organization ID:</span> {org.id}</p>
                            <p><span className="font-medium">Owner Email:</span> {org.ownerEmail || 'N/A'}</p>
                            <p><span className="font-medium">Owner ID:</span> {org.ownerId}</p>
                            <p><span className="font-medium">Created:</span> {new Date(org.createdAt).toLocaleString()}</p>
                            <p><span className="font-medium">Programs:</span> {org.programs?.length || 0}</p>
                          </div>
                          
                          {org.subscription && (
                            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                              <p className="font-semibold text-sm mb-2">Subscription Details:</p>
                              <div className="space-y-1 text-xs">
                                <p><span className="font-medium">Plan:</span> {org.subscription.planName || org.subscription.plan}</p>
                                <p><span className="font-medium">Status:</span> 
                                  <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                    {org.subscription.status}
                                  </span>
                                </p>
                                {org.subscription.subscriptionDate && (
                                  <p><span className="font-medium">Subscribed:</span> {new Date(org.subscription.subscriptionDate).toLocaleString()}</p>
                                )}
                                {org.subscription.expiryDate && (
                                  <p><span className="font-medium">Expires:</span> {new Date(org.subscription.expiryDate).toLocaleString()}</p>
                                )}
                                {org.subscription.grantedByAdmin && (
                                  <p className="text-blue-600 font-medium">✓ Granted by Admin</p>
                                )}
                                {org.subscription.reference && (
                                  <p><span className="font-medium">Payment Reference:</span> {org.subscription.reference}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-gray-600">No premium organizations found.</p>
                  <p className="text-sm text-gray-500 mt-1">All organizations are on the free plan.</p>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  View Full JSON Response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
