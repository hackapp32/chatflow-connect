import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Zap, User, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('verify_password', {
        p_username: username.trim(),
        p_password: password
      });

      if (error) throw error;

      if (data) {
        localStorage.setItem('app_user_id', data);
        localStorage.setItem('app_username', username.trim());
        toast.success('Welcome back, ' + username + '!');
        navigate('/');
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-pink/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-soft" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-cyber neon-border mb-4">
            <Zap className="w-10 h-10 text-neon-cyan animate-flicker" />
          </div>
          <h1 className="font-cyber text-4xl neon-text tracking-wider">TECH BOY</h1>
          <p className="text-neon-cyan/60 mt-2 font-rajdhani">Enter the cyber realm</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="glass-cyber neon-border rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-neon-cyan font-rajdhani text-sm uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-cyber-dark/50 border-neon-pink/30 text-neon-cyan placeholder:text-neon-cyan/30 focus:border-neon-pink focus:ring-neon-pink/20 font-rajdhani"
            />
          </div>

          <div className="space-y-2">
            <label className="text-neon-cyan font-rajdhani text-sm uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-cyber-dark/50 border-neon-pink/30 text-neon-cyan placeholder:text-neon-cyan/30 focus:border-neon-pink focus:ring-neon-pink/20 font-rajdhani"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-cyber tracking-wider py-6 neon-border transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,127,0.5)]"
          >
            {loading ? (
              <span className="animate-pulse">CONNECTING...</span>
            ) : (
              'JACK IN'
            )}
          </Button>

          <p className="text-center text-neon-cyan/40 text-sm font-rajdhani">
            Test credentials: techboy / admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
