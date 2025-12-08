import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export default function AdminUtilities() {
  const [isReseeding, setIsReseeding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleForceReseed = async () => {
    setIsReseeding(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/templates/force-reseed`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Templates reseeded successfully!",
          count: data.count,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to reseed templates",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error}`,
      });
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl mb-8">Admin Utilities</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Force Reseed Templates
          </CardTitle>
          <CardDescription>
            Deletes all templates from the database and reseeds them from the
            backend DEFAULT_TEMPLATES array. Use this after adding or modifying
            templates in the code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-orange-900 mb-2">
              ⚠️ What this does:
            </p>
            <ul className="list-disc list-inside space-y-1 text-orange-800">
              <li>Deletes ALL existing templates from database</li>
              <li>Reseeds all 16 templates from backend code</li>
              <li>Updates any config changes you made</li>
              <li>
                Required after adding new templates or modifying existing ones
              </li>
            </ul>
          </div>

          <Button
            onClick={handleForceReseed}
            disabled={isReseeding}
            className="w-full"
            size="lg"
          >
            {isReseeding ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Reseeding Templates...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Reseed Templates
              </>
            )}
          </Button>

          {result && (
            <div
              className={`rounded-lg p-4 flex items-start gap-3 ${
                result.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    result.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.success ? "Success!" : "Error"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result.message}
                </p>
                {result.success && result.count && (
                  <p className="text-sm text-green-700 mt-2">
                    ✅ {result.count} templates reseeded successfully
                  </p>
                )}
                {result.success && (
                  <p className="text-sm text-green-700 mt-2">
                    🎉 Now go to the Templates page and refresh - you should see
                    all 16 templates!
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-gray-900 mb-2">📚 Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Click "Force Reseed Templates" button above</li>
              <li>Wait for success message</li>
              <li>Go to Templates page and refresh</li>
              <li>Verify all 16 templates appear</li>
              <li>Test selecting and generating certificates</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">💡 Pro Tip:</p>
            <p className="text-blue-800">
              After adding new templates to the backend code, come back here and
              click "Force Reseed Templates" to sync them to the database.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-2">🔧 For Developers:</p>
        <p className="mb-2">You can also reseed via browser console:</p>
        <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto text-xs">
          {`fetch('https://${projectId}.supabase.co/functions/v1/make-server-a611b057/templates/force-reseed', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${publicAnonKey}'
  }
})
.then(r => r.json())
.then(console.log);`}
        </pre>
      </div>
    </div>
  );
}