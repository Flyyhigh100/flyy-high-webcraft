
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const portfolioProjects = [
  {
    id: 1,
    title: "CSI Labs Investment Growth",
    category: "Healthcare Technology Platform",
    description: "Advanced platform showcasing affordable cancer treatments and investment opportunities in medical innovation.",
    imageUrl: "/lovable-uploads/2f3ff55c-2d9b-4367-ba52-fb592d82cdeb.png",
    websiteUrl: "https://csilabs.io/",
  },
  {
    id: 2,
    title: "Hakuna Matata Business",
    category: "Corporate Website",
    description: "Modern and professional website for a diverse business platform.",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://hakunamatata.biz/",
  },
  {
    id: 3,
    title: "Delta Personal Service",
    category: "Professional Services Website",
    description: "Streamlined website for a personal services company, offering professional solutions and customer-focused services.",
    imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://deltapersonalservice.biz/",
  },
  {
    id: 4,
    title: "Precision Fabricated",
    category: "Industrial Services Website",
    description: "Technical website highlighting precision fabrication services and capabilities.",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://precisionfabricated.com/",
  },
  {
    id: 5,
    title: "Robinson Concrete LLC",
    category: "Construction Services Website", 
    description: "Professional website for a concrete services company, showcasing expertise and past projects.",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://robinsonconcretellc.com/",
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
