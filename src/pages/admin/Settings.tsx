import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Store, Bell, MessageSquare } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('store_settings').select('key, value');
    const map: Record<string, string> = {};
    (data || []).forEach((s: any) => { map[s.key] = s.value || ''; });
    setSettings(map);
    setLoading(false);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('store_settings').upsert(rows, { onConflict: 'key' });
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      await queryClient.invalidateQueries({ queryKey: ['store_settings'] });
      toast({ title: 'Settings saved', description: 'Live site updated instantly.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-muted-foreground">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">Settings</h2>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Store className="h-5 w-5" /> Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input value={settings.store_name || ''} onChange={e => updateSetting('store_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={settings.store_phone || ''} onChange={e => updateSetting('store_phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={settings.store_email || ''} onChange={e => updateSetting('store_email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={settings.store_address || ''} onChange={e => updateSetting('store_address', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">🚚 Delivery Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Charge (₹)</Label>
                <Input type="number" value={settings.delivery_charge || ''} onChange={e => updateSetting('delivery_charge', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Free Delivery Threshold (₹)</Label>
                <Input type="number" value={settings.free_delivery_threshold || ''} onChange={e => updateSetting('free_delivery_threshold', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4" /> WhatsApp Notifications</p>
                <p className="text-sm text-muted-foreground">Send order updates via WhatsApp</p>
              </div>
              <Switch
                checked={settings.whatsapp_notifications === 'true'}
                onCheckedChange={v => updateSetting('whatsapp_notifications', v ? 'true' : 'false')}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input value={settings.whatsapp_number || ''} onChange={e => updateSetting('whatsapp_number', e.target.value)} placeholder="+91..." />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send order confirmation emails</p>
              </div>
              <Switch
                checked={settings.email_notifications === 'true'}
                onCheckedChange={v => updateSetting('email_notifications', v ? 'true' : 'false')}
              />
            </div>
            <div className="space-y-2">
              <Label>Order Confirmation Message</Label>
              <Textarea
                value={settings.order_confirmation_msg || ''}
                onChange={e => updateSetting('order_confirmation_msg', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;
