// Utility function to get consistent plan display names across the application
export const getPlanDisplayName = (planType: string): string => {
  const displayNames: Record<string, string> = {
    'basic': 'Hosting Basic',
    'pro': 'Hosting Pro',
    // Legacy mappings for backward compatibility
    'standard': 'Hosting Pro',
    'premium': 'Hosting Pro'
  };
  
  return displayNames[planType.toLowerCase()] || planType;
};

// Returns the monthly equivalent rate for display purposes
// Note: For yearly plans, this returns the per-month rate ($10/month for basic, $20/month for pro)
// The actual annual charge is this rate × 12
export const getPlanPrice = (planType: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): number => {
  const pricing: Record<string, { monthly: number; yearly: number }> = {
    'basic': { monthly: 15, yearly: 10 }, // yearly shows $10/month (charged as $120/year)
    'pro': { monthly: 30, yearly: 20 }, // yearly shows $20/month (charged as $240/year)
    // Legacy mappings
    'standard': { monthly: 30, yearly: 20 },
    'premium': { monthly: 30, yearly: 20 }
  };
  
  const plan = pricing[planType.toLowerCase()];
  return plan ? plan[billingCycle] : 0;
};

// Returns the actual annual total charged for yearly plans
export const getPlanAnnualTotal = (planType: string): number => {
  const annualPricing: Record<string, number> = {
    'basic': 120,  // $10/month × 12
    'pro': 240,    // $20/month × 12
    'standard': 240,
    'premium': 240
  };
  
  return annualPricing[planType.toLowerCase()] || 0;
};
