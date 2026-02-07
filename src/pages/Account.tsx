import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Phone, Mail, Edit2, Save, X, Clock, CheckCircle, Truck as TruckIcon, Box } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
  delivery_address: string;
  payment_method: string;
  payment_status: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const ORDER_STATUSES = [
  { key: 'pending', label: 'New', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { key: 'packed', label: 'Packed', icon: Box, color: 'bg-blue-100 text-blue-700' },
  { key: 'shipped', label: 'Shipped', icon: TruckIcon, color: 'bg-purple-100 text-purple-700' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
];

const getStatusIndex = (status: string) => {
  const idx = ORDER_STATUSES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

const OrderStatusTracker = ({ status }: { status: string }) => {
  const currentIdx = getStatusIndex(status);

  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full py-3">
      {ORDER_STATUSES.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const StepIcon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all',
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                  isCurrent && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-medium text-center',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < ORDER_STATUSES.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-1 sm:mx-2 mt-[-18px] sm:mt-[-22px]',
                  idx < currentIdx ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper
import { cn } from '@/lib/utils';

const AccountPage = () => {
  const { user, isLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile>({ full_name: null, phone: null, avatar_url: null });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProfile();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoadingOrders(false);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setProfileForm({ full_name: data.full_name || '', phone: data.phone || '' });
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.full_name || null,
        phone: profileForm.phone || null,
      })
      .eq('user_id', user!.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } else {
      setProfile({ ...profile, full_name: profileForm.full_name, phone: profileForm.phone });
      setEditingProfile(false);
      toast({ title: 'Profile updated!' });
    }
    setSavingProfile(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-ocean-gradient rounded-2xl p-6 md:p-8 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl md:text-4xl shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl md:text-3xl font-bold truncate">
                  {profile.full_name || 'Seafood Lover'}
                </h1>
                <p className="text-white/70 text-sm md:text-base truncate">{user.email}</p>
                {profile.phone && (
                  <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {profile.phone}
                  </p>
                )}
              </div>
              <Button
                variant="glass"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="orders" className="gap-1.5 py-2.5 text-xs sm:text-sm">
                <Package className="h-4 w-4" />
                <span>Orders</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5 py-2.5 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-1.5 py-2.5 text-xs sm:text-sm">
                <MapPin className="h-4 w-4" />
                <span>Addresses</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-2xl shadow-ocean">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Your order history will appear here after your first purchase.
                    </p>
                    <Link to="/products">
                      <Button variant="cta">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-card rounded-2xl shadow-ocean overflow-hidden">
                      {/* Order header */}
                      <div className="p-4 md:p-6 border-b border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </span>
                            <Badge
                              className={cn(
                                'text-xs',
                                ORDER_STATUSES[getStatusIndex(order.status)]?.color || 'bg-muted text-muted-foreground'
                              )}
                            >
                              {ORDER_STATUSES[getStatusIndex(order.status)]?.label || order.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </span>
                        </div>

                        {/* Status tracker */}
                        <OrderStatusTracker status={order.status} />
                      </div>

                      {/* Order items */}
                      <div className="p-4 md:p-6">
                        <div className="space-y-2 mb-4">
                          {(order.items as any[]).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.name} ({item.weight}) × {item.quantity}
                              </span>
                              <span className="font-medium text-foreground">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-border">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{order.delivery_address}</span>
                          </div>
                          <span className="text-lg font-bold text-foreground whitespace-nowrap">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="bg-card rounded-2xl shadow-ocean p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Personal Information
                  </h2>
                  {!editingProfile ? (
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="gap-1.5">
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="gap-1.5">
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                          placeholder="Your full name"
                        />
                      ) : (
                        <p className="text-foreground py-2 px-3 bg-muted rounded-lg text-sm">
                          {profile.full_name || '—'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      ) : (
                        <p className="text-foreground py-2 px-3 bg-muted rounded-lg text-sm">
                          {profile.phone || '—'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-foreground py-2 px-3 bg-muted rounded-lg text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <div className="bg-card rounded-2xl shadow-ocean p-4 md:p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Saved Addresses
                </h2>

                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {/* Derive unique addresses from orders */}
                    {[...new Set(orders.map((o) => o.delivery_address))].map((addr, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border"
                      >
                        <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm">{addr}</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Used in {orders.filter((o) => o.delivery_address === addr).length} order(s)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Your delivery addresses will appear here after your first order.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
