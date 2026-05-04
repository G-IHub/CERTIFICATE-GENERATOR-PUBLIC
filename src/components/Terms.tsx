import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./landing/Navbar";
import Footer from "./landing/Footer";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex justify-center py-16 px-4 pt-32 pb-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10 border-b border-gray-100 pb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-xl mb-6">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-500">
              Last updated: April 2026
            </p>
          </div>

          <div className="prose prose-lg prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              These Terms of Service ("Terms") govern your use of Certifyer. Please
              read them carefully. By using the service you agree to these terms.
            </p>

            <div className="space-y-8">
              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                  Use of Service
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  You may use the service in accordance with applicable laws and these
                  Terms.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                  Content
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  You are responsible for content you create and distribute using
                  Certifyer.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                  Liability
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  To the extent permitted by law, Genomac Innovation Hub is not liable
                  for indirect damages made either by creators or users.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">4</span>
                  User Accounts
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  You must provide accurate and complete information when creating an account. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">5</span>
                  Intellectual Property
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  The service and its original content, features, and functionality are owned by Genomac Innovation Hub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">6</span>
                  Termination
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
                  Governing Law
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
                  Changes to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed pl-10">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms.
                </p>
              </section>
            </div>

            <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Questions about these terms?</h3>
              <p className="text-blue-700">For full terms or any inquiries, please contact our support team.</p>
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

export default Terms;