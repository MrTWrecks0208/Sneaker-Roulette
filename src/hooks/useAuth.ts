import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './useSneakers';

export interface UserProfile {
  id: string;
  email: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMockAuthChange = () => {
      const savedMock = localStorage.getItem('sneakers_mock_user');
      if (savedMock) {
        setUser(JSON.parse(savedMock));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    window.addEventListener('mock-auth-change', handleMockAuthChange);

    // Check if there is a local mock/guest user first
    const savedMock = localStorage.getItem('sneakers_mock_user');
    if (savedMock) {
      const parsed = JSON.parse(savedMock);
      if (parsed.id === 'guest-user-bypass' || !isSupabaseConfigured) {
        setUser(parsed);
        setLoading(false);
        return () => {
          window.removeEventListener('mock-auth-change', handleMockAuthChange);
        };
      } else {
        // Clear mock user that is not a guest bypass if Supabase is configured
        localStorage.removeItem('sneakers_mock_user');
      }
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return () => {
        window.removeEventListener('mock-auth-change', handleMockAuthChange);
      };
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('mock-auth-change', handleMockAuthChange);
    };
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Simulate SignUp
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: UserProfile = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        email,
        user_metadata: {
          username: username || email.split('@')[0],
          full_name: username || email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || email)}`,
        },
      };
      localStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      setUser(mockUser);
      setLoading(false);
      return { success: true, user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username,
          },
        },
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Sign up error:', e);
      setError(e.message || 'Failed to sign up.');
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Simulate SignIn
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: UserProfile = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        email,
        user_metadata: {
          full_name: email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        },
      };
      localStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      setUser(mockUser);
      setLoading(false);
      return { success: true, user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Sign in error:', e);
      setError(e.message || 'Invalid login credentials.');
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const signInWithGoogle = async () => {
    setError(null);

    if (!isSupabaseConfigured) {
      // Simulate Google SSO
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser: UserProfile = {
        id: 'google-sso-mock-user-123',
        email: 'sneakerhead.google@example.com',
        user_metadata: {
          full_name: 'Google Sneakerhead',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        },
      };
      localStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      setUser(mockUser);
      setLoading(false);
      return { success: true, user: mockUser };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Google SSO error:', e);
      setError(e.message || 'Failed to authenticate with Google.');
      return { success: false, error: e.message };
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const mockUser: UserProfile = {
      id: 'guest-user-bypass',
      email: 'guest.collector@sneakerwheel.com',
      user_metadata: {
        full_name: 'Guest Collector',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=guest-collector`,
      },
    };
    localStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('mock-auth-change'));
    setUser(mockUser);
    setLoading(false);
    return { success: true, user: mockUser };
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('sneakers_mock_user');
    window.dispatchEvent(new Event('mock-auth-change'));
    
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    signOut,
  };
}
