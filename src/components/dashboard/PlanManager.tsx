
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';

interface PlanManagerProps {
  currentPlan: {
    name: string;
    price: string;
    renewalDate: string;
    status: string;
  };
  onUpgrade: () => void;
}

const PlanManager: React.FC<PlanManagerProps> = ({ currentPlan, onUpgrade }) => {
  const isBasicPlan = currentPlan.name === 'Hosting Basic';
  
  const basicFeatures = [
    "99.9% uptime guarantee",
    "Fast global CDN",
    "Basic SEO optimization",
    "Automatic backups",
    "SSL certificate included",
    "24/7 infrastructure monitoring",
    "1 GB storage"
  ];
  
  const proFeatures = [
    "Everything in Basic",
    "99.99% uptime guarantee",
    "Advanced SEO tools",
    "Priority support",
    "Performance optimization",
    "Daily backups",
    "5 GB storage",
    "Custom domain included",
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">My Hosting Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Plan */}
        <Card className={`border-2 ${isBasicPlan ? "border-flyy-400" : "border-flyy-600"}`}>
          <CardHeader className={`${isBasicPlan ? "bg-flyy-50" : "bg-flyy-100"} pb-2`}>
            <CardTitle>{currentPlan.name}</CardTitle>
            <CardDescription className="text-base font-medium text-gray-700">{currentPlan.price}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 capitalize">{currentPlan.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next renewal:</span>
                <span className="font-medium">{currentPlan.renewalDate}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Features included:</h3>
            <ul className="space-y-2">
              {(isBasicPlan ? basicFeatures : proFeatures).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Upgrade Card (only show if on Basic plan) */}
        {isBasicPlan && (
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 pb-2">
              <CardTitle>Hosting Pro</CardTitle>
              <CardDescription className="text-base font-medium text-gray-700">$30/month</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">Enhanced features for growing businesses with higher traffic needs.</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-flyy-600">Upgrade Benefits:</span>
                </div>
                <div className="text-sm text-gray-600 pl-4">
                  • Higher uptime guarantee (99.99%)<br />
                  • Advanced SEO tools<br />
                  • Priority support<br />
                  • Custom domain included<br />
                  • 5GB storage (vs. 1GB)
                </div>
              </div>
              
              <Button 
                className="w-full bg-flyy-600 hover:bg-flyy-700"
                onClick={onUpgrade}
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium mb-2">Need more resources?</h3>
        <p className="text-gray-600 mb-4">Contact us for custom enterprise hosting solutions tailored to your specific needs.</p>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </div>
  );
};

export default PlanManager;
