import React from "react";
import { Link } from "react-router-dom";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-16">
      <div className="max-w-3xl bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-700 mb-4">
          This Privacy Policy explains how Genomac Innovation Hub collects and
          uses personal data. We respect your privacy and handle your data
          responsibly.
        </p>

        <h2 className="text-lg font-semibold mt-4">
          1. Information We Collect
        </h2>
        <p className="text-sm text-gray-700">
          We collect account information and data you provide when using the
          service.
        </p>

        <h2 className="text-lg font-semibold mt-4">
          2. How We Use Information
        </h2>
        <p className="text-sm text-gray-700">
          We use data to operate and improve the service, and to communicate
          with you.
        </p>

        <h2 className="text-lg font-semibold mt-4">3. Data Retention</h2>
        <p className="text-sm text-gray-700">
          We retain personal data as required to provide the service and comply
          with legal obligations.
        </p>

        <div className="mt-6 text-sm text-gray-600">
          <p>Contact support for privacy-related requests.</p>
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

export default Privacy;
