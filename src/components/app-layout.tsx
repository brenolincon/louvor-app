"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />

        <div className="min-h-screen flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-300"
            >
              <Menu size={22} />
            </button>

            <div className="ml-3">
              <p className="font-semibold">Louvor App</p>
              <p className="text-xs text-zinc-500">Gestão ministerial</p>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
