
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log to track admin status in the Header
  useEffect(() => {
    if (user) {
      console.log("Header: Current user:", user.email, "isAdmin:", isAdmin);
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/a1260ea6-f719-4e0e-a7ef-6ebd36869298.png" 
              alt="Syde Vault" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="text-gray-600 hover:text-yellow-600">
              Services
            </Link>
            <Link to="/portfolio" className="text-gray-600 hover:text-yellow-600">
              Portfolio
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-yellow-600">
              Pricing
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-yellow-600">
              Contact
            </Link>
            
            {/* Admin Dashboard Link - Always visible for admins */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center text-purple-600 hover:text-purple-800 font-semibold ${
                  location.pathname === '/admin' ? 'border-b-2 border-purple-600' : ''
                }`}
              >
                <Shield className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
            
            {/* Auth Links - show different options based on authentication state */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isAdmin ? "Admin User" : "Logged in user"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-4">
            <Link
              to="/services"
              className="block py-2 text-gray-600 hover:text-yellow-600"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/portfolio"
              className="block py-2 text-gray-600 hover:text-yellow-600"
              onClick={() => setMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/pricing"
              className="block py-2 text-gray-600 hover:text-yellow-600"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="block py-2 text-gray-600 hover:text-yellow-600"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Auth Links - Mobile */}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 text-gray-600 hover:text-yellow-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center py-2 text-purple-600 hover:text-purple-800 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-600 hover:text-yellow-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
