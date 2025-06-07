
import { supabase } from "@/integrations/supabase/client";

export interface DomainCheckResponse {
  available: boolean;
  domain: string;
  price?: number;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const checkDomainAvailability = async (domain: string): Promise<DomainCheckResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('domain-check', {
      body: { domain }
    });

    if (error) {
      console.error('Domain check error:', error);
      throw new Error('Failed to check domain availability');
    }

    return data;
  } catch (error) {
    console.error('Error checking domain:', error);
    throw error;
  }
};

export const submitContactForm = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('contact-form', {
      body: formData
    });

    if (error) {
      console.error('Contact form error:', error);
      throw new Error('Failed to submit contact form');
    }

    return data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Website management functions
export interface WebsiteData {
  name: string;
  url: string;
  planType: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

export const createWebsite = async (websiteData: WebsiteData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('websites')
      .insert({
        name: websiteData.name,
        url: websiteData.url,
        plan_type: websiteData.planType,
        next_payment_date: websiteData.nextPaymentDate,
        next_payment_amount: websiteData.nextPaymentAmount,
        user_id: user.id,
        payment_status: 'current'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating website:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating website:', error);
    throw error;
  }
};

export const getUserWebsites = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user websites:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user websites:', error);
    throw error;
  }
};

export const updateWebsite = async (id: string, updates: Partial<WebsiteData>) => {
  try {
    // Map the interface properties to database column names
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.url !== undefined) dbUpdates.url = updates.url;
    if (updates.planType !== undefined) dbUpdates.plan_type = updates.planType;
    if (updates.nextPaymentDate !== undefined) dbUpdates.next_payment_date = updates.nextPaymentDate;
    if (updates.nextPaymentAmount !== undefined) dbUpdates.next_payment_amount = updates.nextPaymentAmount;

    const { data, error } = await supabase
      .from('websites')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating website:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating website:', error);
    throw error;
  }
};

export const deleteWebsite = async (id: string) => {
  try {
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting website:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting website:', error);
    throw error;
  }
};
