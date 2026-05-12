import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isLocalFallback, supabase } from "@/lib/supabaseClient";
import { setServiceUserScope } from "@/services/supabaseService";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!supabase || isLocalFallback) {
      setServiceUserScope(null);
      setState({ user: null, isLoading: false, error: null });
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      const user = data.session?.user ?? null;
      setServiceUserScope(user?.id ?? null);
      setState({
        user,
        isLoading: false,
        error: error?.message ?? null,
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setServiceUserScope(user?.id ?? null);
      setState({ user, isLoading: false, error: null });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase || isLocalFallback) {
      setState((prev) => ({
        ...prev,
        error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      }));
      return;
    }

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setServiceUserScope(null);
    if (supabase && !isLocalFallback) {
      await supabase.auth.signOut();
    }
    setState({ user: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signOut,
    isAuthenticated: Boolean(state.user),
  };
}

