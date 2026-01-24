import { supabase } from '../lib/supabase/client';

const ALLOWED_DOMAIN = 'ideamappers.com';

export const authService = {
  /**
   * Sign in or sign up with Google OAuth
   * Automatically handles both sign-in and sign-up
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: ALLOWED_DOMAIN, // Restrict to ideamappers.com domain
        },
      },
    });

    if (error) {
      throw new Error(`Failed to initiate Google sign-in: ${error.message}`);
    }

    return data;
  },

  /**
   * Handle OAuth callback and validate domain
   */
  async handleAuthCallback() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }

    if (!data.session) {
      throw new Error('No session found');
    }

    const user = data.session.user;
    const email = user.email;

    // Validate domain
    if (!email || !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      // Sign out if domain doesn't match
      await supabase.auth.signOut();
      throw new Error(
        `Access denied. Only @${ALLOWED_DOMAIN} email addresses are allowed.`
      );
    }

    return {
      user,
      session: data.session,
    };
  },

  /**
   * Get current user session
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return user;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return session;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  },
};
