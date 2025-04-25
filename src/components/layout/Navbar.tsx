
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X, Menu } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold gradient-text">Flyy High A.I.</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-flyy-600 font-medium">
            Home
          </Link>
          <Link to="/services" className="text-gray-700 hover:text-flyy-600 font-medium">
            Services
          </Link>
          <Link to="/portfolio" className="text-gray-700 hover:text-flyy-600 font-medium">
            Portfolio
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-flyy-600 font-medium">
            Pricing
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-flyy-600 font-medium">
            Contact
          </Link>
          <Button className="bg-flyy-600 hover:bg-flyy-700 transition-all">
            Client Login
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-flyy-600 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-md z-50">
          <div className="container mx-auto py-4 flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-flyy-600 font-medium px-4 py-2" onClick={toggleMobileMenu}>
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-flyy-600 font-medium px-4 py-2" onClick={toggleMobileMenu}>
              Services
            </Link>
            <Link to="/portfolio" className="text-gray-700 hover:text-flyy-600 font-medium px-4 py-2" onClick={toggleMobileMenu}>
              Portfolio
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-flyy-600 font-medium px-4 py-2" onClick={toggleMobileMenu}>
              Pricing
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-flyy-600 font-medium px-4 py-2" onClick={toggleMobileMenu}>
              Contact
            </Link>
            <div className="px-4 py-2">
              <Button className="w-full bg-flyy-600 hover:bg-flyy-700 transition-all">
                Client Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
