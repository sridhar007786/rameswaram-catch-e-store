import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { products as staticProducts } from '@/data/products';

// Build a name-based lookup of static product images so we can fall back when
// the database row doesn't have an image URL set.
const staticByName = new Map(staticProducts.map((p) => [p.name.toLowerCase().trim(), p]));

const FALLBACK_IMAGE = '/placeholder.svg';

export function mapDbRowToProduct(row: any): Product {
  const fallback = staticByName.get((row.name || '').toLowerCase().trim());
  const image =
    row.image_url ||
    (Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null) ||
    fallback?.image ||
    FALLBACK_IMAGE;

  const prices = Array.isArray(row.prices) && row.prices.length > 0
    ? row.prices
    : fallback?.prices || [{ weight: '1 kg', price: 0 }];

  const stockQty = typeof row.stock_quantity === 'number' ? row.stock_quantity : null;
  const inStock = row.in_stock === true && (stockQty === null || stockQty > 0);

  return {
    id: String(row.id),
    name: row.name,
    nameTamil: row.name_tamil ?? fallback?.nameTamil,
    description: row.description ?? fallback?.description ?? '',
    category: (row.category as Product['category']) ?? fallback?.category ?? 'fresh-fish',
    image,
    prices,
    inStock,
    isFresh: row.is_fresh ?? fallback?.isFresh ?? false,
    isPopular: row.is_popular ?? fallback?.isPopular ?? false,
    rating: row.rating ?? fallback?.rating,
    reviews: row.reviews_count ?? fallback?.reviews,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbRowToProduct);
}

export function useProducts() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  // Realtime: invalidate cache on any change to products table
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useProduct(id: string | undefined) {
  const { data: products, isLoading, error } = useProducts();
  const product = id ? products?.find((p) => p.id === id) : undefined;
  return { product, isLoading, error, products: products || [] };
}
