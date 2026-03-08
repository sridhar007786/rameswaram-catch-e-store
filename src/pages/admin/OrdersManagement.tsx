import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, X, MessageCircle, FileDown, Printer, CalendarDays } from 'lucide-react';
import { sendOrderConfirmation, sendStatusUpdate } from '@/utils/whatsapp';
import { generateOrderPDF } from '@/utils/pdf';
import { generateDeliveryLabelsPDF } from '@/utils/deliveryLabels';

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
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleDownloadSelectedLabels = () => {
    const selected = filteredOrders.filter(o => selectedIds.has(o.id));
    if (selected.length === 0) {
      toast({ title: 'No orders selected', description: 'Select orders to generate labels.', variant: 'destructive' });
      return;
    }
    generateDeliveryLabelsPDF(
      selected.map((o) => ({
        id: o.id, created_at: o.created_at, customer_name: o.customer_name,
        customer_phone: o.customer_phone, delivery_address: o.delivery_address,
        items: (o.items as any[]) || [], total: Number(o.total), payment_method: o.payment_method,
      }))
    );
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching orders:', error);
    else setOrders(data || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Order status changed to ${newStatus}.` });
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      if (order && ['confirmed', 'packed', 'shipped', 'delivered'].includes(newStatus)) {
        sendStatusUpdate({ id: orderId, customerName: order.customer_name, customerPhone: order.customer_phone, status: newStatus, total: Number(order.total) });
      }
    }
  };

  const handleWhatsAppConfirmation = (order: any) => {
    sendOrderConfirmation({
      id: order.id, customerName: order.customer_name, customerPhone: order.customer_phone,
      items: (order.items as any[]) || [], subtotal: Number(order.subtotal),
      deliveryCharge: Number(order.delivery_charge), total: Number(order.total),
      address: order.delivery_address, paymentMethod: order.payment_method || 'cod',
    });
  };

  const handleDownloadPDF = (order: any) => {
    generateOrderPDF({
      id: order.id, created_at: order.created_at, customer_name: order.customer_name,
      customer_phone: order.customer_phone, customer_email: order.customer_email,
      delivery_address: order.delivery_address, items: (order.items as any[]) || [],
      subtotal: Number(order.subtotal), delivery_charge: Number(order.delivery_charge),
      total: Number(order.total), payment_method: order.payment_method, status: order.status,
    });
  };

  // Date filtering logic
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const isCustomDate = (dateStr: string) => {
    if (!customDate) return true;
    const d = new Date(dateStr);
    const c = new Date(customDate);
    return d.getFullYear() === c.getFullYear() && d.getMonth() === c.getMonth() && d.getDate() === c.getDate();
  };

  const getDateFilteredOrders = (list: any[]) => {
    if (dateFilter === 'today') return list.filter(o => isToday(o.created_at));
    if (dateFilter === 'custom' && customDate) return list.filter(o => isCustomDate(o.created_at));
    return list;
  };

  const filteredOrders = getDateFilteredOrders(
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)
  );

  const handleDownloadAllLabels = () => {
    if (filteredOrders.length === 0) {
      toast({ title: 'No orders', description: 'No orders to generate labels for.', variant: 'destructive' });
      return;
    }
    generateDeliveryLabelsPDF(
      filteredOrders.map((o) => ({
        id: o.id, created_at: o.created_at, customer_name: o.customer_name,
        customer_phone: o.customer_phone, delivery_address: o.delivery_address,
        items: (o.items as any[]) || [], total: Number(o.total), payment_method: o.payment_method,
      }))
    );
  };

  const todayCount = orders.filter(o => isToday(o.created_at)).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Order Management</h2>
            <div className="flex gap-2 flex-wrap">
              {selectedIds.size > 0 && (
                <Button variant="default" size="sm" className="gap-1.5" onClick={handleDownloadSelectedLabels}>
                  <Printer className="h-4 w-4" /> Labels for Selected ({selectedIds.size})
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadAllLabels}>
                <Printer className="h-4 w-4" /> All Labels ({filteredOrders.length})
              </Button>
            </div>
          </div>

          {/* Date filter row */}
          <div className="flex gap-2 flex-wrap items-center">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Button variant={dateFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setDateFilter('all')}>
              All Dates
            </Button>
            <Button variant={dateFilter === 'today' ? 'default' : 'outline'} size="sm" onClick={() => setDateFilter('today')}>
              Today ({todayCount})
            </Button>
            <Button variant={dateFilter === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setDateFilter('custom')}>
              Custom Date
            </Button>
            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            )}
          </div>

          {/* Status filter row */}
          <div className="flex gap-2 flex-wrap">
            <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>
              All ({getDateFilteredOrders(orders).length})
            </Button>
            {ORDER_STATUSES.map((status) => {
              const count = getDateFilteredOrders(orders.filter((o) => o.status === status)).length;
              return (
                <Button key={status} variant={filterStatus === status ? 'default' : 'outline'} size="sm"
                  onClick={() => setFilterStatus(status)} className="capitalize">
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
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Customer</p><p className="font-medium">{selectedOrder.customer_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{selectedOrder.customer_phone}</p></div>
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedOrder.customer_email || 'N/A'}</p></div>
                <div><p className="text-sm text-muted-foreground">Delivery Address</p><p className="font-medium">{selectedOrder.delivery_address}</p></div>
                <div><p className="text-sm text-muted-foreground">Payment Method</p><p className="font-medium capitalize">{selectedOrder.payment_method}</p></div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'outline'} className="capitalize">{selectedOrder.payment_status}</Badge>
                </div>
              </div>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal: ₹{Number(selectedOrder.subtotal).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Delivery: ₹{Number(selectedOrder.delivery_charge).toLocaleString()}</p>
                  <p className="font-bold text-lg">Total: ₹{Number(selectedOrder.total).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleWhatsAppConfirmation(selectedOrder)}>
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownloadPDF(selectedOrder)}>
                    <FileDown className="h-4 w-4" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => generateDeliveryLabelsPDF([{
                    id: selectedOrder.id, created_at: selectedOrder.created_at, customer_name: selectedOrder.customer_name,
                    customer_phone: selectedOrder.customer_phone, delivery_address: selectedOrder.delivery_address,
                    items: (selectedOrder.items as any[]) || [], total: Number(selectedOrder.total), payment_method: selectedOrder.payment_method,
                  }])}>
                    <Printer className="h-4 w-4" /> Label
                  </Button>
                  <select
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
              {selectedOrder.notes && (
                <div><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm">{selectedOrder.notes}</p></div>
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
                  {filterStatus === 'all' ? 'No orders found for this date.' : `No ${filterStatus} orders found.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 w-10">
                        <Checkbox checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length} onCheckedChange={toggleSelectAll} />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order: any) => (
                      <tr key={order.id} className={`border-b last:border-0 hover:bg-muted/30 ${selectedIds.has(order.id) ? 'bg-primary/5' : ''}`}>
                        <td className="py-3 px-4">
                          <Checkbox checked={selectedIds.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 font-medium">{order.customer_name}</td>
                        <td className="py-3 px-4">{order.customer_phone}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[150px] truncate">
                          {(order.items as any[])?.map((i: any) => `${i.name} x${i.quantity}`).join(', ') || '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold">₹{Number(order.total).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <select
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusStyles[order.status] || 'bg-muted'}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => generateDeliveryLabelsPDF([{
                            id: order.id, created_at: order.created_at, customer_name: order.customer_name,
                            customer_phone: order.customer_phone, delivery_address: order.delivery_address,
                            items: (order.items as any[]) || [], total: Number(order.total), payment_method: order.payment_method,
                          }])}>
                            <Printer className="h-4 w-4" />
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
