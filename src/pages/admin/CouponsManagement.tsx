import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Plus, Pencil, Trash2, X, Copy } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: '', description: '', discount_type: 'percentage', discount_value: 0,
  min_order_amount: 0, max_discount: '', usage_limit: '', is_active: true, expires_at: '',
};

const CouponsManagement = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setCoupons((data as any[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.code || form.discount_value <= 0) {
      toast({ title: 'Error', description: 'Code and discount value are required.', variant: 'destructive' });
      return;
    }
    const payload: any = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('coupons').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('coupons').insert(payload));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingId ? 'Updated' : 'Created', description: `Coupon ${payload.code} saved.` });
      resetForm();
      fetchCoupons();
    }
  };

  const handleEdit = (c: Coupon) => {
    setForm({
      code: c.code, description: c.description || '', discount_type: c.discount_type,
      discount_value: c.discount_value, min_order_amount: c.min_order_amount,
      max_discount: c.max_discount?.toString() || '', usage_limit: c.usage_limit?.toString() || '',
      is_active: c.is_active, expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); fetchCoupons(); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('coupons').update({ is_active: active }).eq('id', id);
    fetchCoupons();
  };

  const resetForm = () => { setForm(emptyCoupon); setEditingId(null); setShowForm(false); };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied', description: `${code} copied to clipboard.` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">Coupon Management</h2>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Coupon
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{editingId ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coupon Code *</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE20" className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="20% off on all orders" />
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    placeholder={form.discount_type === 'percentage' ? '20' : '100'} />
                </div>
                <div className="space-y-2">
                  <Label>Min Order Amount (₹)</Label>
                  <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Max Discount (₹)</Label>
                  <Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="No limit" />
                </div>
                <div className="space-y-2">
                  <Label>Usage Limit</Label>
                  <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" />
                </div>
                <div className="space-y-2">
                  <Label>Expires On</Label>
                  <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>{editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coupons List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No coupons created yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Discount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Min Order</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usage</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expires</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {
                      const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                      return (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary">{c.code}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(c.code)}><Copy className="h-3 w-3" /></Button>
                            </div>
                            {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                            {c.max_discount && <span className="text-xs text-muted-foreground block">Max: ₹{c.max_discount}</span>}
                          </td>
                          <td className="py-3 px-4">₹{c.min_order_amount}</td>
                          <td className="py-3 px-4">
                            {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ' / ∞'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Switch checked={c.is_active} onCheckedChange={(v) => toggleActive(c.id, v)} />
                              {isExpired ? <Badge variant="destructive" className="text-xs">Expired</Badge>
                                : c.is_active ? <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                : <Badge variant="outline" className="text-xs">Inactive</Badge>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default CouponsManagement;
