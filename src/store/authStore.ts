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
  updateProfile: (data: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profile) {
        set({
          user: { id: profile.id, email: session.user.email!, name: profile.name, avatar: profile.avatar_url, createdAt: profile.created_at },
          isAuthenticated: true,
        });
      }
    }
    set({ isLoading: false });

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          set({
            user: { id: profile.id, email: session.user.email!, name: profile.name, avatar: profile.avatar_url, createdAt: profile.created_at },
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

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name, avatar_url: data.avatar })
      .eq('id', user.id);
    if (!error) {
      set({ user: { ...user, ...data } });
    }
    return { error: error?.message ?? null };
  },
}));
