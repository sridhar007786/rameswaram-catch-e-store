import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, MessageCircle, CheckCircle, MapPin } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'cod' | 'upi' | 'whatsapp';

const CheckoutPage = () => {
  const { state, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const deliveryCharge = state.total >= 500 ? 0 : 50;
  const grandTotal = state.total + deliveryCharge;

  if (state.items.length === 0 && !orderPlaced) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Add some products before checkout.</p>
            <Link to="/products"><Button variant="cta">Browse Products</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (orderPlaced) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Order Placed!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your order.</p>
            <p className="text-sm text-muted-foreground mb-6">
              Order ID: <span className="font-mono font-medium text-foreground">{orderId.slice(0, 8)}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              {paymentMethod === 'cod'
                ? 'Pay when your order arrives. We\'ll call you to confirm.'
                : paymentMethod === 'upi'
                ? 'Please complete payment via UPI. We\'ll send details on WhatsApp.'
                : 'We\'ll confirm your order via WhatsApp shortly.'}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/products"><Button variant="cta" className="w-full">Continue Shopping</Button></Link>
              <Link to="/"><Button variant="outline" className="w-full">Back to Home</Button></Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'whatsapp') {
      const msg = `🛒 New Order from ${form.name}\n\n${state.items
        .map((i) => `• ${i.product.name} (${i.selectedWeight}) x${i.quantity} — ₹${i.price * i.quantity}`)
        .join('\n')}\n\nSubtotal: ₹${state.total}\nDelivery: ₹${deliveryCharge}\nTotal: ₹${grandTotal}\n\n📍 Address: ${form.address}, ${form.city} - ${form.pincode}\n📞 Phone: ${form.phone}${form.notes ? `\n📝 Notes: ${form.notes}` : ''}`;
      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank');
      clearCart();
      setOrderId('whatsapp-order');
      setOrderPlaced(true);
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = state.items.map((i) => ({
        name: i.product.name,
        weight: i.selectedWeight,
        quantity: i.quantity,
        price: i.price,
        productId: i.product.id,
      }));

      const { data, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        delivery_address: `${form.address}, ${form.city} - ${form.pincode}`,
        status: 'pending',
        items: orderItems as any,
        subtotal: state.total,
        delivery_charge: deliveryCharge,
        total: grandTotal,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        notes: form.notes || null,
      } as any).select().single();

      if (error) throw error;

      clearCart();
      setOrderId(data.id);
      setOrderPlaced(true);
      toast({ title: 'Order placed successfully!' });
    } catch (err: any) {
      console.error('Order error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to place order.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = [
    { id: 'cod' as const, icon: Banknote, label: 'Cash on Delivery', desc: 'Pay when order arrives' },
    { id: 'upi' as const, icon: CreditCard, label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm' },
    { id: 'whatsapp' as const, icon: MessageCircle, label: 'WhatsApp Order', desc: 'Confirm via WhatsApp' },
  ];

  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </div>

          <h1 className="section-title text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery info */}
                <div className="bg-card rounded-2xl p-6 shadow-ocean space-y-4">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Delivery Address *</Label>
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                        rows={3}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="House/Flat No, Street, Landmark..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kanyakumari" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode *</Label>
                      <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="629702" required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Order Notes (optional)</Label>
                      <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Clean and cut the fish" />
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-card rounded-2xl p-6 shadow-ocean space-y-4">
                  <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                          paymentMethod === option.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <option.icon className={`h-6 w-6 ${paymentMethod === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium text-sm text-foreground">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 shadow-ocean sticky top-24">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {state.items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedWeight}`} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.product.name} ({item.selectedWeight}) x{item.quantity}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{state.total}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Delivery</span>
                      <span className={deliveryCharge === 0 ? 'text-accent font-medium' : ''}>
                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 mb-6">
                    <div className="flex justify-between text-foreground font-bold text-xl">
                      <span>Total</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  <Button type="submit" variant="cta" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      `Place Order — ₹${grandTotal}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    🛡️ Your information is secure. We'll confirm via call/WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
