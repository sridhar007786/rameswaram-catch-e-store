import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, MessageCircle, FileDown, Printer, CalendarDays, Download, Clock, Package, Truck, CheckCircle2, XCircle, User, Phone, Mail, MapPin, CreditCard, StickyNote } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const OrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderTracking, setOrderTracking] = useState<any[]>([]);
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

  const fetchOrderTracking = async (orderId: string) => {
    const { data } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    setOrderTracking(data || []);
  };

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    fetchOrderTracking(order.id);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Order status changed to ${newStatus}.` });
      // Add tracking entry
      await supabase.from('order_tracking').insert({ order_id: orderId, status: newStatus, note: `Status changed to ${newStatus}` });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        fetchOrderTracking(orderId);
      }
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

  const downloadOrdersCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Email', 'Address', 'Items', 'Subtotal', 'Delivery', 'Total', 'Status', 'Payment Method', 'Payment Status'];
    const rows = filteredOrders.map(o => [
      o.id, new Date(o.created_at).toLocaleDateString(), o.customer_name, o.customer_phone,
      o.customer_email || '', o.delivery_address,
      ((o.items as any[]) || []).map((i: any) => `${i.name} x${i.quantity}`).join('; '),
      o.subtotal, o.delivery_charge, o.total, o.status, o.payment_method || 'cod', o.payment_status || 'pending',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadOrdersCSV}>
                <Download className="h-4 w-4" /> Export CSV
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

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Order Details
                <Badge className={`ml-2 capitalize ${statusStyles[selectedOrder?.status] || ''}`}>
                  {selectedOrder?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Customer Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium text-sm">{selectedOrder.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium text-sm">{selectedOrder.customer_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{selectedOrder.customer_email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-medium text-sm">{selectedOrder.delivery_address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Items Ordered</h4>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Item</th>
                          <th className="text-center py-2 px-3 font-medium text-muted-foreground">Weight</th>
                          <th className="text-center py-2 px-3 font-medium text-muted-foreground">Qty</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Price</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedOrder.items as any[])?.map((item: any, i: number) => (
                          <tr key={i} className="border-t border-border">
                            <td className="py-2 px-3 font-medium">{item.name}</td>
                            <td className="py-2 px-3 text-center text-muted-foreground">{item.weight || '-'}</td>
                            <td className="py-2 px-3 text-center">{item.quantity}</td>
                            <td className="py-2 px-3 text-right text-muted-foreground">₹{item.price}</td>
                            <td className="py-2 px-3 text-right font-semibold">₹{item.price * item.quantity}</td>
                          </tr>
                        )) || <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No items data</td></tr>}
                      </tbody>
                      <tfoot className="bg-muted/30">
                        <tr className="border-t border-border">
                          <td colSpan={4} className="py-2 px-3 text-right text-muted-foreground">Subtotal</td>
                          <td className="py-2 px-3 text-right font-medium">₹{Number(selectedOrder.subtotal).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="py-2 px-3 text-right text-muted-foreground">Delivery</td>
                          <td className="py-2 px-3 text-right font-medium">₹{Number(selectedOrder.delivery_charge).toLocaleString()}</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td colSpan={4} className="py-2 px-3 text-right font-bold text-base">Grand Total</td>
                          <td className="py-2 px-3 text-right font-bold text-base text-primary">₹{Number(selectedOrder.total).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Payment & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <p className="font-medium text-sm capitalize">{selectedOrder.payment_method || 'COD'} · <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'outline'} className="text-xs capitalize">{selectedOrder.payment_status}</Badge></p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                      <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Timeline */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Order Timeline</h4>
                  <div className="space-y-0">
                    {/* Created entry */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        {orderTracking.length > 0 && <div className="w-0.5 flex-1 bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-sm">Order Placed</p>
                        <p className="text-xs text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {/* Tracking entries */}
                    {orderTracking.map((t, i) => {
                      const Icon = statusIcons[t.status] || Clock;
                      return (
                        <div key={t.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              t.status === 'cancelled' ? 'bg-destructive/10' : 
                              t.status === 'delivered' ? 'bg-green-100' : 'bg-muted'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                t.status === 'cancelled' ? 'text-destructive' :
                                t.status === 'delivered' ? 'text-green-600' : 'text-muted-foreground'
                              }`} />
                            </div>
                            {i < orderTracking.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-sm capitalize">{t.status}</p>
                            {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
                            <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <select
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
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
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
                      <tr key={order.id} className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer ${selectedIds.has(order.id) ? 'bg-primary/5' : ''}`}
                        onClick={() => openOrderDetail(order)}>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 font-medium">{order.customer_name}</td>
                        <td className="py-3 px-4">{order.customer_phone}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[150px] truncate">
                          {(order.items as any[])?.map((i: any) => `${i.name} x${i.quantity}`).join(', ') || '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold">₹{Number(order.total).toLocaleString()}</td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          <select
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusStyles[order.status] || 'bg-muted'}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openOrderDetail(order)}><Eye className="h-4 w-4" /></Button>
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
