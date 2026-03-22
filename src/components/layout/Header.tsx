
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
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/pricing", label: "Pricing" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className={`bg-background border-b border-border sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-0' : ''}`}>
      <div className={`container mx-auto px-4 transition-all duration-300 ${scrolled ? 'py-1' : 'py-4'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0">
            <img 
              src="/lovable-uploads/a1260ea6-f719-4e0e-a7ef-6ebd36869298.png" 
              alt="Syde Vault" 
              className={`w-auto transition-all duration-300 ${scrolled ? 'h-16 md:h-20 lg:h-24' : 'h-32 md:h-40 lg:h-44'}`}
            />
          </Link>

          <div className="flex flex-1 justify-center">
            <Link to="/" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-widest text-foreground uppercase">
              Syde Vault
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-muted-foreground hover:text-primary transition-colors ${
                  location.pathname === link.to ? 'text-primary' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center text-primary hover:text-accent font-semibold ${
                  location.pathname === '/admin' ? 'border-b-2 border-primary' : ''
                }`}
              >
                <Shield className="mr-1 h-4 w-4" />
                Admin
              </Link>
            )}
            
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
              <Link to="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          <button
            className="md:hidden text-foreground focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-muted-foreground hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center py-2 text-primary hover:text-accent font-medium" onClick={() => setMenuOpen(false)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="block w-full text-left py-2 text-muted-foreground hover:text-primary">
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full border-primary text-primary">Sign In</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
