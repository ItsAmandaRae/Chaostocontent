import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
const imgLoudioLogo = "/images/c93f85fbd41aa2dab6df10f57479facc20d26ecd.svg";
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return <header className={`fixed top-0 left-0 right-0 z-[100] bg-white w-full ${isScrolled && !isMobileMenuOpen ? 'border-b border-black' : ''}`}>
      <div className="w-full px-6 lg:px-0">
        <div className="container mx-auto max-w-[1152px] flex items-center justify-between h-20 w-full">
          {/* Logo */}
          <div className="h-5 w-28 relative flex-shrink-0">
            <img alt="LOUDIO Logo" className="h-full w-auto object-contain" src={imgLoudioLogo} />
          </div>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="#features" className="text-lg font-medium text-black hover:opacity-70 transition-opacity">
              Features
            </a>
            <a href="#how-it-works" className="text-lg font-medium text-black hover:opacity-70 transition-opacity">
              How it works
            </a>
            <a href="#pricing" className="text-lg font-medium text-black hover:opacity-70 transition-opacity">
              Pricing
            </a>
            <Link to="/demo" className="text-lg font-medium text-black hover:opacity-70 transition-opacity">
              Try demo
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/auth?mode=login" className="bg-white border border-black rounded-full px-4 lg:px-6 py-2 lg:py-3 h-12 lg:h-16 text-base lg:text-lg font-medium text-black hover:bg-gray-50 transition-colors w-32 flex items-center justify-center">
              Log In
            </Link>
            <Link to="/auth?mode=signup" className="bg-black border border-black rounded-full px-4 lg:px-6 py-2 lg:py-3 h-12 lg:h-16 text-base lg:text-lg font-medium text-white hover:bg-gray-900 transition-colors w-32 flex items-center justify-center">
              Sign Up
            </Link>
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <button onClick={toggleMobileMenu} className="lg:hidden flex items-center justify-center w-10 h-10 p-2 rounded-md hover:bg-gray-50 transition-colors relative" aria-label="Toggle menu">
            <div className="relative w-5 h-4 flex flex-col justify-center">
              <span className={`block w-5 h-[2px] bg-black transition-all duration-300 absolute ${isMobileMenuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'rotate-0 top-0'}`} />
              <span className={`block w-5 h-[2px] bg-black transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-5 h-[2px] bg-black transition-all duration-300 absolute ${isMobileMenuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : 'rotate-0 bottom-0'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.3,
          ease: "easeOut"
        }} className="lg:hidden bg-white absolute top-full left-0 right-0 border-b border-black">
              <nav className="flex flex-col px-6 py-6 gap-3">
                <motion.a href="#features" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.1,
              duration: 0.3
            }} className="text-lg font-medium text-black hover:opacity-70 transition-opacity py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Features
                </motion.a>
                <motion.a href="#how-it-works" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.15,
              duration: 0.3
            }} className="text-lg font-medium text-black hover:opacity-70 transition-opacity py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  How it works
                </motion.a>
                <motion.a href="#pricing" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.2,
              duration: 0.3
            }} className="text-lg font-medium text-black hover:opacity-70 transition-opacity py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Pricing
                </motion.a>
                <motion.div initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.25,
              duration: 0.3
            }} className="flex flex-col sm:flex-row gap-2 pt-8">
                  <Link to="/demo" className="bg-white border border-black rounded-full px-6 py-3 h-12 text-base font-medium text-black hover:bg-gray-50 transition-colors w-full sm:w-auto sm:flex-1 flex items-center justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Try demo
                  </Link>
                  <Link to="/auth?mode=login" className="bg-white border border-black rounded-full px-6 py-3 h-12 text-base font-medium text-black hover:bg-gray-50 transition-colors w-full sm:w-auto sm:flex-1 flex items-center justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link to="/auth?mode=signup" className="bg-black border border-black rounded-full px-6 py-3 h-12 text-base font-medium text-white hover:bg-gray-900 transition-colors w-full sm:w-auto sm:flex-1 flex items-center justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </motion.div>
              </nav>
            </motion.div>}
        </AnimatePresence>
      </div>
    </header>;
}