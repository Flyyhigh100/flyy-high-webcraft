
export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  client?: string;
  technologies?: string[];
  results?: string[];
}

export interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
  avatarUrl: string;
  company: string;
}

export interface PlanFeature {
  name: string;
  basic: boolean | string;
  pro: boolean | string;
}

export interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  featured: boolean;
  cta: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

// Plan type mapping for consistent display names
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  basic: 'Hosting Basic',
  pro: 'Hosting Pro'
};

export type PlanType = 'basic' | 'pro';

