"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/store";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { setUser, user } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    const { data, error: apiError } = await fetchAPI<{ id: string; username: string; role: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, rememberMe }),
    });
    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    if (data) {
      setUser({
        id: data.id,
        username: data.username,
        role: data.role as "USER" | "ADMIN",
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ink-primary mb-2">工作成果管理台</h1>
          <p className="text-sm text-ink-tertiary">登录后开始记录你的工作</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="密码"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-moss-600 rounded border-gray-300 focus:ring-moss-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-ink-secondary">
              记住我（7天免登录）
            </label>
          </div>

          {error && (
            <p className="text-sm text-coral-600 bg-coral-50 p-2 rounded">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        <p className="text-center text-xs text-ink-hint mt-6">
          请联系管理员创建账号
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moss-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
