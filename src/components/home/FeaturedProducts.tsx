import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getPopularProducts } from '@/data/products';
import { useLanguage } from '@/context/LanguageContext';

export const FeaturedProducts = () => {
  const popularProducts = getPopularProducts();
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="section-title text-foreground mb-2">{t('featured.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('featured.subtitle')}</p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="group">
              {t('featured.view_all')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <ProductGrid products={popularProducts} />
      </div>
    </section>
  );
};
