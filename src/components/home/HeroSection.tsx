
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="container mx-auto px-4 pt-20 pb-24 md:pt-32 md:pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 text-left">
            <div className="mb-8">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                AFFORDABLE CANCER TREATMENT
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-[#00A7C1]">Low-Cost </span>
              <span>Cancer-Killing Treatments Without Side Effects</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              CSi Labs is making cancer treatments affordable and accessible for millions of patients who cannot afford today's high-cost drugs. Our cannabinoid-based treatments eliminate cancer cells without the harsh side effects of chemical therapies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#00A7C1] hover:bg-[#008CA3] text-white px-8 py-6 text-lg">
                Contribute Now
              </Button>
              <Button variant="outline" className="border-[#00A7C1] text-[#00A7C1] hover:bg-[#00A7C1]/5 px-8 py-6 text-lg">
                View Research Documents
              </Button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="/lovable-uploads/6e1198f7-b71c-4c79-88d9-cb7738840451.png" 
                alt="CSI Labs Investment Growth Chart" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
