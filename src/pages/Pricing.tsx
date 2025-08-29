
import React from 'react';
import PricingSection from '@/components/home/PricingSection';
import { DomainSearchSection } from '@/components/home/DomainSearchSection';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import CTASection from '@/components/home/CTASection';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const Pricing = () => {
  // FAQ items
  const faqs = [
    {
      question: "What's included in the hosting plan?",
      answer: "Our hosting plans include Lovable deployment platform, Supabase backend integration, automatic backups, SSL certificates, real-time monitoring, and SEO optimization tools. The Pro plan adds additional Supabase storage, priority support, and enhanced features."
    },
    {
      question: "How reliable is your hosting service?",
      answer: "Our hosting is built on Lovable's deployment platform with Supabase backend services. We provide reliable hosting with automatic monitoring and daily backups to ensure your website stays online and performs well."
    },
    {
      question: "Do you offer site migration services?",
      answer: "Yes, we can help migrate your existing website to our hosting platform. Our team will ensure a smooth transition with minimal downtime. Contact us for details on our migration services."
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Absolutely! You can upgrade to a higher-tier plan at any time. We'll prorate your billing so you only pay the difference for the remainder of your billing cycle."
    },
    {
      question: "Do you offer custom hosting solutions?",
      answer: "Yes, we provide custom hosting solutions for businesses with specific requirements. Contact us to discuss your needs, and we'll create a tailored hosting package for you."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards, bank transfers, and PayPal. For annual plans, we also offer invoicing options for businesses that require it."
    },
  ];

  // Comparison table data
  const features = [
    { name: "Lovable Platform", basic: "Standard", pro: "Priority" },
    { name: "Supabase Storage", basic: "1 GB", pro: "5 GB" },
    { name: "SSL Certificate", basic: true, pro: true },
    { name: "Supabase Auth", basic: true, pro: true },
    { name: "Automated Backups", basic: "Daily", pro: "Multiple" },
    { name: "SEO Optimization", basic: "Basic", pro: "Advanced" },
    { name: "Build Performance", basic: "Standard", pro: "Optimized" },
    { name: "Support", basic: "Email", pro: "Priority" },
    { name: "Custom Domain", basic: false, pro: true },
    { name: "Analytics", basic: "Basic", pro: "Enhanced" },
  ];

  return (
    <>
      <div className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Website Hosting</h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Reliable, fast and secure hosting to keep your website running smoothly 24/7.
          </p>
        </div>
      </div>
      
      <PricingSection />
      
      <DomainSearchSection />
      
      {/* Feature comparison table */}
      <div className="section bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Hosting Plans Comparison</h2>
          <div className="overflow-x-auto max-w-4xl mx-auto">
            <Table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left text-gray-700 font-bold">Feature</TableHead>
                  <TableHead className="px-6 py-4 text-center text-gray-700 font-bold">Basic</TableHead>
                  <TableHead className="px-6 py-4 text-center text-flyy-700 font-bold">Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {features.map((feature, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{feature.name}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.basic === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : feature.basic === false ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span>{feature.basic}</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center bg-flyy-50">
                      {feature.pro === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : feature.pro === false ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span>{feature.pro}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </>
  );
};

export default Pricing;
