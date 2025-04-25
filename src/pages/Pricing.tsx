
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingSection from '@/components/home/PricingSection';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import CTASection from '@/components/home/CTASection';

const Pricing = () => {
  // FAQ items
  const faqs = [
    {
      question: "What's included in the website development package?",
      answer: "Our website development packages include design, development, responsive layouts, basic SEO setup, contact forms, and cross-browser testing. Each plan varies in terms of number of pages, features, and support duration."
    },
    {
      question: "How long does it take to build a website?",
      answer: "The timeline varies depending on the complexity of the project. A basic website typically takes 2-4 weeks, while more complex projects with custom features can take 6-12 weeks. We'll provide a specific timeline during our initial consultation."
    },
    {
      question: "Do you offer ongoing maintenance?",
      answer: "Yes, we offer ongoing maintenance and support packages to ensure your website remains secure, up-to-date, and performing optimally. Our plans include regular updates, backups, security monitoring, and technical support."
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Absolutely! You can upgrade to a higher-tier plan at any time. We'll work with you to smoothly transition and implement any additional features or services included in your new plan."
    },
    {
      question: "Do you offer custom solutions outside of these packages?",
      answer: "Yes, we specialize in custom solutions tailored to your specific business needs. Contact us to discuss your project requirements, and we'll create a custom proposal for you."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards, bank transfers, and PayPal. For our development projects, we typically require a 50% deposit upfront, with the remaining balance due upon project completion."
    },
  ];

  // Comparison table data
  const features = [
    { name: "Responsive Design", basic: true, growth: true, enterprise: true },
    { name: "SEO Optimization", basic: "Basic", growth: "Advanced", enterprise: "Comprehensive" },
    { name: "Number of Pages", basic: "Up to 5", growth: "Up to 10", enterprise: "Unlimited" },
    { name: "Content Management System", basic: true, growth: true, enterprise: true },
    { name: "E-commerce Functionality", basic: false, growth: "Basic", enterprise: "Advanced" },
    { name: "Custom Design", basic: "Template-based", growth: "Semi-custom", enterprise: "Fully Custom" },
    { name: "Maintenance & Support", basic: "1 month", growth: "3 months", enterprise: "12 months" },
    { name: "Performance Optimization", basic: "Basic", growth: "Standard", enterprise: "Advanced" },
    { name: "Analytics Setup", basic: false, growth: true, enterprise: true },
    { name: "AI Integration", basic: false, growth: false, enterprise: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Pricing Plans</h1>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
              Transparent pricing with no hidden fees. Choose the plan that fits your business needs.
            </p>
          </div>
        </div>
        
        <PricingSection />
        
        {/* Feature comparison table */}
        <div className="section bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Features Comparison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 font-bold">Feature</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-bold">Basic</th>
                    <th className="px-6 py-4 text-center text-flyy-700 font-bold">Growth</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-bold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {features.map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{feature.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.basic === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.basic === false ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span>{feature.basic}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center bg-flyy-50">
                        {feature.growth === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.growth === false ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span>{feature.growth}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.enterprise === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.enterprise === false ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span>{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* FAQ section */}
        <div className="section bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
