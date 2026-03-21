import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Search, ShieldCheck, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/4 -left-24 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 pt-20 pb-24 md:pt-32 md:pb-32 relative z-10">
        <div className="flex flex-col items-center">
          {/* Accepting badge */}
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Now accepting new projects</span>
          </div>

          <div className="w-full max-w-3xl text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Websites That Turn Visitors Into <span className="gradient-text">Customers</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto max-w-2xl">
              Professional websites designed to achieve your goals. Custom-built, fast, and optimized for results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild className="px-8 py-6 text-lg">
                <Link to="/project-intake">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg">
                <a href="#portfolio">View Portfolio</a>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-3 gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">8+</div>
              <div className="text-sm text-muted-foreground mt-1">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">2-4wk</div>
              <div className="text-sm text-muted-foreground mt-1">Avg. Delivery</div>
            </div>
          </div>

          {/* Benefit chips */}
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
            <li className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <Rocket className="h-4 w-4 text-primary" aria-hidden="true" />
              Lightning-fast performance
            </li>
            <li className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4 text-primary" aria-hidden="true" />
              SEO-ready foundation
            </li>
            <li className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Reliable and secure
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
