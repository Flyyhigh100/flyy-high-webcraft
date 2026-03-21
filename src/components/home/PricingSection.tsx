
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
  
  const plans = [
    {
      name: "Hosting Basic",
      description: "Everything you need to keep your website online and performing well.",
      price: 15,
      features: [
        "Modern deployment platform",
        "Cloud database integration", 
        "Basic SEO optimization",
        "Automatic daily backups",
        "SSL certificate included",
        "Website monitoring",
        "1 GB cloud storage",
      ],
      featured: false,
      cta: "Get Started",
    },
    {
      name: "Hosting Pro",
      description: "Enhanced features for growing businesses with higher traffic needs.",
      price: 30,
      features: [
        "Everything in Basic",
        "Priority deployment builds",
        "Advanced cloud features",
        "Priority email support",
        "Performance optimization",
        "Multiple backups",
        "5 GB cloud storage",
        "Custom domain support",
      ],
      featured: true,
      cta: "Get Started",
    },
  ];
  
  const handleGetStarted = () => {
    navigate('/project-intake');
  };

const PricingSection = () => {
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // ... keep existing code

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsHeaderVisible(true); },
      { threshold: 0.2 }
    );
    const cardsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          plans.forEach((_, index) => {
            setTimeout(() => setVisibleCards(prev => [...prev, index]), index * 150);
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
    <section className="section">
      <div className="container mx-auto">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-500 ease-out ${
            isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Hosting Plans</span>, Keep Your Site Running Smoothly
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Reliable hosting with all the essential features you need.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl overflow-hidden transition-all duration-500 ease-out ${
                visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } ${
                plan.featured 
                  ? "border-2 border-primary shadow-xl shadow-primary/10 relative" 
                  : "border border-border"
              } bg-card`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {plan.featured && (
                <div className="bg-primary text-primary-foreground text-center py-2">
                  <span className="font-medium">Most Popular</span>
                </div>
              )}
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <Button 
                  className={`w-full mb-8 ${plan.featured ? "" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
                  onClick={handleGetStarted}
                >
                  {plan.cta}
                </Button>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="text-primary mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16 max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground">
            Need a custom hosting solution for your business?
          </p>
          <Button 
            className="mt-4 px-8 py-6 text-lg"
            onClick={() => navigate('/contact')}
          >
            Contact Us for Custom Pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
