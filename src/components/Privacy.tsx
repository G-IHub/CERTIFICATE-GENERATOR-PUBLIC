import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./landing/Navbar";
import Footer from "./landing/Footer";
import { ArrowLeft, Lock } from "lucide-react";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex justify-center py-16 px-4 pt-32 pb-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10 border-b border-gray-100 pb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-xl mb-6">
               <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-500">
              Last updated: April 2026
            </p>
          </div>

          <div className="prose prose-lg prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              This Privacy Policy explains how Genomac Innovation Hub collects and
              uses personal data. We respect your privacy and handle your data
              responsibly.
            </p>

            <div className="space-y-8">
              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                  Information We Collect
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We collect account information and data you provide when using the
                  service.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                  How We Use Information
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We use data to operate and improve the service, and to communicate
                  with you.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                  Data Retention
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We retain personal data as required to provide the service and comply
                  with legal obligations.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
                  Data Security
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We implement robust technical and organizational measures to protect your personal data from unauthorized access, loss, or alteration.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
                  Third-Party Services
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We may employ third-party companies and individuals to facilitate our service, to provide the service on our behalf, or to perform service-related operations. These third parties have access to your personal data only to perform these tasks on our behalf.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
                  Cookies and Tracking
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
                  Your Privacy Rights
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  Depending on your location, you may have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your personal data directly within your account settings.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
                  Children's Privacy
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.
                </p>
              </section>
            </div>

            <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy Concerns?</h3>
              <p className="text-blue-700">Contact support for privacy-related requests or data deletion inquiries.</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
