import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const CartPage = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any fresh catch yet. 
                Start shopping to fill your cart with delicious seafood!
              </p>
              <Link to="/products">
                <Button variant="cta" size="lg" className="gap-2">
                  Browse Products
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
          <h1 className="section-title text-foreground mb-8">Your Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedWeight}`}
                  className="bg-card rounded-xl p-4 shadow-ocean flex gap-4"
                >
                  {/* Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">
                          {item.product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {item.selectedWeight}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedWeight)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-lg">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="text-muted-foreground hover:text-destructive text-sm transition-colors"
              >
                Clear entire cart
              </button>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 shadow-ocean sticky top-24">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({state.itemCount} items)</span>
                    <span>₹{state.total}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className={state.total >= 500 ? 'text-accent' : ''}>
                      {state.total >= 500 ? 'FREE' : '₹50'}
                    </span>
                  </div>
                  {state.total < 500 && (
                    <p className="text-xs text-muted-foreground">
                      Add ₹{500 - state.total} more for free delivery!
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-foreground font-bold text-lg">
                    <span>Total</span>
                    <span>₹{state.total + (state.total >= 500 ? 0 : 50)}</span>
                  </div>
                </div>

                <Button variant="cta" size="lg" className="w-full mb-3">
                  Proceed to Checkout
                </Button>

                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi! I'd like to order:\n${state.items
                      .map((i) => `- ${i.product.name} (${i.selectedWeight}) x${i.quantity}`)
                      .join('\n')}\n\nTotal: ₹${state.total}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="whatsapp" className="w-full">
                    Order via WhatsApp
                  </Button>
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
