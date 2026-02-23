import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Save, Package, Upload, Image as ImageIcon } from 'lucide-react';

interface PriceOption {
  weight: string;
  price: number;
  originalPrice?: number;
}

interface ProductForm {
  name: string;
  name_tamil: string;
  description: string;
  category: string;
  image_url: string;
  images: string[];
  prices: PriceOption[];
  in_stock: boolean;
  is_fresh: boolean;
  is_popular: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  name_tamil: '',
  description: '',
  category: 'fresh-fish',
  image_url: '',
  images: [],
  prices: [{ weight: '250g', price: 0 }],
  in_stock: true,
  is_fresh: false,
  is_popular: false,
};

const ProductsManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const openCreateForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };

  const openEditForm = (product: any) => {
    setForm({
      name: product.name,
      name_tamil: product.name_tamil || '',
      description: product.description || '',
      category: product.category,
      image_url: product.image_url || '',
      images: product.images || [],
      prices: (product.prices as PriceOption[]) || [{ weight: '250g', price: 0 }],
      in_stock: product.in_stock,
      is_fresh: product.is_fresh || false,
      is_popular: product.is_popular || false,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        continue;
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    const allImages = [...form.images, ...newUrls];
    setForm({
      ...form,
      images: allImages,
      image_url: form.image_url || allImages[0] || '',
    });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm({
      ...form,
      images: updated,
      image_url: updated[0] || form.image_url,
    });
  };

  const setAsPrimary = (url: string) => {
    setForm({ ...form, image_url: url });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Product name is required.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      name_tamil: form.name_tamil || null,
      description: form.description || null,
      category: form.category,
      image_url: form.image_url || form.images[0] || null,
      images: form.images,
      prices: form.prices as any,
      in_stock: form.in_stock,
      is_fresh: form.is_fresh,
      is_popular: form.is_popular,
    };

    const { error } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: editingId ? 'Product updated!' : 'Product created!' });
      setShowForm(false);
      fetchProducts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { toast({ title: 'Deleted' }); fetchProducts(); }
    else toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const addPriceOption = () => setForm({ ...form, prices: [...form.prices, { weight: '', price: 0 }] });
  const updatePrice = (index: number, field: keyof PriceOption, value: string | number) => {
    const updated = [...form.prices];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, prices: updated });
  };
  const removePrice = (index: number) => {
    if (form.prices.length <= 1) return;
    setForm({ ...form, prices: form.prices.filter((_, i) => i !== index) });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">Product Management</h2>
          <Button onClick={openCreateForm} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
        </div>

        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Red Snapper" />
                </div>
                <div className="space-y-2">
                  <Label>Tamil Name</Label>
                  <Input value={form.name_tamil} onChange={e => setForm({ ...form, name_tamil: e.target.value })} placeholder="e.g. சங்கரா மீன்" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="fresh-fish">Fresh Fish</option>
                  <option value="dry-fish">Dry Fish</option>
                  <option value="seafood-specials">Seafood Specials</option>
                </select>
              </div>

              {/* Multi-image upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Product Images</Label>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                    <Upload className="h-3 w-3" /> {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUploadImages} />
                </div>

                {form.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className={`w-full aspect-square object-cover rounded-lg border-2 ${url === form.image_url ? 'border-primary' : 'border-border'}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          <button onClick={() => setAsPrimary(url)} className="p-1 bg-white/90 rounded text-xs font-medium text-foreground hover:bg-white" title="Set as primary">★</button>
                          <button onClick={() => removeImage(i)} className="p-1 bg-destructive/90 rounded text-white hover:bg-destructive"><X className="h-3 w-3" /></button>
                        </div>
                        {url === form.image_url && (
                          <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click or drag to upload product images</p>
                  </div>
                )}

                {/* Optional URL input */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Or add image URL manually</Label>
                  <div className="flex gap-2">
                    <Input placeholder="https://..." id="manual-url" className="text-sm" />
                    <Button variant="outline" size="sm" onClick={() => {
                      const input = document.getElementById('manual-url') as HTMLInputElement;
                      if (input.value.trim()) {
                        const allImages = [...form.images, input.value.trim()];
                        setForm({ ...form, images: allImages, image_url: form.image_url || allImages[0] });
                        input.value = '';
                      }
                    }}>Add</Button>
                  </div>
                </div>
              </div>

              {/* Price options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Price Options</Label>
                  <Button variant="outline" size="sm" onClick={addPriceOption}><Plus className="h-3 w-3 mr-1" /> Add Weight</Button>
                </div>
                {form.prices.map((price, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Weight</Label>
                      <Input value={price.weight} onChange={e => updatePrice(index, 'weight', e.target.value)} placeholder="250g" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input type="number" value={price.price} onChange={e => updatePrice(index, 'price', Number(e.target.value))} />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Original Price (₹)</Label>
                      <Input type="number" value={price.originalPrice || ''} onChange={e => updatePrice(index, 'originalPrice', Number(e.target.value) || 0)} />
                    </div>
                    {form.prices.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removePrice(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'in_stock' as const, label: 'In Stock' },
                  { key: 'is_fresh' as const, label: 'Fresh Today' },
                  { key: 'is_popular' as const, label: 'Popular' },
                ].map(t => (
                  <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[t.key]} onChange={e => setForm({ ...form, [t.key]: e.target.checked })} className="rounded" />
                    <span className="text-sm">{t.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Images</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price Range</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => {
                      const prices = (product.prices as PriceOption[]) || [];
                      const minPrice = prices.length > 0 ? Math.min(...prices.map(p => p.price)) : 0;
                      const maxPrice = prices.length > 0 ? Math.max(...prices.map(p => p.price)) : 0;
                      const imgCount = (product.images as string[] || []).length;

                      return (
                        <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">🐟</div>
                              )}
                              <div>
                                <p className="font-medium text-foreground">{product.name}</p>
                                {product.name_tamil && <p className="text-xs text-muted-foreground">{product.name_tamil}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize">{product.category.replace('-', ' ')}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{imgCount} {imgCount === 1 ? 'image' : 'images'}</Badge>
                          </td>
                          <td className="py-3 px-4 font-medium">₹{minPrice} - ₹{maxPrice}</td>
                          <td className="py-3 px-4">
                            <Badge variant={product.in_stock ? 'default' : 'destructive'}>{product.in_stock ? 'In Stock' : 'Out of Stock'}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="ghost" size="icon" onClick={() => openEditForm(product)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;
