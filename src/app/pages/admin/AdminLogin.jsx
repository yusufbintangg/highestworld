import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

export const AdminLogin = () => {
  const { signIn, admin } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Kalau sudah login, langsung ke dashboard
  React.useEffect(() => {
    if (admin) navigate('/admin');
  }, [admin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (error) {
      toast.error('Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest mb-1">HIGHEST WORLD</h1>
          <p className="text-muted-foreground text-sm">Admin Panel</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Login Admin</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="admin@highestworld.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};