import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@devbooks/ui';
import { Input } from '@devbooks/ui';
import { Label } from '@devbooks/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@devbooks/ui';
import { useToast } from '../hooks/use-toast';
import { Users, Mail, Lock, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);

    toast({
      title: 'Welcome back!',
      description: 'You have been logged in successfully.',
    });
    navigate('/dashboard');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);

    toast({
      title: 'Check your email',
      description: "We've sent you a password reset link.",
    });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="shadow-card w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="from-primary to-accent shadow-glow mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br">
            <Users className="text-primary-foreground h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-foreground text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {mode === 'login'
                ? 'Sign in to access your TeamFlow dashboard'
                : 'Enter your email to receive a reset link'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="gradient"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="gradient"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
