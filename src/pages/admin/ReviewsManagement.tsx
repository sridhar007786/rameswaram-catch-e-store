import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Check, X, Award, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

const ReviewsManagement = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    const { error } = await supabase.from('product_reviews').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated' });
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('product_reviews').delete().eq('id', id);
    fetchReviews();
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Reviews Management</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved'] as const).map(f => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">
                {f} {f === 'pending' && pendingCount > 0 && <Badge className="ml-1 bg-destructive text-destructive-foreground">{pendingCount}</Badge>}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-foreground">{review.customer_name}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {!review.is_approved && <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>}
                        {review.is_featured && <Badge className="bg-amber-100 text-amber-800">⭐ Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Product: {review.product_id}</p>
                      {review.review_text && <p className="text-foreground">"{review.review_text}"</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!review.is_approved && (
                        <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => updateReview(review.id, { is_approved: true })}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => updateReview(review.id, { is_featured: !review.is_featured })}>
                        <Award className="h-4 w-4" /> {review.is_featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteReview(review.id)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsManagement;
