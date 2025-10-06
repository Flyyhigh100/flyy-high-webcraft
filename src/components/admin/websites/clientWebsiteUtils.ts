
export function getPlanBadgeColor(planType: string): string {
  const normalizedPlan = planType.toLowerCase();
  switch (normalizedPlan) {
    case 'pro':
    case 'premium': // Legacy
    case 'standard': // Legacy
      return 'bg-purple-500';
    case 'basic':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}
