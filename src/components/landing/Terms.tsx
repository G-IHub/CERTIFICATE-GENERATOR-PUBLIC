import React from "react";
import { Link } from "react-router-dom";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-16">
      <div className="max-w-3xl bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-700 mb-4">
          These Terms of Service ("Terms") govern your use of Certifyer. Please
          read them carefully. By using the service you agree to these terms.
        </p>

        <h2 className="text-lg font-semibold mt-4">1. Use of Service</h2>
        <p className="text-sm text-gray-700">
          You may use the service in accordance with applicable laws and these
          Terms.
        </p>

        <h2 className="text-lg font-semibold mt-4">2. Content</h2>
        <p className="text-sm text-gray-700">
          You are responsible for content you create and distribute using
          Certifyer.
        </p>

        <h2 className="text-lg font-semibold mt-4">3. Liability</h2>
        <p className="text-sm text-gray-700">
          To the extent permitted by law, Genomac Innovation Hub is not liable
          for indirect damages.
        </p>

        <div className="mt-6 text-sm text-gray-600">
          <p>For full terms, contact support.</p>
        </div>

        <div className="mt-6">
          <Link to="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
