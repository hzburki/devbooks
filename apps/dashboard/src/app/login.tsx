import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
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
import { useToast } from '@devbooks/hooks';
import { Users, Mail, Lock } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
};

const loginSchema = yup
  .object({
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
  })
  .required();

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Welcome back!',
      description: 'You have been logged in successfully.',
    });
    navigate('/dashboard');
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sign in to access your TeamFlow dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
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
                  className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                  autoComplete="current-password"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary/80 text-sm transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
