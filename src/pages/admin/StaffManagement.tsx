import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield, Trash2, Users, Search } from 'lucide-react';

interface StaffMember {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
}

const StaffManagement = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('moderator');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    // Get all user roles
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*');

    if (error) {
      console.error('Error fetching roles:', error);
      setLoading(false);
      return;
    }

    // Get profiles for these users
    const userIds = (roles || []).map(r => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name');

    const staffList: StaffMember[] = (roles || []).map(r => {
      const profile = (profiles || []).find(p => p.user_id === r.user_id);
      return {
        user_id: r.user_id,
        role: r.role,
        full_name: profile?.full_name || undefined,
      };
    });

    setStaff(staffList);
    setLoading(false);
  };

  const handleAddStaff = async () => {
    if (!newEmail.trim()) {
      toast({ title: 'Error', description: 'Please enter a user email or ID.', variant: 'destructive' });
      return;
    }
    setAdding(true);

    // We need to find the user by looking up profiles or auth
    // Since we can't query auth.users, we'll accept user_id directly or search profiles
    // Try to find by matching email pattern in profiles (limited approach)
    // For now, treat input as user_id (UUID)
    const userId = newEmail.trim();

    const { error } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: newRole,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Staff member added as ${newRole}.` });
      setShowAdd(false);
      setNewEmail('');
      fetchStaff();
    }
    setAdding(false);
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role from this user?`)) return;
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Removed', description: 'Role removed successfully.' });
      fetchStaff();
    }
  };

  const filtered = staff.filter(s =>
    (s.full_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
    s.user_id.includes(search) ||
    s.role.includes(search.toLowerCase())
  );

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Staff Management</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => setShowAdd(true)} className="gap-2 shrink-0">
              <UserPlus className="h-4 w-4" /> Add Staff
            </Button>
          </div>
        </div>

        {/* Add staff form */}
        {showAdd && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Add Staff Member</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User ID (UUID)</Label>
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Paste the user's UUID here" />
                <p className="text-xs text-muted-foreground">You can find the user ID from the customer management page or backend.</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'admin' | 'moderator')}
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button onClick={handleAddStaff} disabled={adding} className="gap-2">
                <Shield className="h-4 w-4" />
                {adding ? 'Adding...' : 'Add Staff Member'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Staff list */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading staff...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No staff members found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">User ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={`${s.user_id}-${s.role}`} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{s.full_name || 'Unknown'}</td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{s.user_id.slice(0, 12)}...</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleColor(s.role)}`}>
                            {s.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveRole(s.user_id, s.role)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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

export default StaffManagement;
