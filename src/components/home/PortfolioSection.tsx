
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

        <div className="flex justify-center items-center mb-12">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Browser window header */}
              <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto">
                  <div className="w-64 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              
              {/* Featured project preview */}
              <div className="aspect-video relative">
                <img 
                  src={portfolioProjects[0].imageUrl}
                  alt={portfolioProjects[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{portfolioProjects[0].title}</h3>
                  <p className="text-gray-600">{portfolioProjects[0].category}</p>
                </div>
                <a 
                  href={portfolioProjects[0].websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-flyy-600 bg-flyy-600 text-white px-4 py-2 rounded-md hover:bg-flyy-700 transition-colors"
                >
                  Visit Site <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {portfolioProjects.slice(1).map((project) => (
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
