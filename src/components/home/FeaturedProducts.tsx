import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getPopularProducts } from '@/data/products';

export const FeaturedProducts = () => {
  const popularProducts = getPopularProducts();

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="section-title text-foreground mb-2">
              Today's Fresh Catch
            </h2>
            <p className="text-muted-foreground text-lg">
              Our most popular picks, handpicked for freshness and quality.
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="group">
              View All Products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products grid */}
        <ProductGrid products={popularProducts} />
      </div>
    </section>
  );
};
