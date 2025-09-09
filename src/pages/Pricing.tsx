
import React from 'react';
import PricingSection from '@/components/home/PricingSection';
import WebsiteDevelopmentSection from '@/components/home/WebsiteDevelopmentSection';
import { DomainSearchSection } from '@/components/home/DomainSearchSection';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Star, Zap, Heart } from 'lucide-react';
import CTASection from '@/components/home/CTASection';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const Pricing = () => {
  // FAQ items
  const faqs = [
    {
      question: "What's included in website development packages?",
      answer: "Each package includes professional design, mobile responsive layout, SEO optimization, and revision rounds. Higher tiers add more pages, custom functionality, database integration, and extended support."
    },
    {
      question: "How long does website development take?",
      answer: "Development timelines are discussed and agreed upon during the project consultation. We work efficiently while ensuring quality and your satisfaction with the final product."
    },
    {
      question: "What's included in the hosting plans?",
      answer: "Our hosting plans include modern deployment infrastructure, cloud database integration, automatic backups, SSL certificates, custom domain support, website monitoring, and email support."
    },
    {
      question: "Can I get a custom solution outside these packages?",
      answer: "Absolutely! We work with businesses of all sizes and requirements. Whether you need something simpler than our Starter package or more complex than Premium, we'll create a custom solution that fits your budget and needs."
    },
    {
      question: "Do you offer payment plans?",
      answer: "Yes, for larger projects we offer flexible payment options. Contact us to discuss payment plans that work for your budget, including milestone-based payments for development projects."
    },
    {
      question: "What happens after my website is built?",
      answer: "After delivery, you own your website completely. We offer ongoing hosting services to keep your site online and running smoothly. You can also choose to host elsewhere - we'll help with the transition."
    },
  ];

  // Comparison table data
  const features = [
    { name: "Deployment Platform", basic: "Standard", pro: "Priority" },
    { name: "Cloud Storage", basic: "1 GB", pro: "5 GB" },
    { name: "SSL Certificate", basic: true, pro: true },
    { name: "Custom Domain", basic: true, pro: true },
    { name: "User Authentication", basic: true, pro: true },
    { name: "Automated Backups", basic: "Daily", pro: "Multiple" },
    { name: "SEO Optimization", basic: "Basic", pro: "Advanced" },
    { name: "Build Performance", basic: "Standard", pro: "Optimized" },
    { name: "Email Support", basic: true, pro: true },
    { name: "Website Monitoring", basic: "Basic", pro: "Enhanced" },
  ];

  return (
    <>
      <div className="bg-gradient-to-br from-primary/5 to-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Services & Pricing</h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            From simple websites to complex web applications - we build digital solutions that grow with your business.
          </p>
          
          {/* Custom Solutions Banner */}
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <Zap className="h-6 w-6 text-primary" />
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Every Business is Unique</h2>
              <p className="text-muted-foreground text-lg mb-4">
                Whether you need a simple $150 landing page or a complex enterprise solution, we work with you to find the perfect fit. 
                <span className="font-semibold text-foreground"> No project is too small or too large</span> - we'll create a custom solution that matches your budget and requirements.
              </p>
              <p className="text-sm text-muted-foreground">
                💡 All our pricing is flexible. Need something different? Let's talk!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <WebsiteDevelopmentSection />
      
      <PricingSection />
      
      <DomainSearchSection />
      
      {/* Feature comparison table */}
      <div className="section bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Hosting Features Comparison</h2>
          <div className="overflow-x-auto max-w-4xl mx-auto">
            <Table className="min-w-full bg-card border border-border shadow-md rounded-lg overflow-hidden">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6 py-4 text-left font-bold">Feature</TableHead>
                  <TableHead className="px-6 py-4 text-center font-bold">Basic</TableHead>
                  <TableHead className="px-6 py-4 text-center font-bold">Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {features.map((feature, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                    <TableCell className="px-6 py-4 whitespace-nowrap font-medium">{feature.name}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.basic === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : feature.basic === false ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span>{feature.basic}</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center bg-primary/5">
                      {feature.pro === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : feature.pro === false ? (
                        <span className="text-muted-foreground">—</span>
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
      <div className="section bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
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
