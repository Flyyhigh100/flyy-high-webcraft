
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const portfolioProjects = [
  {
    id: 1,
    title: "Shys Luxury Hairstyles",
    category: "Small Business Website",
    description: "Elegant website for a luxury hair styling business, showcasing services and brand identity.",
    imageUrl: "/lovable-uploads/345c72d1-a533-4510-8208-bfff7be2dc0a.png",
    websiteUrl: "https://shysluxuryhairstyles.com/",
  },
  {
    id: 2,
    title: "Hakuna Matata Business",
    category: "Corporate Website",
    description: "Modern and professional website for a diverse business platform.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://hakunamatata.biz/",
  },
  {
    id: 3,
    title: "Precision Fabricated",
    category: "Industrial Services Website",
    description: "Technical website highlighting precision fabrication services and capabilities.",
    imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://precisionfabricated.com/",
  },
  {
    id: 4,
    title: "Robinson Concrete LLC",
    category: "Construction Services Website", 
    description: "Professional website for a concrete services company, showcasing expertise and past projects.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioProjects.map((project) => (
            <div key={project.id} className="rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-[16/10] overflow-hidden">
                <div 
                  className="w-full h-full bg-gray-200"
                  style={{
                    backgroundImage: `url(${project.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
              <div className="p-6">
                <span className="text-flyy-600 text-sm font-medium">{project.category}</span>
                <h3 className="text-xl font-bold mt-1 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
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
