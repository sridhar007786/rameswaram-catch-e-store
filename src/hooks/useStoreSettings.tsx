import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type StoreSettings = {
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  whatsapp_number: string;
  whatsapp_notifications: string;
  email_notifications: string;
  delivery_charge: string;
  free_delivery_threshold: string;
  order_confirmation_msg: string;
  [key: string]: string;
};

const DEFAULTS: StoreSettings = {
  store_name: 'Meenava Sonthangal',
  store_phone: '+91 98765 43210',
  store_email: 'order@meenavasonthangal.com',
  store_address: 'Beach Road, Kanyakumari, Tamil Nadu 629702',
  whatsapp_number: '919876543210',
  whatsapp_notifications: 'true',
  email_notifications: 'true',
  delivery_charge: '49',
  free_delivery_threshold: '500',
  order_confirmation_msg: 'Thank you for your order!',
};

export const useStoreSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['store_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_settings').select('key, value');
      if (error) throw error;
      const map: Record<string, string> = { ...DEFAULTS };
      (data || []).forEach((s: any) => {
        if (s.value !== null && s.value !== undefined && s.value !== '') map[s.key] = s.value;
      });
      return map as StoreSettings;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  return { settings: data || DEFAULTS, isLoading };
};

// Helper to clean phone for tel:/wa.me links
export const cleanPhone = (phone: string) => phone.replace(/[^\d+]/g, '');
export const waNumber = (phone: string) => phone.replace(/\D/g, '');
