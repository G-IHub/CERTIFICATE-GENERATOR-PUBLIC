import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectId } from "../utils/supabase/info";

/**
 * ShortLinkRedirect Component
 * Handles short certificate URLs like /#/c/Ab3xY9
 * Resolves the short code and redirects to the actual certificate page
 */
export default function ShortLinkRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveShortLink = async () => {
      if (!code) {
        setError("Invalid short link - no code provided");
        return;
      }

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/short/${code}`
        );

        if (!response.ok) {
          console.error("❌ Failed to resolve short link:", response.status);
          setError("This certificate link is invalid or has expired");
          return;
        }

        const data = await response.json();

        if (!data.success) {
          setError("Failed to load certificate");
          return;
        }

        // Redirect to the actual certificate page
        // Format: /certificate/organizationId/programId/certificateId
        const certificatePath = `/certificate/${data.organizationId}/${data.programId}/${data.certificateId}`;
        navigate(certificatePath, { replace: true });
      } catch (error) {
        console.error("Error resolving short link:", error);
        setError("Failed to load certificate. Please try again.");
      }
    };

    resolveShortLink();
  }, [code, navigate]);

  // Loading state
  if (!error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <h2 className="text-gray-700 mb-2">Loading Certificate...</h2>
          <p className="text-sm text-gray-500">
            Please wait while we retrieve your certificate
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-gray-900 mb-2">Certificate Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}