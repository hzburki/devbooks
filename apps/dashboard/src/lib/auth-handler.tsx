import { useNavigate } from 'react-router-dom';
import { useToast } from '@devbooks/hooks';
import { authService } from '../services';

/**
 * Hook to get the sign out handler
 * This can be used in components that need to sign out users
 */
export function useSignOut() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast({
        variant: 'success',
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/login', { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while signing out. Please try again.';
      toast({
        variant: 'error',
        title: 'Sign Out Failed',
        description: errorMessage,
      });
      throw error;
    }
  };

  return handleSignOut;
}
