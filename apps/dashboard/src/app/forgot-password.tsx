import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
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
import { Users, Mail, ArrowLeft } from 'lucide-react';

type ForgotPasswordFormData = {
  email: string;
};

const forgotPasswordSchema = yup
  .object({
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
  })
  .required();

const ForgotPassword = () => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

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
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter your email to receive a reset link
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

            <Button
              type="submit"
              className="w-full"
              variant="gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
