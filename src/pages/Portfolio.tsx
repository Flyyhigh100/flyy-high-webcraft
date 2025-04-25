
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

// Sample case studies with more detail
const caseStudies = [
  {
    id: 1,
    title: "E-Commerce Platform Redesign",
    client: "FashionHub",
    category: "E-commerce / Web Development",
    description: "A complete overhaul of an outdated e-commerce platform, resulting in a 65% increase in conversion rate and 45% increase in average order value.",
    imageUrl: "https://images.unsplash.com/photo-1661956602944-249bcd04b63f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    technologies: ["React", "Node.js", "Stripe", "AWS"],
    results: [
      "65% increase in conversion rate",
      "45% increase in average order value",
      "30% reduction in bounce rate",
      "Improved mobile experience"
    ]
  },
  {
    id: 2,
    title: "HealthTech Patient Dashboard",
    client: "MediCare Solutions",
    category: "UI/UX Design / Web Application",
    description: "A comprehensive patient management system with intuitive data visualization and secure medical records access.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    technologies: ["TypeScript", "React", "D3.js", "Firebase"],
    results: [
      "Reduced admin time by 40%",
      "Improved patient satisfaction scores by 25%",
      "HIPAA compliant data handling",
      "Seamless integration with existing systems"
    ]
  },
  {
    id: 3,
    title: "AI-Powered Real Estate Platform",
    client: "HomeSeeker",
    category: "Web Application / AI Integration",
    description: "Property listing platform with sophisticated AI recommendations based on user preferences and browsing behavior.",
    imageUrl: "https://images.unsplash.com/photo-1565041062078-19bbca28101a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    technologies: ["Next.js", "TensorFlow.js", "GraphQL", "PostgreSQL"],
    results: [
      "85% of users found properties matching their criteria",
      "2.5x increase in user engagement",
      "50% faster property search time",
      "Personalized recommendations with 90% accuracy"
    ]
  },
  {
    id: 4,
    title: "Financial Analytics Dashboard",
    client: "InvestPro",
    category: "Data Visualization / Web Application",
    description: "Advanced financial analytics platform with real-time data processing and interactive visualizations for investment professionals.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    technologies: ["Vue.js", "D3.js", "WebSockets", "Python backend"],
    results: [
      "Real-time processing of market data",
      "95% user satisfaction among financial analysts",
      "Custom alert systems increased timely decisions by 60%",
      "Seamless integration with major financial data providers"
    ]
  },
  {
    id: 5,
    title: "Restaurant Ordering System",
    client: "Taste Explorers",
    category: "Mobile Application / E-commerce",
    description: "A complete digital ordering system for a restaurant chain, including customer-facing app, kitchen display system, and admin dashboard.",
    imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    technologies: ["React Native", "Firebase", "Stripe", "Node.js"],
    results: [
      "78% of orders moved to digital platform",
      "Average order processing time reduced by 7 minutes",
      "20% increase in average order value",
      "Customer satisfaction increased by 35%"
    ]
  },
  {
    id: 6,
    title: "Educational Platform Redesign",
    client: "LearnForward Academy",
    category: "UX/UI Design / E-learning",
    description: "Complete redesign of a digital learning platform, focusing on improved engagement and accessibility for diverse learning needs.",
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((project) => (
                <div key={project.id} className="rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
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
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-flyy-600 text-sm font-medium">{project.category}</span>
                      <span className="text-gray-500 text-sm">Client: {project.client}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-flyy-600 hover:bg-flyy-700">
                      View Case Study
                    </Button>
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
