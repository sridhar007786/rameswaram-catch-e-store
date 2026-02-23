import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Eye, X, Phone, Mail, MapPin, ShoppingCart } from 'lucide-react';

interface Customer {
  name: string;
  phone: string;
  email: string | null;
  addresses: string[];
  orders: any[];
  totalSpent: number;
  orderCount: number;
  lastOrder: string;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!orders) { setLoading(false); return; }

    const map: Record<string, Customer> = {};
    orders.forEach((o: any) => {
      const key = o.customer_phone;
      if (!map[key]) {
        map[key] = {
          name: o.customer_name,
          phone: o.customer_phone,
          email: o.customer_email,
          addresses: [],
          orders: [],
          totalSpent: 0,
          orderCount: 0,
          lastOrder: o.created_at,
        };
      }
      map[key].orders.push(o);
      map[key].totalSpent += Number(o.total || 0);
      map[key].orderCount += 1;
      if (o.delivery_address && !map[key].addresses.includes(o.delivery_address)) {
        map[key].addresses.push(o.delivery_address);
      }
      if (!map[key].email && o.customer_email) map[key].email = o.customer_email;
    });

    setCustomers(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent));
    setLoading(false);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-muted'}`}>{status}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Customer Management</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Customer detail */}
        {selected && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Customer Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selected.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{selected.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selected.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selected.addresses.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> Saved Addresses</p>
                  <div className="space-y-1">
                    {selected.addresses.map((a, i) => (
                      <p key={i} className="text-sm bg-muted/50 px-3 py-2 rounded-lg">{a}</p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> Order History ({selected.orderCount})</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Items</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Total</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.orders.map((o: any) => (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-2 text-xs">{((o.items as any[]) || []).map((i: any) => i.name).join(', ') || '-'}</td>
                          <td className="py-2 px-2 font-medium">₹{Number(o.total).toLocaleString()}</td>
                          <td className="py-2 px-2">{statusBadge(o.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading customers...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No customers found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Orders</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Spent</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Order</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.phone} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <p className="font-medium">{c.name}</p>
                          {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                        </td>
                        <td className="py-3 px-4">{c.phone}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{c.orderCount}</Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">₹{c.totalSpent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(c.lastOrder).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => setSelected(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
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

export default CustomerManagement;
