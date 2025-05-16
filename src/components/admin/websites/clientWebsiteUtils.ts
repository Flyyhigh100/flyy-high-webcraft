
export function getPlanBadgeColor(planType: string): string {
  switch (planType) {
    case 'Premium':
      return 'bg-purple-500';
    case 'Standard':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}
