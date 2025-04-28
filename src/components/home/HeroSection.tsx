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
              <span>Elevate Your Business With </span>
              <span className="gradient-text">AI-Powered Websites</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg mx-auto lg:mx-0">
              We build stunning, intelligent websites that help your business grow. 
              Powered by AI, designed by experts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-flyy-600 hover:bg-flyy-700 text-white px-8 py-6 text-lg">
                Get Started
              </Button>
              <Button variant="outline" className="border-flyy-600 text-flyy-600 hover:bg-flyy-50 px-8 py-6 text-lg">
                View Portfolio
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"></div>
                ))}
              </div>
              <p className="ml-4 text-sm text-gray-600">
                <span className="font-medium">50+ clients</span> trust our services
              </p>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            {/* Main browser window with website preview */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 p-2 mx-auto w-full max-w-lg">
              <div className="rounded-lg overflow-hidden">
                <div className="bg-gray-100 flex space-x-2 p-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="aspect-[16/9] bg-white flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/603b50e7-cdb6-4645-a9af-4a479819c1b4.png" 
                    alt="CSI Labs Trading Chart" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="p-4 text-center bg-white">
                <div className="h-2 w-64 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-2 w-44 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="flex justify-center space-x-2 mt-4">
                  <div className="h-6 w-24 bg-[#7B68EE] rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 md:top-8 md:right-8 bg-white p-4 rounded-lg shadow-lg animate-float">
              <div className="text-center">
                <div className="h-2 w-12 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-8 w-24 bg-flyy-100 rounded"></div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 md:bottom-8 md:left-8 bg-white p-4 rounded-lg shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-center">
                <div className="h-2 w-16 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-8 w-20 bg-blue-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
