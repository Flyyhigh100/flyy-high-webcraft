
export interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  last_sign_in?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  user_email: string;
  amount: number;
  status: string;
  payment_date: string;
  plan: string;
}

export interface ClientWebsite {
  id: string;
  name: string;
  url: string;
  planType: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  paymentStatus?: string;
  lastPaymentReminderSent?: string;
  gracePeriodEndDate?: string;
  suspensionDate?: string;
  clientEmail?: string;
  clientRole?: string;
}

export interface RevenueData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}
