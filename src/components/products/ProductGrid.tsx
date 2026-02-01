import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onViewDetails?: (product: Product) => void;
}

export const ProductGrid = ({ products, onViewDetails }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🐟</div>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for fresh stock.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProductCard product={product} onViewDetails={onViewDetails} />
        </div>
      ))}
    </div>
  );
};
