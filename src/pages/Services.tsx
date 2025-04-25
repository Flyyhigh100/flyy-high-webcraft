
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/home/ServicesSection';
import CTASection from '@/components/home/CTASection';

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Services</h1>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
              We provide end-to-end web development solutions tailored to your business needs.
            </p>
          </div>
        </div>
        
        <ServicesSection />
        
        {/* Additional services content would go here */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Discovery",
                  description: "We learn about your business, goals, and requirements to create a tailored solution."
                },
                {
                  step: 2,
                  title: "Design",
                  description: "Our designers create wireframes and mockups that align with your brand and goals."
                },
                {
                  step: 3,
                  title: "Development",
                  description: "Our developers build your website with clean, efficient code and the latest technologies."
                },
                {
                  step: 4,
                  title: "Deployment",
                  description: "We test everything thoroughly before launching your website to the world."
                }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-flyy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-flyy-600 text-xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;
