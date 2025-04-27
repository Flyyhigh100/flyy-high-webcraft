
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Sample case studies with more detail
const caseStudies = [
  {
    id: 1,
    title: "Shys Luxury Hairstyles",
    client: "Small Business",
    category: "Small Business Website",
    description: "Elegant website for a luxury hair styling business, showcasing services and brand identity.",
    imageUrl: "/lovable-uploads/345c72d1-a533-4510-8208-bfff7be2dc0a.png",
    websiteUrl: "https://shysluxuryhairstyles.com/",
    technologies: ["React", "Tailwind CSS", "Framer Motion", "Firebase"],
    results: [
      "40% increase in online bookings",
      "Improved brand perception",
      "Mobile-friendly responsive design",
      "Seamless appointment scheduling system"
    ]
  },
  {
    id: 2,
    title: "Hakuna Matata Business",
    client: "Corporate Client",
    category: "Corporate Website",
    description: "Modern and professional website for a diverse business platform.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://hakunamatata.biz/",
    technologies: ["TypeScript", "React", "GraphQL", "AWS"],
    results: [
      "65% increase in lead generation",
      "45% increase in user engagement",
      "30% reduction in bounce rate",
      "Improved SEO rankings"
    ]
  },
  {
    id: 3,
    title: "Precision Fabricated",
    client: "Manufacturing Industry",
    category: "Industrial Services Website",
    description: "Technical website highlighting precision fabrication services and capabilities.",
    imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://precisionfabricated.com/",
    technologies: ["Next.js", "Tailwind CSS", "Sanity CMS", "Vercel"],
    results: [
      "85% increase in B2B inquiries",
      "Virtual factory tours increased customer trust",
      "Simplified quote request process",
      "Multilingual support expanded market reach"
    ]
  },
  {
    id: 4,
    title: "Robinson Concrete LLC",
    client: "Construction Services",
    category: "Construction Services Website", 
    description: "Professional website for a concrete services company, showcasing expertise and past projects.",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "https://robinsonconcretellc.com/",
    technologies: ["WordPress", "Elementor", "WooCommerce", "Custom PHP"],
    results: [
      "120% increase in quote requests",
      "Project gallery increased customer confidence",
      "Streamlined contact process",
      "Improved local SEO and map visibility"
    ]
  },
  {
    id: 5,
    title: "HealthTech Patient Dashboard",
    client: "MediCare Solutions",
    category: "UI/UX Design / Web Application",
    description: "A comprehensive patient management system with intuitive data visualization and secure medical records access.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "#",
    technologies: ["TypeScript", "React", "D3.js", "Firebase"],
    results: [
      "Reduced admin time by 40%",
      "Improved patient satisfaction scores by 25%",
      "HIPAA compliant data handling",
      "Seamless integration with existing systems"
    ]
  },
  {
    id: 6,
    title: "Educational Platform Redesign",
    client: "LearnForward Academy",
    category: "UX/UI Design / E-learning",
    description: "Complete redesign of a digital learning platform, focusing on improved engagement and accessibility for diverse learning needs.",
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    websiteUrl: "#",
    technologies: ["React", "GraphQL", "MongoDB", "AWS"],
    results: [
      "55% increase in lesson completion rates",
      "Student engagement increased by 47%",
      "Accessible design improved inclusivity for all learners",
      "Course enrollment increased by 32%"
    ]
  },
];

const Portfolio = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
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
                    <div className="aspect-auto md:aspect-square overflow-hidden">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
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
                      
                      <div className="mb-6">
                        <h4 className="font-medium text-lg mb-2">Results:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {project.results.map((result, index) => (
                            <li key={index}>{result}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {project.websiteUrl !== "#" && (
                        <a 
                          href={project.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center bg-flyy-600 text-white px-6 py-3 rounded-md hover:bg-flyy-700 transition-colors w-full md:w-auto"
                        >
                          Visit Live Website <ExternalLink className="ml-2 w-4 h-4" />
                        </a>
                      )}
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Portfolio;
