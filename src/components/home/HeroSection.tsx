
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span>Build a Website That </span>
              <span className="gradient-text">Wins Customers</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg mx-auto lg:mx-0">
              Modern, fast, and conversion-focused sites crafted to grow your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg">
                Get Started
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-secondary px-8 py-6 text-lg">
                <a href="#portfolio">View Portfolio</a>
              </Button>
            </div>
            
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            {/* Main browser window with 1 Million Strong website */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-primary/20 p-2 mx-auto w-full max-w-lg">
              <div className="rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between p-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-accent/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-primary/50 rounded-full"></div>
                  </div>
                  <div className="text-xs text-muted-foreground">sydevault.com</div>
                </div>
                <div className="aspect-[16/9] bg-white flex items-center justify-center p-2">
                  <img 
                    src="/lovable-uploads/f78b96dc-5cfb-4143-a508-fec500284300.png" 
                    alt="1 Million Strong Fight Club" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="p-4 text-center bg-white">
                <div className="h-2 w-64 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-2 w-44 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="flex justify-center space-x-2 mt-4">
                  <div className="h-6 w-24 bg-primary rounded"></div>
                  <div className="h-6 w-24 bg-secondary rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Floating CageChain website */}
            <div className="absolute -top-4 -right-4 md:top-8 md:right-8 bg-white rounded-lg shadow-lg animate-float overflow-hidden border border-primary/20 w-48">
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-1">
                <img 
                  src="/lovable-uploads/008c757f-a996-4036-b788-f7dbf9fce7c7.png" 
                  alt="CageChain" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Floating Precision Fabricated website */}
            <div className="absolute -bottom-4 -left-4 md:bottom-8 md:left-8 bg-white rounded-lg shadow-lg animate-float overflow-hidden border border-primary/20 w-48" style={{ animationDelay: '1s' }}>
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-1">
                <img 
                  src="/lovable-uploads/da2a20ea-3bc6-448d-a5c5-ff2b68b40cd3.png" 
                  alt="Precision Fabricated" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
