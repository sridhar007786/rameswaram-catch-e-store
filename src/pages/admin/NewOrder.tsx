import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Minus, Trash2, Search, ShoppingBag, User, Save, Loader2, Printer, Store,
} from 'lucide-react';

type LineItem = {
  product_id: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
};

type DBProduct = {
  id: string;
  name: string;
  name_tamil: string | null;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  stock_quantity: number | null;
  prices: any;
};

const SOURCES = [
  { value: 'offline', label: '🏪 Walk-in / Offline' },
  { value: 'social', label: '📱 Social Media' },
  { value: 'phone', label: '📞 Phone Order' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'online', label: '🌐 Online' },
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'COD'];
const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const NewOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);

  const [customer, setCustomer] = useState({
    name: '', email: '', phone: '', address: '',
  });

  const [source, setSource] = useState('offline');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [status, setStatus] = useState('confirmed');
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Customer lookup
  const [lookup, setLookup] = useState('');
  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const [lookupOpen, setLookupOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_tamil, category, image_url, in_stock, stock_quantity, prices')
        .order('name');
      if (error) {
        toast({ title: 'Failed to load products', description: error.message, variant: 'destructive' });
      } else {
        setProducts((data as DBProduct[]) || []);
      }
      setLoadingProducts(false);
    })();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.name_tamil?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const getDefaultPrice = (p: DBProduct): { weight: string; price: number } => {
    const arr = Array.isArray(p.prices) ? p.prices : [];
    if (arr.length > 0) {
      return { weight: String(arr[0].weight ?? '1 unit'), price: Number(arr[0].price ?? 0) };
    }
    return { weight: '1 unit', price: 0 };
  };

  const addItem = (p: DBProduct, weightOverride?: string) => {
    if (!p.in_stock || (p.stock_quantity ?? 0) <= 0) {
      toast({ title: 'Out of stock', description: `${p.name} is unavailable.`, variant: 'destructive' });
      return;
    }
    const arr = Array.isArray(p.prices) ? p.prices : [];
    const variant = weightOverride
      ? arr.find((v: any) => String(v.weight) === weightOverride)
      : arr[0];
    const weight = String(variant?.weight ?? '1 unit');
    const price = Number(variant?.price ?? 0);

    setItems((prev) => {
      const key = `${p.id}__${weight}`;
      const existing = prev.find((i) => `${i.product_id}__${i.weight}` === key);
      if (existing) {
        if (existing.quantity + 1 > (p.stock_quantity ?? 0)) {
          toast({ title: 'Stock limit reached', description: `Only ${p.stock_quantity} available.`, variant: 'destructive' });
          return prev;
        }
        return prev.map((i) =>
          `${i.product_id}__${i.weight}` === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product_id: p.id,
          name: p.name,
          weight,
          price,
          quantity: 1,
          image: p.image_url || '',
        },
      ];
    });
  };

  const updateQty = (key: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        const itemKey = `${i.product_id}__${i.weight}`;
        if (itemKey !== key) return i;
        const product = products.find((p) => p.id === i.product_id);
        const next = Math.max(1, i.quantity + delta);
        if (delta > 0 && product && next > (product.stock_quantity ?? 0)) {
          toast({ title: 'Stock limit', description: `Only ${product.stock_quantity} available.`, variant: 'destructive' });
          return i;
        }
        return { ...i, quantity: next };
      })
    );
  };

  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((i) => `${i.product_id}__${i.weight}` !== key));

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = Math.round((subtotal * discountPct) / 100);
    const afterDiscount = subtotal - discount;
    const tax = Math.round((afterDiscount * taxPct) / 100);
    const total = afterDiscount + tax + shipping;
    return { subtotal, discount, tax, total };
  }, [items, discountPct, taxPct, shipping]);

  // Customer lookup from past orders
  const runLookup = async (q: string) => {
    setLookup(q);
    if (q.trim().length < 2) {
      setLookupResults([]);
      setLookupOpen(false);
      return;
    }
    const safe = q.replace(/[%,]/g, '');
    const { data } = await supabase
      .from('orders')
      .select('customer_name, customer_email, customer_phone, delivery_address, created_at')
      .or(`customer_phone.ilike.%${safe}%,customer_email.ilike.%${safe}%,customer_name.ilike.%${safe}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    const seen = new Set<string>();
    const unique = (data || []).filter((o: any) => {
      const key = `${o.customer_phone || ''}|${o.customer_email || ''}|${o.customer_name || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setLookupResults(unique.slice(0, 6));
    setLookupOpen(true);
  };

  const pickCustomer = (c: any) => {
    setCustomer({
      name: c.customer_name || '',
      email: (c.customer_email || '').includes('@offline.local') ? '' : (c.customer_email || ''),
      phone: c.customer_phone || '',
      address: c.delivery_address === 'In-store pickup' ? '' : (c.delivery_address || ''),
    });
    setLookup('');
    setLookupResults([]);
    setLookupOpen(false);
    toast({ title: 'Customer loaded', description: c.customer_name });
  };

  const handlePrint = (order: any) => {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) return;
    const itemRows = (order.items as LineItem[])
      .map(
        (i) => `<tr>
          <td style="padding:6px 4px;">${i.name}<br/><small style="color:#666">${i.weight}</small></td>
          <td style="padding:6px 4px;text-align:center;">${i.quantity}</td>
          <td style="padding:6px 4px;text-align:right;">₹${i.price}</td>
          <td style="padding:6px 4px;text-align:right;">₹${i.price * i.quantity}</td>
        </tr>`
      )
      .join('');
    w.document.write(`<!doctype html><html><head><title>Invoice ${order.id.slice(0, 8)}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{margin:0 0 4px}small{color:#666}table{width:100%;border-collapse:collapse;margin-top:12px}th{text-align:left;border-bottom:2px solid #111;padding:6px 4px;font-size:13px}.totals td{padding:4px}.totals .label{text-align:right;color:#555}</style>
      </head><body>
      <h1>Meenava Sonthangal</h1>
      <small>Invoice • ${new Date(order.created_at).toLocaleString('en-IN')}</small>
      <hr/>
      <p><strong>Order #:</strong> ${order.id.slice(0, 8).toUpperCase()}<br/>
      <strong>Customer:</strong> ${order.customer_name}<br/>
      <strong>Phone:</strong> ${order.customer_phone}<br/>
      <strong>Address:</strong> ${order.delivery_address}<br/>
      <strong>Source:</strong> ${order.order_source} • <strong>Payment:</strong> ${order.payment_method}</p>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${itemRows}</tbody></table>
      <table class="totals" style="margin-top:16px;width:100%">
        <tr><td class="label">Subtotal</td><td style="text-align:right;width:120px">₹${order.subtotal}</td></tr>
        ${order.delivery_charge ? `<tr><td class="label">Delivery</td><td style="text-align:right">₹${order.delivery_charge}</td></tr>` : ''}
        <tr><td class="label" style="font-weight:bold;font-size:16px">Total</td><td style="text-align:right;font-weight:bold;font-size:16px">₹${order.total}</td></tr>
      </table>
      <p style="margin-top:24px;text-align:center;color:#666;font-size:12px">Thank you for your purchase!</p>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`);
    w.document.close();
  };

  const handleSave = async (printAfter = false) => {
    if (items.length === 0) {
      toast({ title: 'Empty order', description: 'Add at least one product.', variant: 'destructive' });
      return;
    }
    if (!customer.name.trim()) {
      toast({ title: 'Customer name required', variant: 'destructive' });
      return;
    }
    if (!customer.phone.trim()) {
      toast({ title: 'Phone number required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Verify live stock
      const ids = Array.from(new Set(items.map((i) => i.product_id)));
      const { data: liveStock, error: stockErr } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .in('id', ids);
      if (stockErr) throw stockErr;

      const stockMap = new Map((liveStock || []).map((p: any) => [p.id, p]));
      // aggregate qty per product across weights
      const totalsByProduct = new Map<string, number>();
      items.forEach((i) => totalsByProduct.set(i.product_id, (totalsByProduct.get(i.product_id) || 0) + i.quantity));
      for (const [pid, qty] of totalsByProduct) {
        const live: any = stockMap.get(pid);
        if (!live || (live.stock_quantity ?? 0) < qty) {
          throw new Error(`Insufficient stock for ${live?.name || 'product'} (have ${live?.stock_quantity ?? 0}, need ${qty})`);
        }
      }

      const { data: auth } = await supabase.auth.getUser();
      const payload: any = {
        user_id: auth.user?.id || null,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email.trim() || `${customer.phone.trim() || 'guest'}@offline.local`,
        delivery_address: customer.address.trim() || 'In-store pickup',
        items: items as any,
        subtotal: totals.subtotal,
        delivery_charge: shipping,
        total: totals.total,
        payment_method: paymentMethod,
        payment_status: status === 'delivered' || source === 'offline' ? 'paid' : 'pending',
        status,
        order_source: source,
        notes: notes.trim() || null,
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      // Deduct stock
      for (const [pid, qty] of totalsByProduct) {
        const live: any = stockMap.get(pid);
        const newQty = Math.max(0, (live.stock_quantity ?? 0) - qty);
        await supabase.from('products').update({ stock_quantity: newQty, in_stock: newQty > 0 }).eq('id', pid);
      }

      // Add tracking entry
      await supabase.from('order_tracking').insert({
        order_id: order.id,
        status,
        note: `Manual order created via admin (${source})`,
      });

      toast({
        title: '✅ Order created',
        description: `Order #${order.id.slice(0, 8).toUpperCase()} • ₹${totals.total}`,
      });

      if (printAfter) handlePrint(order);
      navigate('/admin/orders');
    } catch (e: any) {
      toast({ title: 'Failed to create order', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" /> New Manual Order
            </h2>
            <p className="text-sm text-muted-foreground">
              Create orders for walk-in customers, social media, phone, or WhatsApp buyers.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
            ← Back to Orders
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: products + cart + customer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product picker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Add Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {loadingProducts ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No products found.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                    {filteredProducts.map((p) => {
                      const def = getDefaultPrice(p);
                      const oos = !p.in_stock || (p.stock_quantity ?? 0) <= 0;
                      return (
                        <button
                          key={p.id}
                          onClick={() => addItem(p)}
                          disabled={oos}
                          className={`text-left bg-muted rounded-lg p-2 transition-all group ${
                            oos ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 hover:ring-primary/40'
                          }`}
                        >
                          <div className="aspect-square bg-background rounded overflow-hidden mb-1.5">
                            {p.image_url && (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{p.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-bold text-primary">₹{def.price}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {oos ? 'OOS' : `Stock: ${p.stock_quantity ?? 0}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{def.weight}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Items ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No items yet. Click products above to add them.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((i) => {
                      const key = `${i.product_id}__${i.weight}`;
                      const product = products.find((p) => p.id === i.product_id);
                      const variants = Array.isArray(product?.prices) ? product!.prices : [];
                      return (
                        <div key={key} className="flex items-center gap-3 p-2 bg-muted/40 rounded-lg">
                          {i.image && <img src={i.image} alt={i.name} className="w-12 h-12 rounded object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{i.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {variants.length > 1 ? (
                                <select
                                  value={i.weight}
                                  onChange={(e) => {
                                    const newWeight = e.target.value;
                                    const v = variants.find((v: any) => String(v.weight) === newWeight);
                                    if (!v) return;
                                    setItems((prev) =>
                                      prev.map((x) =>
                                        `${x.product_id}__${x.weight}` === key
                                          ? { ...x, weight: newWeight, price: Number(v.price) }
                                          : x
                                      )
                                    );
                                  }}
                                  className="text-xs bg-background border border-border rounded px-1.5 py-0.5"
                                >
                                  {variants.map((v: any) => (
                                    <option key={String(v.weight)} value={String(v.weight)}>
                                      {v.weight} – ₹{v.price}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-xs text-muted-foreground">{i.weight}</span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                ₹{i.price} × {i.quantity} = <strong className="text-foreground">₹{i.price * i.quantity}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(key, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-7 text-center text-sm font-medium">{i.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(key, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(key)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" /> Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="🔍 Quick lookup: search past customer by name / phone / email"
                    value={lookup}
                    onChange={(e) => runLookup(e.target.value)}
                    onFocus={() => lookupResults.length && setLookupOpen(true)}
                    onBlur={() => setTimeout(() => setLookupOpen(false), 200)}
                    className="pl-9 border-dashed border-primary/40 bg-accent/20"
                  />
                  {lookupOpen && lookupResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                      {lookupResults.map((c, idx) => (
                        <button
                          key={idx}
                          onMouseDown={() => pickCustomer(c)}
                          className="w-full text-left px-3 py-2 hover:bg-muted border-b border-border last:border-0"
                        >
                          <p className="text-sm font-medium">{c.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.customer_phone || '—'} · {(c.customer_email || '').includes('@offline.local') ? 'no email' : (c.customer_email || '—')}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  {lookupOpen && lookup.length >= 2 && lookupResults.length === 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-xs text-muted-foreground">No matching customer found.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Customer name" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone *</Label>
                    <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+91…" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Email (optional)</Label>
                    <Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="email@example.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Delivery Address</Label>
                    <Textarea
                      rows={2}
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Leave empty for in-store pickup"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: billing summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Billing & Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Order Source</Label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    {SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm capitalize"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Disc %</Label>
                    <Input type="number" min={0} max={100} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs">Tax %</Label>
                    <Input type="number" min={0} max={100} value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs">Ship ₹</Label>
                    <Input type="number" min={0} value={shipping} onChange={(e) => setShipping(Number(e.target.value) || 0)} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal note…" />
                </div>

                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <Row label="Subtotal" value={totals.subtotal} />
                  {totals.discount > 0 && <Row label={`Discount (${discountPct}%)`} value={-totals.discount} accent="text-green-600" />}
                  {totals.tax > 0 && <Row label={`Tax (${taxPct}%)`} value={totals.tax} />}
                  {shipping > 0 && <Row label="Shipping" value={shipping} />}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg text-primary">₹{totals.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{items.reduce((s, i) => s + i.quantity, 0)} units</Badge>
                  <Badge variant="outline" className="text-xs">{items.length} lines</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button onClick={() => handleSave(false)} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                  </Button>
                  <Button onClick={() => handleSave(true)} disabled={saving} variant="secondary" className="w-full">
                    <Printer className="h-4 w-4" /> Save & Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Row = ({ label, value, accent }: { label: string; value: number; accent?: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={accent || 'text-foreground'}>
      {value < 0 ? '-' : ''}₹{Math.abs(value).toLocaleString()}
    </span>
  </div>
);

export default NewOrder;
