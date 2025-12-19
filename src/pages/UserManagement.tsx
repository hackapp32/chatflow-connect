import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserPlus, Trash2, ArrowLeft, Users, Zap } from 'lucide-react';

interface AppUser {
  id: string;
  username: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, username, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch users');
      return;
    }
    setUsers(data || []);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.rpc('add_app_user' as any, {
        p_username: username.trim(),
        p_password: password
      });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error('Username already exists');
        } else {
          throw error;
        }
        return;
      }

      toast.success('User added successfully');
      setUsername('');
      setPassword('');
      fetchUsers();
    } catch (error: any) {
      console.error('Add user error:', error);
      toast.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark p-4 relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-soft" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-neon-cyan hover:bg-neon-cyan/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Chat
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-cyber neon-border mb-4">
            <Users className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="font-cyber text-3xl neon-text tracking-wider">USER MANAGEMENT</h1>
          <p className="text-neon-cyan/60 mt-2 font-rajdhani">Manage system access</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add User Form */}
          <div className="glass-cyber neon-border rounded-2xl p-6">
            <h2 className="font-cyber text-xl text-neon-pink mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              ADD NEW USER
            </h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-neon-cyan font-rajdhani text-sm uppercase tracking-wider">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1 bg-cyber-dark/50 border-neon-pink/30 text-neon-cyan placeholder:text-neon-cyan/30 focus:border-neon-pink font-rajdhani"
                />
              </div>

              <div>
                <label className="text-neon-cyan font-rajdhani text-sm uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 chars)"
                  className="mt-1 bg-cyber-dark/50 border-neon-pink/30 text-neon-cyan placeholder:text-neon-cyan/30 focus:border-neon-pink font-rajdhani"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-cyber tracking-wider"
              >
                {loading ? 'ADDING...' : 'ADD USER'}
              </Button>
            </form>
          </div>

          {/* User List */}
          <div className="glass-cyber neon-border rounded-2xl p-6">
            <h2 className="font-cyber text-xl text-neon-cyan mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              REGISTERED USERS ({users.length})
            </h2>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-neon-cyan/40 text-center py-8 font-rajdhani">No users found</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-cyber-dark/50 border border-neon-cyan/20 hover:border-neon-cyan/40 transition-colors"
                  >
                    <div>
                      <p className="font-cyber text-neon-cyan">{user.username}</p>
                      <p className="text-xs text-neon-cyan/40 font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
