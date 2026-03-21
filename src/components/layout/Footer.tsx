import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/home/NewsletterSignup';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Syde Vault</h3>
            <p className="text-muted-foreground text-sm">
              Professional web design and development services to help your business succeed online.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-muted-foreground hover:text-primary text-sm">Web Design</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary text-sm">Web Development</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary text-sm">E-commerce</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary text-sm">SEO</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary text-sm">About Us</Link></li>
              <li><Link to="/portfolio" className="text-muted-foreground hover:text-primary text-sm">Portfolio</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-primary text-sm">Pricing</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary text-sm">Blog</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary text-sm">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <NewsletterSignup source="footer" />
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          &copy; {currentYear} Syde Vault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
