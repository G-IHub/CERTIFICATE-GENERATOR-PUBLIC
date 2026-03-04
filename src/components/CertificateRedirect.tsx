import { useEffect } from "react";

export default function CertificateRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const isCertificateUrl = hash.includes("/certificate");

    if (isCertificateUrl) {
      const fullUrl = `${window.location.origin}${hash}`;
      window.location.replace(fullUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading certificate...</p>
      </div>
    </div>
  );
}