import { MessageCircle } from 'lucide-react';
import { useStoreSettings, waNumber } from '@/hooks/useStoreSettings';

export const WhatsAppButton = () => {
  const { settings } = useStoreSettings();
  const phoneNumber = waNumber(settings.whatsapp_number || settings.store_phone);
  const message = encodeURIComponent(`Hi! I would like to order fresh seafood from ${settings.store_name}.`);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  if (!phoneNumber) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </a>
  );
};
