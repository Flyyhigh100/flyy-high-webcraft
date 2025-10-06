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

export const getPlanPrice = (planType: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): number => {
  const pricing: Record<string, { monthly: number; yearly: number }> = {
    'basic': { monthly: 15, yearly: 10 },
    'pro': { monthly: 30, yearly: 20 },
    // Legacy mappings
    'standard': { monthly: 30, yearly: 20 },
    'premium': { monthly: 30, yearly: 20 }
  };
  
  const plan = pricing[planType.toLowerCase()];
  return plan ? plan[billingCycle] : 0;
};
