import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './useSneakers';
import { safeLocalStorage } from '../lib/utils';

export interface UserProfile {
  id: string;
  email: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    username?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMockAuthChange = () => {
      const savedMock = safeLocalStorage.getItem('sneakers_mock_user');
      if (savedMock) {
        setUser(JSON.parse(savedMock));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    window.addEventListener('mock-auth-change', handleMockAuthChange);

    // Check if there is a local mock/guest user first
    const savedMock = safeLocalStorage.getItem('sneakers_mock_user');
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
        safeLocalStorage.removeItem('sneakers_mock_user');
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
    }).catch(err => {
      console.warn('Failed to fetch session from Supabase:', err);
      // Fallback to mock session if any exists
      const savedMock = safeLocalStorage.getItem('sneakers_mock_user');
      if (savedMock) {
        setUser(JSON.parse(savedMock));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
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
      subscription = data?.subscription || null;
    } catch (err) {
      console.warn('Failed to subscribe to auth state changes:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      window.removeEventListener('mock-auth-change', handleMockAuthChange);
    };
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    setError(null);
    setLoading(true);

    const cleanUsername = (username || email.split('@')[0]).trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      // Simulate SignUp in local sandbox
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: UserProfile = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        email: cleanEmail,
        user_metadata: {
          username: cleanUsername,
          full_name: cleanUsername,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
        },
      };

      // Save to mock registered users list for multi-account testing
      try {
        const rawList = safeLocalStorage.getItem('sneakers_mock_registered_users');
        const list = rawList ? JSON.parse(rawList) : [];
        list.push({ ...mockUser, password });
        safeLocalStorage.setItem('sneakers_mock_registered_users', JSON.stringify(list));
      } catch {
        // ignore local storage error
      }

      safeLocalStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      setUser(mockUser);
      setLoading(false);
      return { success: true, user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: cleanUsername,
          },
        },
      });

      if (error) throw error;

      // Also upsert into profiles table if available
      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            email: cleanEmail,
          });
        } catch {
          // Non-blocking if profiles table not created yet
        }
      }

      return { success: true, user: data.user };
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Sign up error:', e);
      setError(e.message || 'Failed to sign up.');
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const signIn = async (identifier: string, password: string) => {
    setError(null);
    setLoading(true);
    const cleanId = (identifier || '').trim();

    if (!isSupabaseConfigured) {
      // Simulate SignIn in local sandbox
      await new Promise(resolve => setTimeout(resolve, 800));

      // Try looking up in mock registered accounts
      let matchedMock: UserProfile | null = null;
      try {
        const rawList = safeLocalStorage.getItem('sneakers_mock_registered_users');
        const list = rawList ? JSON.parse(rawList) : [];
        const found = list.find((u: { username?: string; email?: string; user_metadata?: { username?: string } }) =>
          (u.username && u.username.toLowerCase() === cleanId.toLowerCase()) ||
          (u.user_metadata?.username && u.user_metadata.username.toLowerCase() === cleanId.toLowerCase()) ||
          (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
        );
        if (found) {
          matchedMock = {
            id: found.id,
            email: found.email,
            user_metadata: found.user_metadata,
          };
        }
      } catch {
        // ignore
      }

      const mockUser: UserProfile = matchedMock || {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@example.com`,
        user_metadata: {
          username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
          full_name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanId)}`,
        },
      };

      safeLocalStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      setUser(mockUser);
      setLoading(false);
      return { success: true, user: mockUser };
    }

    try {
      let targetEmail = cleanId;

      // If user entered a username instead of an email (no '@'), look up their email
      if (!cleanId.includes('@')) {
        let foundEmail = false;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .ilike('username', cleanId)
            .maybeSingle();

          if (profile?.email) {
            targetEmail = profile.email;
            foundEmail = true;
          }
        } catch {
          // If profile table lookup fails, proceed to fallback attempt
        }

        if (!foundEmail && !targetEmail.includes('@')) {
          // If it's not a valid email format and username was not found in profiles
          setError(`No account found matching username "${cleanId}". If you are new here, please create an account.`);
          setLoading(false);
          return { success: false, error: `No account found matching username "${cleanId}".` };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) throw error;
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const e = err as Error;
      const msg = e.message?.toLowerCase().includes('invalid login credentials')
        ? 'Invalid username/email or password.'
        : e.message || 'Invalid login credentials.';
      console.error('Sign in error:', msg);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
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
      safeLocalStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
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
    safeLocalStorage.setItem('sneakers_mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('mock-auth-change'));
    setUser(mockUser);
    setLoading(false);
    return { success: true, user: mockUser };
  };

  const signOut = async () => {
    setLoading(true);
    safeLocalStorage.removeItem('sneakers_mock_user');
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

  const updateProfile = async ({ username, avatarUrl }: { username?: string; avatarUrl?: string }) => {
    setError(null);
    if (!user) {
      return { success: false, error: 'No user signed in.' };
    }

    const trimmedUsername = username !== undefined ? username.trim() : (user.user_metadata?.username || '');
    if (username !== undefined && !trimmedUsername) {
      return { success: false, error: 'Username cannot be empty.' };
    }

    const currentAvatar = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;
    const newAvatar = avatarUrl !== undefined
      ? avatarUrl.trim()
      : currentAvatar;

    const updatedMetadata = {
      ...user.user_metadata,
      username: trimmedUsername || user.user_metadata?.username || user.email.split('@')[0],
      full_name: trimmedUsername || user.user_metadata?.full_name || user.email.split('@')[0],
      avatar_url: newAvatar,
    };

    if (!isSupabaseConfigured || user.id === 'guest-user-bypass' || user.id.includes('mock')) {
      const updatedUser: UserProfile = {
        ...user,
        user_metadata: updatedMetadata,
      };
      safeLocalStorage.setItem('sneakers_mock_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (error) throw error;

      const updatedUser: UserProfile = {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata,
      };
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Update profile error:', e);
      return { success: false, error: e.message || 'Failed to update profile.' };
    }
  };

  const updateUsername = async (newUsername: string) => {
    return updateProfile({ username: newUsername });
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
    updateUsername,
    updateProfile,
  };
}
