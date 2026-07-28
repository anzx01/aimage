'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 监听 auth 状态变化（OAuth 回调、token 刷新等）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().setUser(null);
        }
      }
    );

    // 初始加载时也检查一次
    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  return <>{children}</>;
}
