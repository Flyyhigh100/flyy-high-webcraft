
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const portfolioProjects = [
  {
    id: 1,
    title: "Across The King's River",
    category: "Spiritual & Cultural Platform",
    description: "Inspirational website merging African wisdom traditions with modern spiritual growth, featuring books, meditations, and cultural storytelling to empower personal transformation.",
    imageUrl: "/lovable-uploads/kings-river.jpg",
    websiteUrl: "https://acrossthekingsriver.com/",
  },
  {
    id: 2,
    title: "Precision Fabricated",
    category: "Industrial Manufacturing Website",
    description: "Professional website for a DeLand-based family-owned fabrication business dedicated to delivering quality precision components and metal fabrication solutions.",
    imageUrl: "/lovable-uploads/da2a20ea-3bc6-448d-a5c5-ff2b68b40cd3.png",
    websiteUrl: "https://precisionfabricated.com/",
  },
  {
    id: 3,
    title: "Hakuna Matata Daycare",
    category: "Childcare Services Website",
    description: "Bilingual daycare website based in Germany offering exceptional child care services, featuring colorful and engaging design perfect for families seeking quality childcare.",
    imageUrl: "/lovable-uploads/1a09c143-cf6f-4cb4-8a37-3000e0efa2d0.png",
    websiteUrl: "https://hakunamatata.biz/",
  },
  {
    id: 4,
    title: "CageChain",
    category: "Cryptocurrency Learning Platform",
    description: "Educational crypto hub providing comprehensive resources for cryptocurrency and decentralized finance (DeFi) learning, featuring interactive dashboards and trading simulators.",
    imageUrl: "/lovable-uploads/008c757f-a996-4036-b788-f7dbf9fce7c7.png",
    websiteUrl: "https://cagechain.com/",
  },
  {
    id: 5,
    title: "1 Million Strong Fight Club",
    category: "Healthcare Technology & Investment Platform",
    description: "Comprehensive platform showcasing affordable cancer treatments and investment opportunities in medical innovation with token-based funding.",
    imageUrl: "/lovable-uploads/f78b96dc-5cfb-4143-a508-fec500284300.png",
    websiteUrl: "https://1millionstrongfightclub.com/",
  },
  {
    id: 6,
    title: "Robinson Concrete LLC",
    category: "Construction Services Website",
    description: "Professional website for Robinson & Sons Concrete, emphasizing customer satisfaction and quality craftsmanship in residential and commercial concrete projects.",
    imageUrl: "/lovable-uploads/749267d4-cf51-4a6a-ab90-d223a3eaf75e.png",
    websiteUrl: "https://robinsonconcretellc.com/",
  },
  {
    id: 7,
    title: "Home Health Service",
    category: "Healthcare Services Website",
    description: "Comprehensive home health service platform offering personalized medical care, medication management, meal preparation, and companion care throughout Volusia County.",
    imageUrl: "/lovable-uploads/bf714f6c-c702-44a2-8f28-3021c436b234.png",
    websiteUrl: "https://www.homehealthservice.co/",
  },
  {
    id: 8,
    title: "Delta Personal Service",
    category: "Healthcare Recruitment Website",
    description: "Gateway platform connecting qualified nursing professionals with German healthcare opportunities, facilitating international healthcare career placement.",
    imageUrl: "/lovable-uploads/7352b36f-b173-4f99-80f7-13efefb6db30.png",
    websiteUrl: "https://deltapersonalservice.biz/",
  }
];

const PortfolioSection = () => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleImageError = (projectId: number) => {
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
  };

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsHeaderVisible(true); },
      { threshold: 0.2 }
    );
    const cardsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          portfolioProjects.forEach((_, index) => {
            setTimeout(() => setVisibleCards(prev => [...prev, index]), index * 80);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) headerObserver.observe(headerRef.current);
    if (cardsRef.current) cardsObserver.observe(cardsRef.current);
    return () => { headerObserver.disconnect(); cardsObserver.disconnect(); };
  }, []);

  return (
    <section id="portfolio" className="section">
      <div className="container mx-auto">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-500 ease-out ${
            isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Our Portfolio</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore our latest projects and see how we help businesses transform their online presence.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {portfolioProjects.map((project, index) => (
            <div
              key={project.id}
              className={`rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 ease-out ${
                visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="h-48 overflow-hidden bg-secondary">
                {imageErrors[project.id] ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌐</div>
                      <p className="text-muted-foreground text-sm">{project.title}</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-contain bg-card"
                    onError={() => handleImageError(project.id)}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-6">
                <span className="text-primary text-sm font-medium">{project.category}</span>
                <h3 className="text-xl font-bold mt-1 mb-2">{project.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                <a 
                  href={project.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-primary font-medium hover:underline"
                >
                  Visit Website <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Link to="/portfolio">View All Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
