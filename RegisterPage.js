import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { toast } from 'sonner';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #DBEAFE 100%)' }}>
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-heading font-bold text-3xl mx-auto mb-4">
            F
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Join Findhub</h1>
          <p className="text-muted">Start your personalized learning experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="register-name-input"
              className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="register-email-input"
              className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="register-password-input"
              className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            data-testid="register-submit-button"
            className="w-full bg-primary text-white rounded-full h-12 font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Already have an account?{' '}
            <Link to="/login" data-testid="register-login-link" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};