import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import { useToast } from '@devbooks/hooks';
import { Loader2 } from '@devbooks/ui';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions (e.g., from React StrictMode)
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      hasProcessed.current = true;

      try {
        // Wait a moment for Supabase to process the URL hash
        // Supabase automatically creates a new user if they don't exist
        // or signs in if they do exist
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Handle the OAuth callback
        const { user } = await authService.handleAuthCallback();

        if (user) {
          toast({
            variant: 'success',
            title: 'Welcome!',
            description: 'You have been successfully signed in.',
          });

          // Clear URL hash to prevent re-processing
          window.history.replaceState(null, '', window.location.pathname);

          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred during authentication';
        setError(errorMessage);

        toast({
          variant: 'error',
          title: 'Authentication Failed',
          description: errorMessage,
        });

        // Clear URL hash
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Authentication Failed
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
