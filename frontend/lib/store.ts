import { create } from 'zustand';
import { supabase, Profile } from '@/lib/supabase';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('无法获取用户资料');
      }

      set({ user: profile, loading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },

  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        set({ user: null, loading: false });
      } else {
        set({ user: profile, loading: false });
      }
    } else {
      set({ user: null, loading: false });
    }
  },
}));
