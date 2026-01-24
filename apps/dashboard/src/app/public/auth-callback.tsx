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
          err instanceof Error
            ? err.message
            : 'An error occurred during authentication';
        setError(errorMessage);

        toast({
          variant: 'error',
          title: 'Authentication Failed',
          description: errorMessage,
        });

        // Clear URL hash
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect to login after a short delay for the user to read the error message.
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
          <h1 className="mb-2 text-2xl font-bold text-destructive">
            Authentication Failed
          </h1>
          <p className="mb-4 text-muted-foreground">{error}</p>
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
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
