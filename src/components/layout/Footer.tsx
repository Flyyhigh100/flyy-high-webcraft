import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Flyy High</h3>
            <p className="text-gray-600 text-sm">
              Professional web design and development services to help your business succeed online.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-600 hover:text-primary text-sm">
                  Web Design
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-primary text-sm">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-primary text-sm">
                  E-commerce
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-600 hover:text-primary text-sm">
                  SEO
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-600 hover:text-primary text-sm">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; {currentYear} Flyy High WebCraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
