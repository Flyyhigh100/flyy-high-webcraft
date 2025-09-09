
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Updated case studies with new image paths
const caseStudies = [
  {
    id: 1,
    title: "1 Million Strong Fight Club",
    client: "Healthcare Technology",
    category: "Healthcare Technology & Investment Platform",
    description: "Comprehensive platform showcasing affordable cancer treatments and investment opportunities in medical innovation with token-based funding.",
    imageUrl: "/lovable-uploads/f78b96dc-5cfb-4143-a508-fec500284300.png",
    websiteUrl: "https://1millionstrongfightclub.com/",
    technologies: ["React", "Blockchain", "Chart.js", "Token Integration"]
  },
  {
    id: 2,
    title: "Precision Fabricated",
    client: "Manufacturing Industry",
    category: "Industrial Manufacturing Website",
    description: "Professional website for a DeLand-based family-owned fabrication business dedicated to delivering quality precision components and metal fabrication solutions.",
    imageUrl: "/lovable-uploads/da2a20ea-3bc6-448d-a5c5-ff2b68b40cd3.png",
    websiteUrl: "https://precisionfabricated.com/",
    technologies: ["React", "Tailwind CSS", "Quote Management", "Industrial Design"]
  },
  {
    id: 3,
    title: "Hakuna Matata Daycare",
    client: "Childcare Services",
    category: "Childcare Services Website",
    description: "Bilingual daycare website based in Germany offering exceptional child care services, featuring colorful and engaging design perfect for families seeking quality childcare.",
    imageUrl: "/lovable-uploads/1a09c143-cf6f-4cb4-8a37-3000e0efa2d0.png",
    websiteUrl: "https://hakunamatata.biz/",
    technologies: ["React", "Multilingual Support", "Booking System", "Child-Friendly Design"]
  },
  {
    id: 4,
    title: "CageChain",
    client: "Cryptocurrency Education",
    category: "Cryptocurrency Learning Platform",
    description: "Educational crypto hub providing comprehensive resources for cryptocurrency and decentralized finance (DeFi) learning, featuring interactive dashboards and trading simulators.",
    imageUrl: "/lovable-uploads/008c757f-a996-4036-b788-f7dbf9fce7c7.png",
    websiteUrl: "https://cagechain.com/",
    technologies: ["React", "Crypto APIs", "Trading Simulation", "Educational Content Management"]
  },
  {
    id: 5,
    title: "Across The King's River",
    client: "Spiritual & Cultural",
    category: "Spiritual & Cultural Platform",
    description: "Inspirational website merging African wisdom traditions with modern spiritual growth, featuring books, meditations, and cultural storytelling to empower personal transformation.",
    imageUrl: "/lovable-uploads/ba8be40b-5e1c-47c8-a4bf-6b416c87fad8.png",
    websiteUrl: "https://acrossthekingsriver.com/",
    technologies: ["React", "Content Management", "Cultural Design", "Spiritual Resources"]
  },
  {
    id: 6,
    title: "Robinson Concrete LLC",
    client: "Construction Services",
    category: "Construction Services Website",
    description: "Professional website for Robinson & Sons Concrete, emphasizing customer satisfaction and quality craftsmanship in residential and commercial concrete projects.",
    imageUrl: "/lovable-uploads/749267d4-cf51-4a6a-ab90-d223a3eaf75e.png",
    websiteUrl: "https://robinsonconcretellc.com/",
    technologies: ["React", "Project Gallery", "Estimate Calculator", "Local SEO"]
  },
  {
    id: 7,
    title: "Home Health Service",
    client: "Healthcare Services",
    category: "Healthcare Services Website",
    description: "Comprehensive home health service platform offering personalized medical care, medication management, meal preparation, and companion care throughout Volusia County.",
    imageUrl: "/lovable-uploads/bf714f6c-c702-44a2-8f28-3021c436b234.png",
    websiteUrl: "https://www.homehealthservice.co/",
    technologies: ["React", "Service Management", "Healthcare Compliance", "Appointment Scheduling"]
  },
  {
    id: 8,
    title: "Delta Personal Service",
    client: "Healthcare Recruitment",
    category: "Healthcare Recruitment Website",
    description: "Gateway platform connecting qualified nursing professionals with German healthcare opportunities, facilitating international healthcare career placement.",
    imageUrl: "/lovable-uploads/7352b36f-b173-4f99-80f7-13efefb6db30.png",
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
                  <div className="h-80 md:h-96 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
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
                        className="max-w-full max-h-full object-contain bg-white rounded shadow-sm"
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
                    
                    <Button 
                      asChild
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 w-full md:w-auto"
                    >
                      <a 
                        href={project.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        View Website <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
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
