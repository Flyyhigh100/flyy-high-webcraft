
import React from 'react';
import PricingSection from '@/components/home/PricingSection';
import { DomainSearchSection } from '@/components/home/DomainSearchSection';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Star, Zap, Heart } from 'lucide-react';
import CTASection from '@/components/home/CTASection';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const Pricing = () => {
  // FAQ items
  const faqs = [
    {
      question: "How do you determine project pricing?",
      answer: "Every project is unique, so we create custom quotes based on your specific needs, timeline, and budget. After our free consultation, we'll provide a detailed proposal with transparent pricing and clear deliverables."
    },
    {
      question: "What's the consultation process like?",
      answer: "We start with a free discovery call to understand your goals, target audience, and requirements. We'll discuss your budget range and create a tailored solution that maximizes value within your parameters."
    },
    {
      question: "Can you work with smaller budgets?",
      answer: "Absolutely! We believe every business deserves a great web presence. We'll find creative solutions to deliver maximum impact within your budget, whether it's a simple landing page or a phased development approach."
    },
    {
      question: "What's included in the hosting plans?",
      answer: "Our hosting plans include modern deployment infrastructure, cloud database integration, automatic backups, SSL certificates, custom domain support, website monitoring, and email support."
    },
    {
      question: "How long does development take?",
      answer: "Timeline depends on project scope and complexity. During our consultation, we'll provide realistic timelines with milestone dates. We prioritize quality while working efficiently to meet your launch goals."
    },
    {
      question: "Do you offer payment plans?",
      answer: "Yes, for larger projects we offer flexible payment options including milestone-based payments and extended payment plans. We'll work with you to find a payment structure that fits your cash flow."
    },
    {
      question: "What happens after my website is built?",
      answer: "You own your website completely. We provide training on how to manage it, offer ongoing hosting services, and are available for future updates or enhancements as your business grows."
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
              <h2 className="text-2xl font-bold mb-4">How We Work With You</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Every project starts with a <span className="font-semibold text-foreground">free consultation</span> where we understand your needs, goals, and budget. 
                We then create a custom proposal that fits perfectly with what you want to achieve.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="font-semibold text-foreground mb-2">1. Discovery Call</div>
                  <p className="text-sm text-muted-foreground">We discuss your vision, requirements, and budget</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground mb-2">2. Custom Proposal</div>
                  <p className="text-sm text-muted-foreground">Tailored solution with clear timeline and pricing</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground mb-2">3. Collaborative Build</div>
                  <p className="text-sm text-muted-foreground">We work together to build exactly what you need</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-semibold">Any budget works</span> - from simple landing pages to complex applications
              </p>
            </div>
          </div>
        </div>
      </div>
      
      
      
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
