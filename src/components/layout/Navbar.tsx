
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { X, Menu, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Define a proper type for navigation links that includes optional icon
interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType; // Make icon optional
}

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Log admin status when it changes (for debugging)
  useEffect(() => {
    if (user) {
      console.log("Navbar: isAdmin status updated:", isAdmin);
    }
  }, [isAdmin, user]);

  // Update the links array to include the dashboard link
  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  // Auth related links that change based on authentication status
  const authLinks: NavLink[] = user ? [
    { href: "/dashboard", label: "Dashboard" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin Dashboard", icon: Shield }] : [])
  ] : [];

  // Combine regular links with conditional auth links
  const allLinks = [...links, ...authLinks];

  return (
    <nav className="py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold gradient-text">Flyy High A.I.</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-gray-700 hover:text-flyy-600 font-medium flex items-center"
            >
              {link.icon && <link.icon className="mr-1 h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <Button onClick={handleSignOut} className="bg-flyy-600 hover:bg-flyy-700 transition-all">
              Sign Out
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-flyy-600 hover:bg-flyy-700 transition-all"
            >
              Client Login
            </Button>
          )}
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
            {allLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-700 hover:text-flyy-600 font-medium px-4 py-2 flex items-center"
                onClick={toggleMobileMenu}
              >
                {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              {user ? (
                <Button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full bg-flyy-600 hover:bg-flyy-700 transition-all"
                >
                  Sign Out
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full bg-flyy-600 hover:bg-flyy-700 transition-all"
                >
                  Client Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
