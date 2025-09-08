
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
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
    
    // Basic client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the contact-form edge function
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
          company: formData.company.trim() || undefined
        }
      });

      if (error) {
        console.error("Contact form error:", error);
        
        // Handle specific error cases
        if (error.message?.includes('Too many attempts') || error.message?.includes('rate limit')) {
          toast({
            title: "Too Many Requests",
            description: "Please wait a moment before sending another message.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Unable to send your message. Please try again or contact us directly.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll get back to you shortly.",
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to send your message. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (err) {
      console.error("Contact form network error:", err);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your Company"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-flyy-500 focus:border-flyy-500"
            >
              <option value="" disabled>Select a subject</option>
              <option value="New Project">New Project</option>
              <option value="Website Redesign">Website Redesign</option>
              <option value="Maintenance Request">Maintenance Request</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Tell us about your project..."
            className="w-full"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-flyy-600 hover:bg-flyy-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
