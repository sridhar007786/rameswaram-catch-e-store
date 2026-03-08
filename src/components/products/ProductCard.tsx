import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const selectedPrice = product.prices[selectedPriceIndex];
  const displayName = language === 'ta' && product.nameTamil ? product.nameTamil : product.name;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, selectedPrice.weight, selectedPrice.price);
    toast({
      title: t('products.added_to_cart'),
      description: `${product.name} (${selectedPrice.weight}) ${t('products.added_desc')}`,
    });
  };

  const discount = selectedPrice.originalPrice
    ? Math.round(((selectedPrice.originalPrice - selectedPrice.price) / selectedPrice.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card group cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFresh && <Badge variant="fresh" className="shadow-md">{t('products.fresh_today')}</Badge>}
          {discount > 0 && <Badge variant="offer" className="shadow-md">{discount}% OFF</Badge>}
          {product.category === 'premium-fish' && <Badge variant="premium" className="shadow-md">⭐ Premium</Badge>}
          {product.category === 'special-offers' && <Badge variant="offer" className="shadow-md">🔥 Special Offer</Badge>}
          {product.category === 'ready-to-cook' && <Badge variant="category" className="shadow-md">🍳 Ready to Cook</Badge>}
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="cta" size="icon" onClick={handleAddToCart} className="rounded-full shadow-lg">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="outOfStock" className="text-sm">{t('products.out_of_stock')}</Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-foreground text-lg leading-tight">{displayName}</h3>
            {language !== 'ta' && product.nameTamil && (
              <p className="text-muted-foreground text-sm tamil-text">{product.nameTamil}</p>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-amber-700">{product.rating}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {product.prices.map((price, index) => (
            <button
              key={price.weight}
              onClick={(e) => { e.stopPropagation(); setSelectedPriceIndex(index); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                index === selectedPriceIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {price.weight}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">₹{selectedPrice.price}</span>
            {selectedPrice.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{selectedPrice.originalPrice}</span>
            )}
          </div>
          <Button variant="default" size="sm" onClick={handleAddToCart} disabled={!product.inStock} className="gap-1">
            <Plus className="h-4 w-4" />
            {t('products.add')}
          </Button>
        </div>
      </div>
    </div>
  );
};
