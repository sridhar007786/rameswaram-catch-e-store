import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, Clock, Plus, Minus, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductGrid } from '@/components/products/ProductGrid';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();

  const product = products.find((p) => p.id === id);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🐟</div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
            <Link to="/products">
              <Button variant="cta">Browse Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const selectedPrice = product.prices[selectedPriceIndex];
  const discount = selectedPrice.originalPrice
    ? Math.round(((selectedPrice.originalPrice - selectedPrice.price) / selectedPrice.originalPrice) * 100)
    : 0;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedPrice.weight, selectedPrice.price);
    }
    toast({
      title: 'Added to cart!',
      description: `${quantity}x ${product.name} (${selectedPrice.weight}) added.`,
    });
  };

  // Mock reviews
  const reviews = [
    { name: 'Priya S.', rating: 5, text: 'Absolutely fresh! The quality is amazing, will order again.', date: '2 days ago' },
    { name: 'Kumar R.', rating: 5, text: 'Best seafood I\'ve had delivered. Perfectly packed and fresh.', date: '1 week ago' },
    { name: 'Lakshmi V.', rating: 4, text: 'Great taste and quality. Delivery was on time. Highly recommended!', date: '2 weeks ago' },
  ];

  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Products
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFresh && (
                    <Badge variant="fresh" className="shadow-md text-sm">🌊 Fresh Today</Badge>
                  )}
                  {discount > 0 && (
                    <Badge variant="offer" className="shadow-md text-sm">{discount}% OFF</Badge>
                  )}
                </div>
              </div>
              {/* Thumbnail strip (same image repeated as placeholder) */}
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {product.name}
                </h1>
                {product.nameTamil && (
                  <p className="text-muted-foreground text-lg tamil-text">{product.nameTamil}</p>
                )}
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>

              {/* Weight selector */}
              <div>
                <p className="font-semibold text-foreground mb-3">Select Weight:</p>
                <div className="flex gap-3">
                  {product.prices.map((price, index) => (
                    <button
                      key={price.weight}
                      onClick={() => setSelectedPriceIndex(index)}
                      className={`px-5 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                        index === selectedPriceIndex
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {price.weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">₹{selectedPrice.price}</span>
                {selectedPrice.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">₹{selectedPrice.originalPrice}</span>
                )}
                {discount > 0 && (
                  <Badge variant="offer" className="text-sm">Save {discount}%</Badge>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button variant="cta" size="xl" className="flex-1 gap-2" onClick={handleAddToCart} disabled={!product.inStock}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart — ₹{selectedPrice.price * quantity}
                </Button>

                <Button variant="outline" size="icon" className="shrink-0 h-14 w-14">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { icon: Truck, text: 'Free Delivery above ₹500' },
                  { icon: Shield, text: 'Freshness Guaranteed' },
                  { icon: Clock, text: 'Same Day Delivery' },
                ].map((badge, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <badge.icon className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="mb-20">
            <h2 className="section-title text-foreground mb-8 text-2xl">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-ocean">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">"{review.text}"</p>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground text-sm">{review.name}</p>
                    <p className="text-muted-foreground text-xs">{review.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="section-title text-foreground mb-8 text-2xl">You May Also Like</h2>
              <ProductGrid products={relatedProducts} />
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
