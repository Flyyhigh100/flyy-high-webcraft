
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const portfolioProjects = [
  {
    id: 1,
    title: "1 Million Strong Fight Club",
    category: "Healthcare Technology & Investment Platform",
    description: "Comprehensive platform showcasing affordable cancer treatments and investment opportunities in medical innovation with token-based funding.",
    imageUrl: "/lovable-uploads/daa6998c-e30b-48e2-ae07-e2c3ad092fe3.png",
    websiteUrl: "https://1millionstrongfightclub.com/",
  },
  {
    id: 2,
    title: "Precision Fabricated",
    category: "Industrial Manufacturing Website",
    description: "Professional website for a DeLand-based family-owned fabrication business dedicated to delivering quality precision components and metal fabrication solutions.",
    imageUrl: "/lovable-uploads/26b02aca-cdfb-47c9-a83d-327fa2113e91.png",
    websiteUrl: "https://precisionfabricated.com/",
  },
  {
    id: 3,
    title: "Hakuna Matata Daycare",
    category: "Childcare Services Website",
    description: "Bilingual daycare website based in Germany offering exceptional child care services, featuring colorful and engaging design perfect for families seeking quality childcare.",
    imageUrl: "/lovable-uploads/3cb2c39d-6785-49ef-8ced-0fea332bf950.png",
    websiteUrl: "https://hakunamatata.biz/",
  },
  {
    id: 4,
    title: "CageChain",
    category: "Cryptocurrency Learning Platform",
    description: "Educational crypto hub providing comprehensive resources for cryptocurrency and decentralized finance (DeFi) learning, featuring interactive dashboards and trading simulators.",
    imageUrl: "/lovable-uploads/e5d00f09-03f4-4015-8eca-dde86b4d8619.png",
    websiteUrl: "https://cagechain.com/",
  },
  {
    id: 5,
    title: "Shys Luxury Hairstyles",
    category: "Beauty & Luxury Services Website",
    description: "Elegant website for premium hairstyling services, featuring sophisticated design with gold accents and luxury branding to attract discerning clientele.",
    imageUrl: "/lovable-uploads/eb18f447-dbf5-4998-9756-ab30a2da4056.png",
    websiteUrl: "https://shysluxuryhairstyles.com/",
  },
  {
    id: 6,
    title: "Robinson Concrete LLC",
    category: "Construction Services Website",
    description: "Professional website for Robinson & Sons Concrete, emphasizing customer satisfaction and quality craftsmanship in residential and commercial concrete projects.",
    imageUrl: "/lovable-uploads/475609c9-4bb9-47a3-bb6d-c6f18598aae5.png",
    websiteUrl: "https://robinsonconcretellc.com/",
  },
  {
    id: 7,
    title: "Home Health Service",
    category: "Healthcare Services Website",
    description: "Comprehensive home health service platform offering personalized medical care, medication management, meal preparation, and companion care throughout Volusia County.",
    imageUrl: "/lovable-uploads/76be8827-e3f5-44df-b369-c47ef397100f.png",
    websiteUrl: "https://www.homehealthservice.co/",
  },
  {
    id: 8,
    title: "Delta Personal Service",
    category: "Healthcare Recruitment Website",
    description: "Gateway platform connecting qualified nursing professionals with German healthcare opportunities, facilitating international healthcare career placement.",
    imageUrl: "/lovable-uploads/9e4ec9de-e4c1-4339-acb3-3bbb27536e6b.png",
    websiteUrl: "https://deltapersonalservice.biz/",
  }
];

const PortfolioSection = () => {
  return (
    <section className="section bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Our Portfolio</span>
          </h2>
          <p className="text-gray-700 text-lg">
            Explore our latest projects and see how we help businesses transform their online presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {portfolioProjects.map((project) => (
            <div key={project.id} className="rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-flyy-600 text-sm font-medium">{project.category}</span>
                <h3 className="text-xl font-bold mt-1 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                <a 
                  href={project.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-flyy-600 font-medium hover:underline"
                >
                  Visit Website <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-flyy-600 text-flyy-600 hover:bg-flyy-50">
            <Link to="/portfolio">View All Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
