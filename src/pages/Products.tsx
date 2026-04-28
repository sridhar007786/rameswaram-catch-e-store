import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { Product } from '@/types/product';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts } from '@/hooks/useProducts';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { t } = useLanguage();
  const { data: products = [], isLoading } = useProducts();

  useEffect(() => {
    let result = selectedCategory ? products.filter((p) => p.category === selectedCategory) : products;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.nameTamil?.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) { setSearchParams({ category: categoryId }); } else { setSearchParams({}); }
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="section-title text-foreground mb-4">{t('products.page_title')}</h1>
            <p className="section-subtitle">{t('products.page_subtitle')}</p>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('products.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">
              {t('products.showing')} {filteredProducts.length} {filteredProducts.length === 1 ? t('products.product') : t('products.products_plural')}
              {selectedCategory && ` ${t('products.in_selected')}`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
