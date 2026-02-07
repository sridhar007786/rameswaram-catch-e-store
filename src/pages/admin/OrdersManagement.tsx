import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, X, ChevronDown } from 'lucide-react';

const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Order status changed to ${newStatus}.` });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Order Management</h2>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({orders.length})
            </Button>
            {ORDER_STATUSES.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Order detail modal */}
        {selectedOrder && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Order Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{selectedOrder.delivery_address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'outline'} className="capitalize">
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {(selectedOrder.items as any[])?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name} ({item.weight}) x{item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No items data</p>}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal: ₹{Number(selectedOrder.subtotal).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Delivery: ₹{Number(selectedOrder.delivery_charge).toLocaleString()}</p>
                  <p className="font-bold text-lg">Total: ₹{Number(selectedOrder.total).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <select
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filterStatus === 'all' ? 'No orders yet.' : `No ${filterStatus} orders.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order: any) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 font-medium">{order.customer_name}</td>
                        <td className="py-3 px-4">{order.customer_phone}</td>
                        <td className="py-3 px-4 font-semibold">₹{Number(order.total).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <select
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusStyles[order.status] || 'bg-muted'}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
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

export default OrdersManagement;
