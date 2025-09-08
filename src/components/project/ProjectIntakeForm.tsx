import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProjectIntakeForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    currentWebsite: '',
    projectDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-project-inquiry', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          projectType: formData.projectType,
          currentWebsite: formData.currentWebsite || undefined,
          projectDescription: formData.projectDescription,
        },
      });

      if (error) throw error;

      toast({
        title: "Inquiry submitted successfully!",
        description: "Thank you for your interest. We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        currentWebsite: '',
        projectDescription: '',
      });
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your inquiry. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background rounded-xl shadow-md p-6 md:p-8 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Tell Us About Your Project</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Your Name *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Smith"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="projectType" className="block text-sm font-medium text-foreground mb-2">
              Project Type *
            </label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="" disabled>Select project type</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Business Website">Business Website</option>
              <option value="Portfolio Website">Portfolio Website</option>
              <option value="E-commerce Store">E-commerce Store</option>
              <option value="Blog/Content Site">Blog/Content Site</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="currentWebsite" className="block text-sm font-medium text-foreground mb-2">
            Current Website (if any)
          </label>
          <Input
            id="currentWebsite"
            name="currentWebsite"
            value={formData.currentWebsite}
            onChange={handleChange}
            placeholder="www.yoursite.com or 'No current website'"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            If you have an existing website, please share the URL or name
          </p>
        </div>
        
        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium text-foreground mb-2">
            Tell us about your project *
          </label>
          <Textarea
            id="projectDescription"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe your vision, goals, and any specific features you need..."
            className="w-full"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Project Inquiry"}
        </Button>
      </form>
    </div>
  );
};

export default ProjectIntakeForm;