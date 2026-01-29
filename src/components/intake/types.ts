export interface IntakeFormData {
  // Section 1: Contact Information
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;

  // Section 2: About Your Business
  businessName: string;
  businessDescription: string;
  industry: string;
  hasExistingWebsite: boolean | null;
  currentWebsiteUrl: string;

  // Section 3: Branding & Design Assets
  hasLogo: string;
  hasColorPalette: string;
  brandColors: string;
  hasBrandGuidelines: string;
  hasProfessionalPhotos: string;

  // Section 4: Domain & Hosting
  ownsDomain: string;
  domainName: string;
  hasDomainRegistrarAccess: string;
  hasHosting: string;
  needsOngoingHosting: string;

  // Section 5: Website Requirements
  websiteTypes: string[];
  isNewOrRedesign: string;
  estimatedPages: string;
  requiredFeatures: string[];
  hasContentReady: string;
  needsContentUpdates: string;

  // Section 6: Design Preferences
  designStyles: string[];
  referenceWebsites: string;
  designDislikes: string;

  // Section 7: Budget & Timeline
  budgetRange: string;
  timeline: string;
  deadlineEvent: string;

  // Section 8: Additional Information
  competitors: string;
  targetAudience: string;
  websiteGoals: string[];
  referralSource: string;
  additionalNotes: string;
}

export interface StepProps {
  data: IntakeFormData;
  updateData: (updates: Partial<IntakeFormData>) => void;
  errors: Record<string, string>;
}

export const initialFormData: IntakeFormData = {
  fullName: '',
  email: '',
  phone: '',
  preferredContactMethod: '',
  businessName: '',
  businessDescription: '',
  industry: '',
  hasExistingWebsite: null,
  currentWebsiteUrl: '',
  hasLogo: '',
  hasColorPalette: '',
  brandColors: '',
  hasBrandGuidelines: '',
  hasProfessionalPhotos: '',
  ownsDomain: '',
  domainName: '',
  hasDomainRegistrarAccess: '',
  hasHosting: '',
  needsOngoingHosting: '',
  websiteTypes: [],
  isNewOrRedesign: '',
  estimatedPages: '',
  requiredFeatures: [],
  hasContentReady: '',
  needsContentUpdates: '',
  designStyles: [],
  referenceWebsites: '',
  designDislikes: '',
  budgetRange: '',
  timeline: '',
  deadlineEvent: '',
  competitors: '',
  targetAudience: '',
  websiteGoals: [],
  referralSource: '',
  additionalNotes: '',
};

export const STEP_TITLES = [
  'Contact',
  'Business',
  'Branding',
  'Domain',
  'Requirements',
  'Design',
  'Budget',
  'Additional',
];
