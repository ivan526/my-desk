"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser, loading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-600"></div>
          <p className="text-sm text-ink-tertiary">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
