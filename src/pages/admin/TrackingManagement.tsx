import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, Truck, CheckCircle, Clock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  created_at: string;
}

interface TrackingEntry {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

const statusFlow = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

const TrackingManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('id, customer_name, customer_phone, status, total, created_at')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const selectOrder = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from('order_tracking').select('*').eq('order_id', order.id).order('created_at', { ascending: true });
    setTracking((data as TrackingEntry[]) || []);
  };

  const advanceStatus = async () => {
    if (!selectedOrder) return;
    const currentIdx = statusFlow.indexOf(selectedOrder.status);
    if (currentIdx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIdx + 1];
    setUpdating(true);

    // Update order status
    await supabase.from('orders').update({ status: nextStatus }).eq('id', selectedOrder.id);

    // Add tracking entry
    await supabase.from('order_tracking').insert({
      order_id: selectedOrder.id,
      status: nextStatus,
      note: newNote || `Order ${nextStatus}`,
    });

    toast({ title: 'Status updated', description: `Order moved to ${nextStatus}` });
    setNewNote('');
    setUpdating(false);
    fetchOrders();
    selectOrder({ ...selectedOrder, status: nextStatus });
  };

  const filtered = orders.filter(o =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search) ||
    o.id.includes(search)
  );

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[s] || 'bg-muted text-muted-foreground';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Order Tracking</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Selected order detail */}
        {selectedOrder && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Order #{selectedOrder.id.slice(0, 8)}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-foreground font-medium">{selectedOrder.customer_name}</p>
                <p className="text-muted-foreground">{selectedOrder.customer_phone}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Status timeline */}
              <div className="flex items-center gap-2 overflow-x-auto py-4">
                {statusFlow.map((s, i) => {
                  const currentIdx = statusFlow.indexOf(selectedOrder.status);
                  const isComplete = i <= currentIdx;
                  const Icon = statusIcons[s] || Clock;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`flex flex-col items-center gap-1 ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs capitalize font-medium">{s}</span>
                      </div>
                      {i < statusFlow.length - 1 && (
                        <div className={`w-8 h-0.5 ${i < currentIdx ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tracking history */}
              {tracking.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Tracking History</p>
                  {tracking.map(t => (
                    <div key={t.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <span className="font-medium capitalize text-foreground">{t.status}</span>
                        {t.note && <span className="text-muted-foreground"> — {t.note}</span>}
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Advance status */}
              {statusFlow.indexOf(selectedOrder.status) < statusFlow.length - 1 && (
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input placeholder="Add a note (optional)..." value={newNote} onChange={e => setNewNote(e.target.value)} />
                  </div>
                  <Button onClick={advanceStatus} disabled={updating} className="gap-2 shrink-0">
                    <Send className="h-4 w-4" />
                    Move to {statusFlow[statusFlow.indexOf(selectedOrder.status) + 1]}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders list */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 font-medium">{o.customer_name}</td>
                        <td className="py-3 px-4">₹{Number(o.total).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(o.status)}`}>{o.status}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => selectOrder(o)}>Track</Button>
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

export default TrackingManagement;
