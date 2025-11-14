import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { IoIosMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { Link } from "react-scroll";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [navHeight, setNavHeight] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure navbar height so we can insert a spacer when using fixed positioning
  useLayoutEffect(() => {
    const setHeight = () => {
      const el = navRef.current;
      if (el) setNavHeight(el.getBoundingClientRect().height);
    };

    setHeight();
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, [isScrolled, isMenuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white md:fixed p-0"
            : "p-0 md:py-6 md:px-28 md:sticky"
        } z-50`}
      >
        <div className="flex justify-between items-center md:rounded-lg px-4 py-5 h-14 bg-white md:bg-[#FFFFFF66] border-2 border-[#FFFFFF1F] text-sm">
          <div>
            <img src={logo} alt="logo" className="w-20 md:w-24" />
          </div>

          <button
            className="md:hidden text-orange-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <IoClose className="size-8" />
            ) : (
              <IoIosMenu className="size-8" />
            )}
          </button>

          <div className="hidden md:flex gap-12 items-center">
            <Link
              to="work"
              smooth={true}
              duration={500}
              offset={-50}
              className="hover:text-orange-500 cursor-pointer"
            >
              How It Works
            </Link>
            <Link
              to="features"
              smooth={true}
              duration={500}
              offset={-50}
              className="hover:text-orange-500 cursor-pointer"
            >
              Features
            </Link>
            <Link
              to="testimonials"
              smooth={true}
              duration={500}
              offset={-50}
              className="hover:text-orange-500 cursor-pointer"
            >
              Testimonials
            </Link>
            <Link
              to="prices"
              smooth={true}
              duration={500}
              offset={-50}
              className="hover:text-orange-500 cursor-pointer"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex gap-8 items-center">
            <button
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
              className="text-orange-500 text-left cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-orange-500 rounded-full text-white px-5 py-2 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="transition ease-in duration-300 md:hidden right-0 bg-white shadow-lg p-4 w-2/3 h-full fixed"
            style={{ top: navHeight }}
          >
            <div className="flex flex-col gap-10">
              <Link
                to="work"
                smooth={true}
                duration={500}
                offset={-50}
                className="hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="features"
                smooth={true}
                duration={500}
                offset={-50}
                className="hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="testimonials"
                smooth={true}
                duration={500}
                offset={-50}
                className="hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                to="prices"
                smooth={true}
                duration={500}
                offset={-50}
                className="hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>

              <a
                href=""
                className="text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </a>
              <button className="bg-orange-500 rounded-full text-white px-5 py-2 cursor-pointer">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content jump when navbar is fixed */}
      <div aria-hidden="true" style={{ height: navHeight }} />
    </>
  );
};

export default Navbar;
