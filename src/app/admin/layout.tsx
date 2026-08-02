"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { Loading } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    setAuthorized(true);
  }, [user, loading, router, pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const navItems = [
    { href: "/admin/users", label: "用户管理" },
    { href: "/", label: "返回工作台" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-card border-r border-bg-tertiary p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-ink-primary">管理后台</h1>
          <p className="text-xs text-ink-hint mt-1">仅管理员可访问</p>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-moss-100 text-moss-700 font-medium"
                    : "text-ink-secondary hover:bg-bg-secondary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
