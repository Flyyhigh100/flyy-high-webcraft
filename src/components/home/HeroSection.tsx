
import { Button } from '@/components/ui/button';
import { Rocket, Search, ShieldCheck } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-b from-white to-secondary/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-flyy-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/4 -left-24 w-80 h-80 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="hidden md:block absolute bottom-0 right-1/4 w-64 h-64 bg-flyy-300 rounded-full filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 pt-20 pb-24 md:pt-32 md:pb-32 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Custom Websites Built for Success
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto max-w-2xl">
              Modern, fast, and conversion-focused sites crafted to grow your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg">
                Get Started
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-secondary px-8 py-6 text-lg">
                <a href="#portfolio">View Portfolio</a>
              </Button>
            </div>
          </div>

          {/* Benefit chips */}
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
            <li className="flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Rocket className="h-4 w-4 text-primary" aria-hidden="true" />
              Lightning-fast performance
            </li>
            <li className="flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Search className="h-4 w-4 text-primary" aria-hidden="true" />
              SEO-ready foundation
            </li>
            <li className="flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
