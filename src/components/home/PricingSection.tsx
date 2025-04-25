
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  
  const plans = [
    {
      name: "Basic",
      description: "Perfect for small businesses just getting started.",
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        "Responsive website (5 pages)",
        "Basic SEO setup",
        "Contact form",
        "Mobile optimization",
        "1 month of support",
      ],
      featured: false,
      cta: "Get Started",
    },
    {
      name: "Growth",
      description: "Ideal for growing businesses that need more features.",
      monthlyPrice: 199,
      yearlyPrice: 159,
      features: [
        "Everything in Basic",
        "Up to 10 pages",
        "Blog setup",
        "Newsletter integration",
        "E-commerce functionality (basic)",
        "3 months of support & maintenance",
        "Analytics setup",
      ],
      featured: true,
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      description: "For established businesses requiring advanced solutions.",
      monthlyPrice: 349,
      yearlyPrice: 279,
      features: [
        "Everything in Growth",
        "Unlimited pages",
        "Custom features & integrations",
        "Advanced e-commerce",
        "AI recommendation engine",
        "12 months of support & maintenance",
        "Performance optimization",
        "Security hardening",
      ],
      featured: false,
      cta: "Contact Us",
    },
  ];

  return (
    <section className="section bg-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Simple Pricing</span>, No Hidden Fees
          </h2>
          <p className="text-gray-700 text-lg mb-8">
            Choose the perfect plan for your business needs.
          </p>
          
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${!isYearly ? "font-medium text-flyy-800" : "text-gray-500"}`}>
              Monthly
            </span>
            <div className="relative inline-flex">
              <div className="w-12 h-6 transition duration-200 ease-linear rounded-full bg-gray-300">
                <label 
                  htmlFor="toggle"
                  className={`absolute left-0 w-6 h-6 transition-transform duration-200 ease-linear transform bg-white border-2 rounded-full cursor-pointer ${isYearly ? "translate-x-full border-flyy-600" : "border-gray-300"}`}
                ></label>
                <input 
                  type="checkbox"
                  id="toggle"
                  className="w-full h-full appearance-none focus:outline-none cursor-pointer"
                  checked={isYearly}
                  onChange={() => setIsYearly(!isYearly)}
                />
              </div>
            </div>
            <span className={`ml-3 ${isYearly ? "font-medium text-flyy-800" : "text-gray-500"}`}>
              Yearly <span className="text-flyy-600 font-medium">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl overflow-hidden ${
                plan.featured 
                  ? "border-2 border-flyy-500 shadow-xl relative" 
                  : "border border-gray-200 shadow-md"
              }`}
            >
              {plan.featured && (
                <div className="bg-flyy-500 text-white text-center py-2">
                  <span className="font-medium">Most Popular</span>
                </div>
              )}
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                  {isYearly && (
                    <p className="text-flyy-600 font-medium mt-1">Billed annually</p>
                  )}
                </div>
                <Button 
                  className={`w-full mb-8 ${plan.featured ? "bg-flyy-600 hover:bg-flyy-700" : "bg-gray-800 hover:bg-gray-900"}`}
                >
                  {plan.cta}
                </Button>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="text-green-500 mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16 max-w-2xl mx-auto">
          <p className="text-lg text-gray-600">
            Need a custom solution for your business?
          </p>
          <Button className="mt-4 px-8 py-6 text-lg bg-flyy-800 hover:bg-flyy-900">
            Contact Us for Custom Pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
