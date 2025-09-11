import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WebsiteDevelopmentSection = () => {
  const navigate = useNavigate();
  
  const packages = [
    {
      name: "Starter Package",
      description: "Personal brands & small businesses",
      price: 200,
      features: [
        "1–3 pages",
        "Mobile-responsive design",
        "Basic SEO setup",
        "Contact form integration",
        "Social media links",
        "SSL + hosting setup",
        "1 revision round",
      ],
      featured: false,
      cta: "Get Started",
    },
    {
      name: "Business Package",
      description: "Growing businesses & service providers",
      price: 500,
      features: [
        "5–8 professional pages",
        "Advanced forms",
        "E-commerce ready",
        "Google Analytics integration",
        "Enhanced SEO",
        "2 revision rounds",
        "15 days of support",
      ],
      featured: true,
      cta: "Get Started",
    },
    {
      name: "Premium Package",
      description: "Startups & businesses needing custom apps",
      price: 1200,
      startingAt: true,
      features: [
        "Up to 20 custom pages",
        "Database integration",
        "User authentication & dashboards",
        "API integrations",
        "Advanced functionality",
        "SEO + performance optimization",
        "3 revision rounds",
        "60 days of support",
      ],
      featured: false,
      cta: "Get Started",
    },
  ];
  
  const handleGetStarted = () => {
    navigate('/contact');
  };

  return (
    <section className="section bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Website Development</span> Packages
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Professional websites built with modern technologies, tailored to your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div 
              key={index} 
              className={`rounded-xl overflow-hidden ${
                pkg.featured 
                  ? "border-2 border-primary shadow-xl relative" 
                  : "border border-border shadow-md"
              } bg-card`}
            >
              {pkg.featured && (
                <div className="bg-primary text-primary-foreground text-center py-2">
                  <span className="font-medium">Most Popular</span>
                </div>
              )}
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-muted-foreground mb-6">{pkg.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {pkg.startingAt ? "Starting at " : ""}${pkg.price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {pkg.startingAt ? "starting at" : "one-time"}
                  </span>
                </div>
                <Button 
                  className={`w-full mb-8 ${pkg.featured ? "bg-primary hover:bg-primary/90" : ""}`}
                  variant={pkg.featured ? "default" : "outline"}
                  onClick={handleGetStarted}
                >
                  {pkg.cta}
                </Button>
                <ul className="space-y-4">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WebsiteDevelopmentSection;