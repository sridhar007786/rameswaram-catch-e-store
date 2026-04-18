import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, AlertTriangle, PlusCircle, Store, Smartphone, Phone, MessageCircle, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
  outOfStock: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  in_stock: boolean;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    pendingOrders: 0, todayOrders: 0, outOfStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; revenue: number }[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, { count: number; revenue: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, in_stock, stock_quantity, low_stock_threshold, name'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const products = (productsRes.data as any[]) || [];
      const orders = ordersRes.data || [];

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter((o: any) => o.created_at?.startsWith(today));
      const pendingOrders = orders.filter((o: any) => o.status === 'pending');
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
      const outOfStock = products.filter((p: any) => !p.in_stock || (p.stock_quantity !== null && p.stock_quantity <= 0)).length;

      // Low stock products
      const lowStock = products.filter((p: any) =>
        p.stock_quantity !== null && p.stock_quantity <= (p.low_stock_threshold || 10)
      ).sort((a: any, b: any) => (a.stock_quantity || 0) - (b.stock_quantity || 0));

      setLowStockProducts(lowStock as LowStockProduct[]);

      // Last 7 days revenue
      const last7Days: { day: string; revenue: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayRevenue = orders
          .filter((o: any) => o.created_at?.startsWith(dateStr))
          .reduce((s: number, o: any) => s + Number(o.total || 0), 0);
        last7Days.push({ day: dayLabel, revenue: Math.round(dayRevenue) });
      }
      setWeeklyRevenue(last7Days);

      // Order source breakdown
      const breakdown: Record<string, { count: number; revenue: number }> = {};
      orders.forEach((o: any) => {
        const src = o.order_source || 'online';
        if (!breakdown[src]) breakdown[src] = { count: 0, revenue: 0 };
        breakdown[src].count += 1;
        breakdown[src].revenue += Number(o.total || 0);
      });
      setSourceBreakdown(breakdown);

      setStats({
        totalProducts: products.length, totalOrders: orders.length, totalRevenue,
        pendingOrders: pendingOrders.length, todayOrders: todayOrders.length, outOfStock,
      });
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-primary' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-accent' },
    { title: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500' },
    { title: "Today's Orders", value: stats.todayOrders, icon: TrendingUp, color: 'text-secondary' },
    { title: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-destructive' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800', shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <Link to="/admin/orders/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> New Manual Order
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <Card key={card.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${card.color}`}>
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order source breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Orders by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(sourceBreakdown).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">No orders yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { key: 'offline', label: 'Walk-in', icon: Store, color: 'text-blue-600 bg-blue-50' },
                      { key: 'social', label: 'Social', icon: Smartphone, color: 'text-pink-600 bg-pink-50' },
                      { key: 'phone', label: 'Phone', icon: Phone, color: 'text-amber-600 bg-amber-50' },
                      { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600 bg-green-50' },
                      { key: 'online', label: 'Online', icon: Globe, color: 'text-purple-600 bg-purple-50' },
                    ].map((s) => {
                      const data = sourceBreakdown[s.key] || { count: 0, revenue: 0 };
                      return (
                        <div key={s.key} className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                            <s.icon className="h-4 w-4" />
                          </div>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="text-lg font-bold text-foreground">{data.count}</p>
                          <p className="text-xs text-muted-foreground">₹{data.revenue.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Revenue Chart */}
              <Card>
                <CardHeader><CardTitle className="text-lg">This Week's Revenue</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card className={lowStockProducts.length > 0 ? 'border-destructive/30' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${lowStockProducts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    Low Stock Alerts ({lowStockProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">All products are well stocked! ✅</p>
                  ) : (
                    <div className="space-y-3 max-h-52 overflow-y-auto">
                      {lowStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm text-foreground">{p.name}</span>
                          <Badge variant={p.stock_quantity <= 0 ? 'destructive' : 'outline'}
                            className={p.stock_quantity <= 0 ? '' : 'border-amber-300 text-amber-700 bg-amber-50'}>
                            {p.stock_quantity <= 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent orders */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Customer</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order: any) => (
                          <tr key={order.id} className="border-b last:border-0">
                            <td className="py-3 px-2 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                            <td className="py-3 px-2">{order.customer_name}</td>
                            <td className="py-3 px-2 font-semibold">₹{Number(order.total).toLocaleString()}</td>
                            <td className="py-3 px-2">{getStatusBadge(order.status)}</td>
                            <td className="py-3 px-2 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
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

export default Dashboard;
