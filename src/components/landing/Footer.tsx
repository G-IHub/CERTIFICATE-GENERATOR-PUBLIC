import React from "react";
import logo from "../../assets/logo.svg";

const Footer: React.FC = () => {
  return (
    <div className="px-4 py-8 md:py-16 md:px-28 bg-black space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-white">Resources</h4>
          <div className="space-y-3 mt-4 text-sm">
            <a
              href="/learn"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Learn
            </a>
            <a
              href="/support"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Support
            </a>
            {/* <a
              href="/slack"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Slack community
            </a>
            <a
              href="/events"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Events
            </a>
            <a
              href="/cookies"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Cookies
            </a> */}
            <a
              href="/terms"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white">Products</h4>
          <div className="space-y-3 mt-4 text-sm">
            <a
              href="/howitworks"
              className="block text-white/70 hover:text-white transition-colors"
            >
              How it works
            </a>
            <a
              href="/features"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/pricing"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Pricing
            </a>
            {/* <a
              href="/tools"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Tools and Intergration
            </a> */}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white">About</h4>
          <div className="space-y-3 mt-4 text-sm">
            <a
              href="/ourstory"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Our Story
            </a>
            {/* <a
              href="/mediakit"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Media Kit
            </a> */}
            {/* <a
              href="/blog"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Blog
            </a> */}
          </div>
        </div>
        <div className="space-y-4">
          <img src={logo} alt="logo" className="w-30 mb-4" />
          <p className="text-white/70">Empowering educators to create and manage certificates with ease</p>
          {/* <p className="text-sm text-white/70">
            Get the latest updates about Designership's new features and product
            updates.
          </p>
          <div className="flex items-center text-sm gap-4">
            <input
              type="text"
              placeholder="Email address"
              className="py-2 px-3 rounded-md border border-white/70 placeholder:text-gray-400 bg-white/10 text-white"
            />
            <button className="text-white bg-orange-500 px-4 py-2.5 rounded-md hover:bg-orange-600 transition-colors">
              Send
            </button>
          </div> */}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row justify-between items-center border-t-2 pt-4 md:pt-12 border-white/70">
        <div className="text-white/70">
          <span>@2025 Genomac Innovation Hub. All rights reserved.</span>
        </div>

        <div className="flex gap-4 text-sm">
          <a
            href="/term"
            className="block text-white/70 hover:text-white transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            className="block text-white/70 hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          {/* <a
            href="/security"
            className="block text-white/70 hover:text-white transition-colors"
          >
            Security
          </a>
          <a
            href="/sitemap"
            className="block text-white/70 hover:text-white transition-colors"
          >
            Sitemap
          </a> */}
        </div>
      </div>
    </div>
  );
};

export default Footer;