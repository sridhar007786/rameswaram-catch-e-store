import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
  outOfStock: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
    outOfStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Real-time order updates
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, in_stock'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter((o: any) => o.created_at?.startsWith(today));
      const pendingOrders = orders.filter((o: any) => o.status === 'pending');
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
      const outOfStock = products.filter((p: any) => !p.in_stock).length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders: pendingOrders.length,
        todayOrders: todayOrders.length,
        outOfStock,
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
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
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
        <h2 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h2>

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

            {/* Recent orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
              </CardHeader>
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
                            <td className="py-3 px-2 text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
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
