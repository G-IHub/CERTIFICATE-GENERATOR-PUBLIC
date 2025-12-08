import React from "react";
import logo from "../../assets/logo.png";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

const Footer: React.FC = () => {
  return (
    <div className="px-4 py-8 md:py-16 md:px-28 bg-black space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-white">Resources</h4>
          <div className="space-y-3 mt-4 text-sm">
            <a
              href=""
              className="block text-white/70 hover:text-white transition-colors"
            >
              Learn
            </a>
            <a
              href=""
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
            <RouterLink
              to="/terms"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Terms of Service
            </RouterLink>
            <RouterLink
              to="/privacy"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </RouterLink>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white">Products</h4>
          <div className="space-y-3 mt-4 text-sm">
            <ScrollLink
              to="features"
              smooth={true}
              duration={500}
              offset={-50}
              className="block text-white/70 hover:text-white transition-colors"
            >
              Features
            </ScrollLink>
            <ScrollLink
              to="work"
              smooth={true}
              duration={500}
              offset={-50}
              className="block text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </ScrollLink>
            {/* <a
              href="/pricing"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Pricing
            </a> */}
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
            <RouterLink
              to="/story"
              className="block text-white/70 hover:text-white transition-colors"
            >
              Our Story
            </RouterLink>
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
        <div className="flex flex-col items-start space-y-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" className="w-10" />
            <p className="text-orange-500 font-medium hidden md:block md:text-xl">
              Certifyer
            </p>
          </div>
          <p className="text-white/70">
            Empowering educators to create and manage certificates with ease
          </p>
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

      <div className="flex flex-col gap-4 md:flex-row justify-between items-center border-t pt-4 md:pt-12 border-white/70">
        <div className="text-white/70">
          <span>@2025 Genomac Innovation Hub. All rights reserved.</span>
        </div>

        <div className="flex gap-4 text-sm">
          <RouterLink
            to="/terms"
            className="block text-white/70 hover:text-white transition-colors"
          >
            Terms of Service
          </RouterLink>
          <RouterLink
            to="/privacy"
            className="block text-white/70 hover:text-white transition-colors"
          >
            Privacy Policy
          </RouterLink>
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
