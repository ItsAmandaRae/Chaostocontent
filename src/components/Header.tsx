import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="w-full pl-6 pr-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-foreground">
            <Logo />
          </a>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-lg font-medium text-foreground hover:opacity-70 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="/demo"
              className="w-32 h-16 flex items-center justify-center text-lg font-medium text-foreground bg-background rounded-full hover:bg-muted transition-colors"
            >
              Try demo
            </a>
            <a 
              href="#" 
              className="w-32 h-16 flex items-center justify-center text-lg font-medium text-foreground bg-background rounded-full hover:bg-muted transition-colors"
            >
              Log In
            </a>
            <a 
              href="#" 
              className="w-32 h-16 flex items-center justify-center text-lg font-medium text-background bg-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Sign Up
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <a href="/demo" className="text-lg font-medium py-2">
                  Try demo
                </a>
                <a href="#" className="text-lg font-medium py-2">
                  Log In
                </a>
                <a 
                  href="#" 
                  className="px-6 py-3 text-lg font-medium text-background bg-foreground rounded-full text-center"
                >
                  Sign Up
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
