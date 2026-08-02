"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { AuthProvider } from "./AuthProvider";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on login page or admin pages (they have their own layout)
  const hideSidebar = pathname === "/login" || pathname.startsWith("/admin");

  if (hideSidebar) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-bg-primary">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
