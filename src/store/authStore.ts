import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Pick<User, 'name' | 'avatar' | 'bio'>>) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          set({
            user: { id: profile.id, email: session.user.email!, name: profile.name, avatar: profile.avatar_url, bio: profile.bio, createdAt: profile.created_at },
            isAuthenticated: true,
          });
        }
      }
    } catch {
      // network error — treat as unauthenticated
    } finally {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          set({
            user: { id: profile.id, email: session.user.email!, name: profile.name, avatar: profile.avatar_url, bio: profile.bio, createdAt: profile.created_at },
            isAuthenticated: true,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false });
      }
    });
  },

  signUp: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  verifyOtp: async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    return { error: error?.message ?? null };
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return { error: 'Not authenticated' };

    const updates: Record<string, any> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.bio !== undefined) updates.bio = data.bio;

    // Upload avatar to Supabase Storage if a local URI is provided
    if (data.avatar !== undefined) {
      if (data.avatar && (data.avatar.startsWith('file://') || data.avatar.startsWith('content://'))) {
        try {
          const res = await fetch(data.avatar);
          const arrayBuffer = await res.arrayBuffer();
          const ext = data.avatar.split('.').pop()?.toLowerCase().split('?')[0] ?? 'jpg';
          const path = `${user.id}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, arrayBuffer, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            updates.avatar_url = urlData.publicUrl;
            data = { ...data, avatar: urlData.publicUrl };
          }
        } catch {
          // Storage not configured — skip avatar upload
        }
      } else {
        updates.avatar_url = data.avatar;
      }
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) {
      set({ user: { ...user, ...data } });
    }
    return { error: error?.message ?? null };
  },
}));
