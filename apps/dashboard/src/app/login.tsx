import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Users,
  Loader2,
} from '@devbooks/ui';
import { Button } from '@devbooks/ui';
import { useToast } from '@devbooks/hooks';
import { GoogleLogo } from '../assets';

const ALLOWED_DOMAIN = 'ideamappers.com';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // TODO: Integrate with Supabase Google OAuth
      // This is a placeholder for the Google Sign-In flow
      // When Supabase is integrated, replace this with actual OAuth flow

      // Simulate Google OAuth callback
      // In production, this will be handled by Supabase's signInWithOAuth
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user email - replace with actual user email from OAuth response
      const mockUserEmail = 'user@ideamappers.com';

      // Validate domain
      if (!mockUserEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
        toast({
          variant: 'error',
          title: 'Access Denied',
          description: `Only @${ALLOWED_DOMAIN} email addresses are allowed to sign in.`,
        });
        setIsLoading(false);
        return;
      }

      toast({
        variant: 'success',
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });

      navigate('/dashboard');
    } catch {
      toast({
        variant: 'error',
        title: 'Sign In Failed',
        description: 'An error occurred while signing in. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Sign in with your @{ALLOWED_DOMAIN} account to access your
              DevBooks dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            variant="secondary"
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <img src={GoogleLogo} alt="Google Logo" className="h-5 w-5" />
                Sign in with Google
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Only @{ALLOWED_DOMAIN} email addresses are authorized to access this
            application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
