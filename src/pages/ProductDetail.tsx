import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, Clock, Plus, Minus, Heart, Share2, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Loader2 } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  is_featured: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const { data: products = [], isLoading } = useProducts();
  const product = products.find((p) => p.id === id);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('product_reviews')
      .select('id, customer_name, rating, review_text, created_at, is_featured')
      .eq('product_id', id!)
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🐟</div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">{t('products.not_found')}</h1>
            <Link to="/products"><Button variant="cta">{t('products.browse')}</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = language === 'ta' && product.nameTamil ? product.nameTamil : product.name;
  const selectedPrice = product.prices[selectedPriceIndex];
  const discount = selectedPrice.originalPrice ? Math.round(((selectedPrice.originalPrice - selectedPrice.price) / selectedPrice.originalPrice) * 100) : 0;
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast({ title: t('products.out_of_stock'), description: t('products.out_of_stock'), variant: 'destructive' });
      return;
    }
    for (let i = 0; i < quantity; i++) addItem(product, selectedPrice.weight, selectedPrice.price);
    toast({ title: t('products.added_to_cart'), description: `${quantity}x ${product.name} (${selectedPrice.weight})` });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${product.name} - ₹${selectedPrice.price} at Meenava Sonthangal!`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: t('detail.link_copied'), description: t('detail.link_copied_desc') });
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({ title: t('detail.please_login'), description: t('detail.login_to_review'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: product.id, user_id: user.id,
      customer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      rating: newRating, review_text: newReviewText || null,
    });
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('detail.review_submitted'), description: t('detail.review_after_approval') });
      setNewReviewText('');
      setNewRating(5);
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating?.toString() || '0';

  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />{t('nav.products')}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{displayName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFresh && <Badge variant="fresh" className="shadow-md text-sm">{t('products.fresh_today')}</Badge>}
                  {discount > 0 && <Badge variant="offer" className="shadow-md text-sm">{discount}% OFF</Badge>}
                </div>
              </div>
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}>
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">{displayName}</h1>
                  {language !== 'ta' && product.nameTamil && <p className="text-muted-foreground text-lg tamil-text">{product.nameTamil}</p>}
                </div>
                <Button variant="outline" size="icon" onClick={handleShare} className="shrink-0"><Share2 className="h-5 w-5" /></Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{avgRating}</span>
                <span className="text-muted-foreground">({reviews.length || product.reviews || 0} {t('products.reviews')})</span>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>

              <div>
                <p className="font-semibold text-foreground mb-3">{t('products.select_weight')}</p>
                <div className="flex gap-3 flex-wrap">
                  {product.prices.map((price, index) => (
                    <button key={price.weight} onClick={() => setSelectedPriceIndex(index)}
                      className={`px-5 py-3 rounded-xl text-sm font-medium transition-all border-2 ${index === selectedPriceIndex ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary/50'}`}>
                      {price.weight}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-bold text-foreground">₹{selectedPrice.price}</span>
                {selectedPrice.originalPrice && <span className="text-xl text-muted-foreground line-through">₹{selectedPrice.originalPrice}</span>}
                {discount > 0 && <Badge variant="offer" className="text-sm">{t('detail.save_off')} {discount}%</Badge>}
                {product.inStock ? (
                  <Badge variant="fresh" className="text-sm">✓ {t('products.in_stock') || 'In Stock'}</Badge>
                ) : (
                  <Badge variant="outOfStock" className="text-sm">{t('products.out_of_stock')}</Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!product.inStock} className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} disabled={!product.inStock} className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50"><Plus className="h-4 w-4" /></button>
                </div>
                <Button variant="cta" size="xl" className="flex-1 gap-2" onClick={handleAddToCart} disabled={!product.inStock}>
                  <ShoppingCart className="h-5 w-5" />
                  {product.inStock ? `${t('detail.add_to_cart')} — ₹${selectedPrice.price * quantity}` : t('products.out_of_stock')}
                </Button>
                <Button variant="outline" size="icon" className="shrink-0 h-14 w-14"><Heart className="h-5 w-5" /></Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { icon: Truck, text: t('common.free_delivery') },
                  { icon: Shield, text: t('common.freshness') },
                  { icon: Clock, text: t('common.same_day') },
                ].map((badge, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><badge.icon className="h-5 w-5 text-accent" /></div>
                    <p className="text-xs text-muted-foreground">{badge.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="mb-20">
            <h2 className="section-title text-foreground mb-8 text-2xl">{t('detail.customer_reviews')}</h2>
            <div className="bg-card rounded-2xl p-6 shadow-ocean mb-8">
              <h3 className="font-semibold text-foreground mb-4">{t('detail.write_review')}</h3>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setNewRating(s)}>
                    <Star className={`h-6 w-6 transition-colors ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder={t('detail.review_placeholder')} value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} className="mb-4" rows={3} />
              <Button onClick={handleSubmitReview} disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />{submitting ? t('detail.submitting') : t('detail.submit_review')}
              </Button>
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-2xl p-6 shadow-ocean">
                    {review.is_featured && <Badge className="mb-2 bg-amber-100 text-amber-800">{t('detail.featured')}</Badge>}
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    {review.review_text && <p className="text-foreground mb-4 leading-relaxed">"{review.review_text}"</p>}
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-foreground text-sm">{review.customer_name}</p>
                      <p className="text-muted-foreground text-xs">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Priya S.', rating: 5, text: 'Absolutely fresh! The quality is amazing, will order again.' },
                  { name: 'Kumar R.', rating: 5, text: "Best seafood I've had delivered. Perfectly packed and fresh." },
                  { name: 'Lakshmi V.', rating: 4, text: 'Great taste and quality. Delivery was on time. Highly recommended!' },
                ].map((r, i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 shadow-ocean">
                    <div className="flex gap-1 mb-3">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-foreground mb-4 leading-relaxed">"{r.text}"</p>
                    <p className="font-semibold text-foreground text-sm">{r.name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {relatedProducts.length > 0 && (
            <section>
              <h2 className="section-title text-foreground mb-8 text-2xl">{t('detail.you_may_like')}</h2>
              <ProductGrid products={relatedProducts} />
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
