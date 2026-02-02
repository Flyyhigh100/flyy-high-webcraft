import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IntakeProgress from './IntakeProgress';
import ContactInfoStep from './steps/ContactInfoStep';
import BusinessInfoStep from './steps/BusinessInfoStep';
import BrandingAssetsStep from './steps/BrandingAssetsStep';
import DomainHostingStep from './steps/DomainHostingStep';
import WebsiteRequirementsStep from './steps/WebsiteRequirementsStep';
import DesignPreferencesStep from './steps/DesignPreferencesStep';
import BudgetTimelineStep from './steps/BudgetTimelineStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import SuccessStep from './steps/SuccessStep';
import { IntakeFormData, initialFormData, STEP_TITLES } from './types';

const MultiStepIntakeForm = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<IntakeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateData = useCallback((updates: Partial<IntakeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const clearedErrors: Record<string, string> = {};
    Object.keys(updates).forEach((key) => {
      clearedErrors[key] = '';
    });
    setErrors((prev) => ({ ...prev, ...clearedErrors }));
  }, []);

  const getStepErrors = (step: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Contact Info
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.preferredContactMethod) {
          newErrors.preferredContactMethod = 'Please select a contact method';
        }
        break;

      case 1: // Business Info
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.businessDescription.trim()) {
          newErrors.businessDescription = 'Business description is required';
        }
        if (!formData.industry) newErrors.industry = 'Please select an industry';
        if (formData.hasExistingWebsite === null) {
          newErrors.hasExistingWebsite = 'Please select an option';
        }
        break;

      case 2: // Branding
        if (!formData.hasLogo) newErrors.hasLogo = 'Please select an option';
        if (!formData.hasColorPalette) newErrors.hasColorPalette = 'Please select an option';
        if (!formData.hasBrandGuidelines) newErrors.hasBrandGuidelines = 'Please select an option';
        if (!formData.hasProfessionalPhotos) {
          newErrors.hasProfessionalPhotos = 'Please select an option';
        }
        break;

      case 3: // Domain & Hosting
        if (!formData.ownsDomain) newErrors.ownsDomain = 'Please select an option';
        if (!formData.hasDomainRegistrarAccess) {
          newErrors.hasDomainRegistrarAccess = 'Please select an option';
        }
        if (!formData.hasHosting) newErrors.hasHosting = 'Please select an option';
        if (!formData.needsOngoingHosting) {
          newErrors.needsOngoingHosting = 'Please select an option';
        }
        break;

      case 4: // Requirements
        if (formData.websiteTypes.length === 0) {
          newErrors.websiteTypes = 'Please select at least one website type';
        }
        if (!formData.isNewOrRedesign) newErrors.isNewOrRedesign = 'Please select an option';
        if (!formData.estimatedPages) newErrors.estimatedPages = 'Please select an option';
        if (formData.requiredFeatures.length === 0) {
          newErrors.requiredFeatures = 'Please select at least one feature';
        }
        if (!formData.hasContentReady) newErrors.hasContentReady = 'Please select an option';
        if (!formData.needsContentUpdates) {
          newErrors.needsContentUpdates = 'Please select an option';
        }
        break;

      case 5: // Design
        if (formData.designStyles.length === 0) {
          newErrors.designStyles = 'Please select at least one style';
        }
        break;

      case 6: // Budget
        if (!formData.budgetRange) newErrors.budgetRange = 'Please select a budget range';
        if (!formData.timeline) newErrors.timeline = 'Please select a timeline';
        break;

      case 7: // Additional
        if (!formData.targetAudience.trim()) {
          newErrors.targetAudience = 'Target audience is required';
        }
        if (formData.websiteGoals.length === 0) {
          newErrors.websiteGoals = 'Please select at least one goal';
        }
        break;
    }

    return newErrors;
  };

  const validateStep = (step: number): boolean => {
    const stepErrors = getStepErrors(step);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep);
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      setCompletedSteps((prev) => 
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
      setCurrentStep((prev) => Math.min(prev + 1, STEP_TITLES.length - 1));
    } else {
      const errorMessages = Object.values(stepErrors).filter(Boolean);
      const missingFields = errorMessages.length;
      toast({
        title: 'Required fields missing',
        description: missingFields === 1 
          ? errorMessages[0] 
          : `Please complete ${missingFields} required fields before continuing.`,
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (step: number) => {
    // Only allow going back or to completed steps
    if (step < currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    } else if (step === currentStep + 1 && validateStep(currentStep)) {
      setCompletedSteps((prev) => 
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-website-intake', {
        body: formData,
      });

      if (error) throw error;

      setIsSubmitted(true);
      setCompletedSteps((prev) => [...prev, currentStep]);
      toast({
        title: 'Submission successful!',
        description: 'We\'ve received your project details.',
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Extract a user-friendly message from the error
      let errorMessage = 'There was an error submitting your form. Please try again.';
      
      // Check for rate limit (429) or explicit rate limit message
      if (error?.message?.includes('Too many submissions') || 
          error?.message?.includes('rate limit') ||
          error?.status === 429) {
        errorMessage = error.message || 'Too many submissions. Please wait a few minutes and try again.';
      } else if (error?.message) {
        // Use the server's error message if available
        errorMessage = error.message;
      }
      
      toast({
        title: 'Submission failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to top of form when step changes (not on initial load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  if (isSubmitted) {
    return <SuccessStep />;
  }

  const renderStep = () => {
    const stepProps = { data: formData, updateData, errors };
    
    switch (currentStep) {
      case 0: return <ContactInfoStep {...stepProps} />;
      case 1: return <BusinessInfoStep {...stepProps} />;
      case 2: return <BrandingAssetsStep {...stepProps} />;
      case 3: return <DomainHostingStep {...stepProps} />;
      case 4: return <WebsiteRequirementsStep {...stepProps} />;
      case 5: return <DesignPreferencesStep {...stepProps} />;
      case 6: return <BudgetTimelineStep {...stepProps} />;
      case 7: return <AdditionalInfoStep {...stepProps} />;
      default: return null;
    }
  };

  const isLastStep = currentStep === STEP_TITLES.length - 1;

  return (
    <div ref={formRef} className="w-full max-w-3xl mx-auto">
      <IntakeProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      <div className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
        {renderStep()}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepIntakeForm;
