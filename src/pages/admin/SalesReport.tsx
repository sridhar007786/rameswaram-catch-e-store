import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download, TrendingUp, Calendar, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#f59e0b', '#8b5cf6', '#ec4899'];

const SalesReport = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: true });
    setOrders(data || []);
    setLoading(false);
  };

  const getFilteredOrders = () => {
    if (dateRange === 'all') return orders;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  };

  const filtered = getFilteredOrders();
  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalOrders = filtered.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredOrders = filtered.filter(o => o.status === 'delivered').length;

  // Daily revenue chart
  const dailyData = (() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[day] = (map[day] || 0) + Number(o.total || 0);
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }));
  })();

  // Status breakdown
  const statusData = (() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Payment method breakdown
  const paymentData = (() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => {
      const method = o.payment_method || 'cod';
      map[method] = (map[method] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  })();

  // Top products
  const topProducts = (() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filtered.forEach(o => {
      ((o.items as any[]) || []).forEach((item: any) => {
        const key = item.name || 'Unknown';
        if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
        map[key].qty += item.quantity || 1;
        map[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  })();

  const downloadCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Items', 'Subtotal', 'Delivery', 'Total', 'Status', 'Payment'];
    const rows = filtered.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.customer_phone,
      ((o.items as any[]) || []).map((i: any) => `${i.name} x${i.quantity}`).join('; '),
      o.subtotal,
      o.delivery_charge,
      o.total,
      o.status,
      o.payment_method,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Sales Report</h2>
          <div className="flex gap-2 flex-wrap">
            {(['7d', '30d', '90d', 'all'] as const).map(r => (
              <Button key={r} variant={dateRange === r ? 'default' : 'outline'} size="sm" onClick={() => setDateRange(r)}>
                {r === 'all' ? 'All Time' : `Last ${r.replace('d', ' Days')}`}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="gap-2" onClick={downloadCSV}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading report...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600' },
                { title: 'Total Orders', value: totalOrders, icon: TrendingUp, color: 'text-primary' },
                { title: 'Avg Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString()}`, icon: Calendar, color: 'text-accent' },
                { title: 'Delivered', value: deliveredOrders, icon: TrendingUp, color: 'text-green-600' },
              ].map(c => (
                <Card key={c.title}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{c.title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{c.value}</p>
                      </div>
                      <c.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${c.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue chart */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Revenue Over Time</CardTitle></CardHeader>
              <CardContent>
                {dailyData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status breakdown */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Order Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                          {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Payment methods */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Payment Methods</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top products */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Top Selling Products</CardTitle></CardHeader>
              <CardContent className="p-0">
                {topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No product data</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Qty Sold</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={p.name} className="border-b last:border-0">
                            <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                            <td className="py-3 px-4 font-medium">{p.name}</td>
                            <td className="py-3 px-4">{p.qty}</td>
                            <td className="py-3 px-4 text-right font-semibold">₹{p.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default SalesReport;
