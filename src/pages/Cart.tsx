import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

const CartPage = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { t } = useLanguage();

  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">{t('cart.empty')}</h1>
              <p className="text-muted-foreground mb-8">{t('cart.empty_desc')}</p>
              <Link to="/products">
                <Button variant="cta" size="lg" className="gap-2">
                  {t('cart.browse')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <h1 className="section-title text-foreground mb-8">{t('cart.your_cart')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <div key={`${item.product.id}-${item.selectedWeight}`} className="bg-card rounded-xl p-4 shadow-ocean flex gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{item.product.name}</h3>
                        <p className="text-muted-foreground text-sm">{item.selectedWeight}</p>
                      </div>
                      <button onClick={() => removeItem(item.product.id, item.selectedWeight)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-muted-foreground hover:text-destructive text-sm transition-colors">{t('cart.clear')}</button>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-ocean sticky top-24">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">{t('cart.order_summary')}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('cart.subtotal')} ({state.itemCount} {t('cart.items')})</span>
                    <span>₹{state.total}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('cart.delivery')}</span>
                    <span className={state.total >= 500 ? 'text-accent' : ''}>{state.total >= 500 ? t('cart.free') : '₹50'}</span>
                  </div>
                  {state.total < 500 && (
                    <p className="text-xs text-muted-foreground">{t('cart.add_more_free', { amount: 500 - state.total })}</p>
                  )}
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-foreground font-bold text-lg">
                    <span>{t('cart.total')}</span>
                    <span>₹{state.total + (state.total >= 500 ? 0 : 50)}</span>
                  </div>
                </div>
                <Link to="/checkout">
                  <Button variant="cta" size="lg" className="w-full mb-3">{t('cart.checkout')}</Button>
                </Link>
                <a href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi! I'd like to order:\n${state.items.map((i) => `- ${i.product.name} (${i.selectedWeight}) x${i.quantity}`).join('\n')}\n\nTotal: ₹${state.total}`)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="whatsapp" className="w-full">{t('cart.order_whatsapp')}</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
