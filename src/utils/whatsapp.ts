// WhatsApp automation utilities

const DEFAULT_WHATSAPP = '919876543210';

const getWhatsAppNumber = () => {
  // Could be fetched from store_settings, for now use default
  return DEFAULT_WHATSAPP;
};

export const sendOrderConfirmation = (order: {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; weight: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  address: string;
  paymentMethod: string;
}) => {
  const itemsList = order.items
    .map((i) => `• ${i.name} (${i.weight}) ×${i.quantity} — ₹${i.price * i.quantity}`)
    .join('\n');

  const msg = `🎉 *Order Confirmed!*\n\n📦 Order #${order.id.slice(0, 8)}\n👤 ${order.customerName}\n\n${itemsList}\n\n💰 Subtotal: ₹${order.subtotal}\n🚚 Delivery: ${order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}\n*Total: ₹${order.total}*\n\n📍 ${order.address}\n💳 Payment: ${order.paymentMethod.toUpperCase()}\n\nThank you for ordering from *Meenava Sonthangal*! 🐟`;

  const phone = order.customerPhone.replace(/[\s+\-()]/g, '');
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
  window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

export const sendStatusUpdate = (order: {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: number;
}) => {
  const statusMessages: Record<string, string> = {
    confirmed: '✅ Your order has been *confirmed* and is being prepared!',
    packed: '📦 Your order has been *packed* and is ready for delivery!',
    shipped: '🚚 Your order is *on the way*! It will reach you soon.',
    delivered: '🎉 Your order has been *delivered*! Enjoy your fresh seafood!',
    cancelled: '❌ Your order has been *cancelled*. Contact us for questions.',
  };

  const msg = `${statusMessages[order.status] || `Order status: ${order.status}`}\n\n📦 Order #${order.id.slice(0, 8)}\n👤 ${order.customerName}\n💰 Total: ₹${order.total}\n\n— *Meenava Sonthangal* 🐟`;

  const phone = order.customerPhone.replace(/[\s+\-()]/g, '');
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
  window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

export const sendAdminNewOrderAlert = (order: {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; weight?: string; quantity: number; price: number }[];
  total: number;
  address: string;
}) => {
  const itemsList = order.items
    .map((i) => `• ${i.name}${i.weight ? ` (${i.weight})` : ''} ×${i.quantity} — ₹${i.price * i.quantity}`)
    .join('\n');

  const msg = `🔔 *New Order Received!*\n\n📦 Order #${order.id.slice(0, 8)}\n👤 ${order.customerName}\n📞 ${order.customerPhone}\n\n${itemsList}\n\n*Total: ₹${order.total}*\n📍 ${order.address}`;

  const adminPhone = getWhatsAppNumber();
  window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

export const getWhatsAppOrderLink = () => {
  const msg = `Hi! I'd like to place an order from Meenava Sonthangal 🐟\n\nPlease help me with the available products.`;
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(msg)}`;
};
