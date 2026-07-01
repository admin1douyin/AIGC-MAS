import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

export interface Subscription {
  id?: string;
  profileId?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  usedCredits: number;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const authApi = {
  // Get current user profile from our database
  getProfile: async (): Promise<{ success: boolean; data?: AuthUser; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get user subscription info
  getSubscription: async (): Promise<{ success: boolean; data?: Subscription; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/subscription', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<AuthUser>): Promise<{ success: boolean; data?: AuthUser; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data.user };
  },

  // Sign up new user
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Create profile in our database
    if (data.user) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          name
        })
      });
    }
    
    return { success: true, data: data.user };
  },

  // Sign out
  signOut: async () => {
    await supabase.auth.signOut();
    return { success: true };
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};
