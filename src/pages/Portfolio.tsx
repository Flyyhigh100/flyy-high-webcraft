
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Updated case studies with proper image paths and no results arrays
const caseStudies = [
  {
    id: 1,
    title: "1 Million Strong Fight Club",
    client: "Healthcare Technology",
    category: "Healthcare Technology & Investment Platform",
    description: "Comprehensive platform showcasing affordable cancer treatments and investment opportunities in medical innovation with token-based funding.",
    imageUrl: "/lovable-uploads/daa6998c-e30b-48e2-ae07-e2c3ad092fe3.png",
    websiteUrl: "https://1millionstrongfightclub.com/",
    technologies: ["React", "Blockchain", "Chart.js", "Token Integration"]
  },
  {
    id: 2,
    title: "Precision Fabricated",
    client: "Manufacturing Industry",
    category: "Industrial Manufacturing Website",
    description: "Professional website for a DeLand-based family-owned fabrication business dedicated to delivering quality precision components and metal fabrication solutions.",
    imageUrl: "/lovable-uploads/26b02aca-cdfb-47c9-a83d-327fa2113e91.png",
    websiteUrl: "https://precisionfabricated.com/",
    technologies: ["React", "Tailwind CSS", "Quote Management", "Industrial Design"]
  },
  {
    id: 3,
    title: "Hakuna Matata Daycare",
    client: "Childcare Services",
    category: "Childcare Services Website",
    description: "Bilingual daycare website based in Germany offering exceptional child care services, featuring colorful and engaging design perfect for families seeking quality childcare.",
    imageUrl: "/lovable-uploads/3cb2c39d-6785-49ef-8ced-0fea332bf950.png",
    websiteUrl: "https://hakunamatata.biz/",
    technologies: ["React", "Multilingual Support", "Booking System", "Child-Friendly Design"]
  },
  {
    id: 4,
    title: "CageChain",
    client: "Cryptocurrency Education",
    category: "Cryptocurrency Learning Platform",
    description: "Educational crypto hub providing comprehensive resources for cryptocurrency and decentralized finance (DeFi) learning, featuring interactive dashboards and trading simulators.",
    imageUrl: "/lovable-uploads/e5d00f09-03f4-4015-8eca-dde86b4d8619.png",
    websiteUrl: "https://cagechain.com/",
    technologies: ["React", "Crypto APIs", "Trading Simulation", "Educational Content Management"]
  },
  {
    id: 5,
    title: "Shys Luxury Hairstyles",
    client: "Beauty Services",
    category: "Beauty & Luxury Services Website",
    description: "Elegant website for premium hairstyling services, featuring sophisticated design with gold accents and luxury branding to attract discerning clientele.",
    imageUrl: "/lovable-uploads/eb18f447-dbf5-4998-9756-ab30a2da4056.png",
    websiteUrl: "https://shysluxuryhairstyles.com/",
    technologies: ["React", "Booking System", "Luxury Design", "Service Showcase"]
  },
  {
    id: 6,
    title: "Robinson Concrete LLC",
    client: "Construction Services",
    category: "Construction Services Website",
    description: "Professional website for Robinson & Sons Concrete, emphasizing customer satisfaction and quality craftsmanship in residential and commercial concrete projects.",
    imageUrl: "/lovable-uploads/475609c9-4bb9-47a3-bb6d-c6f18598aae5.png",
    websiteUrl: "https://robinsonconcretellc.com/",
    technologies: ["React", "Project Gallery", "Estimate Calculator", "Local SEO"]
  },
  {
    id: 7,
    title: "Home Health Service",
    client: "Healthcare Services",
    category: "Healthcare Services Website",
    description: "Comprehensive home health service platform offering personalized medical care, medication management, meal preparation, and companion care throughout Volusia County.",
    imageUrl: "/lovable-uploads/76be8827-e3f5-44df-b369-c47ef397100f.png",
    websiteUrl: "https://www.homehealthservice.co/",
    technologies: ["React", "Service Management", "Healthcare Compliance", "Appointment Scheduling"]
  },
  {
    id: 8,
    title: "Delta Personal Service",
    client: "Healthcare Recruitment",
    category: "Healthcare Recruitment Website",
    description: "Gateway platform connecting qualified nursing professionals with German healthcare opportunities, facilitating international healthcare career placement.",
    imageUrl: "/lovable-uploads/9e4ec9de-e4c1-4339-acb3-3bbb27536e6b.png",
    websiteUrl: "https://deltapersonalservice.biz/",
    technologies: ["React", "Multilingual Support", "Career Portal", "Application Management"]
  }
];

const Portfolio = () => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (projectId: number, imageUrl: string) => {
    console.error(`Failed to load image for project ${projectId}:`, imageUrl);
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
  };

  const handleImageLoad = (projectId: number, imageUrl: string) => {
    console.log(`Successfully loaded image for project ${projectId}:`, imageUrl);
  };

  return (
    <>
      <div className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Portfolio</h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Explore our latest projects and see how we've helped businesses achieve their digital goals.
          </p>
        </div>
      </div>
      
      <div className="section bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-16">
            {caseStudies.map((project, index) => (
              <div key={project.id} className="rounded-lg overflow-hidden bg-white shadow-lg border border-gray-100">
                <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="aspect-auto md:aspect-square overflow-hidden bg-gray-50">
                    {imageErrors[project.id] ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center p-8">
                          <div className="text-6xl mb-4">🌐</div>
                          <p className="text-gray-600 font-medium">{project.title}</p>
                          <p className="text-gray-500 text-sm mt-2">{project.category}</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(project.id, project.imageUrl)}
                        onLoad={() => handleImageLoad(project.id, project.imageUrl)}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-flyy-600 text-sm font-medium">{project.category}</span>
                      <span className="text-gray-500 text-sm">Client: {project.client}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-6">{project.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-lg mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <a 
                      href={project.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-flyy-600 text-white px-6 py-3 rounded-md hover:bg-flyy-700 transition-colors w-full md:w-auto"
                    >
                      Visit Live Website <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-flyy-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Want to See More?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We have more projects we'd love to share. Contact us to request our extended portfolio or discuss your project needs.
          </p>
          <Button className="bg-flyy-600 hover:bg-flyy-700">
            Contact Us
          </Button>
        </div>
      </div>
    </>
  );
};

export default Portfolio;
