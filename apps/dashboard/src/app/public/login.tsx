import { useState, useEffect } from 'react';
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
import { GoogleLogo } from '../../assets';
import { authService } from '../../services';

const ALLOWED_DOMAIN = 'ideamappers.com';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          // User is already logged in, redirect to dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // No session, user needs to log in
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Initiate Google OAuth flow
      // Supabase will automatically:
      // - Sign in if user exists
      // - Sign up if user doesn't exist
      await authService.signInWithGoogle();

      // User will be redirected to Google, then back to /auth/callback
      // No need to handle the response here as the callback page will handle it
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while signing in. Please try again.';

      toast({
        variant: 'error',
        title: 'Sign In Failed',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
