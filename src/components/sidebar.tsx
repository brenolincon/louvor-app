"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Music,
  Users,
  ClipboardCheck,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

type SystemSettings = {
  ministry_name: string;
  church_name: string;
};

type SidebarProps = {
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
};

export function Sidebar({
  open = false,
  collapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [isGeneralLeader, setIsGeneralLeader] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const permissions = await getCurrentUserPermissions();

      if (!mounted) return;

      setIsGeneralLeader(permissions?.isGeneralLeader === true);

      const { data } = await supabase
        .from("system_settings")
        .select("ministry_name, church_name")
        .eq("id", 1)
        .single();

      if (!mounted) return;

      setSettings(data);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/escalas", label: "Escalas", icon: CalendarDays },
    { href: "/repertorios", label: "Repertórios", icon: Music },
    { href: "/membros", label: "Membros", icon: Users },
    { href: "/confirmacoes", label: "Confirmações", icon: ClipboardCheck },
    { href: "/perfil", label: "Meu Perfil", icon: User },
    ...(isGeneralLeader
      ? [{ href: "/configuracoes", label: "Configurações", icon: Settings }]
      : []),
  ];

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-zinc-800 bg-zinc-950 p-5 transition-all duration-300 lg:static lg:translate-x-0",
          collapsed ? "lg:w-24" : "lg:w-72",
          open ? "w-72 translate-x-0" : "w-72 -translate-x-full",
        )}
      >
        <div className="mb-10 flex items-start justify-between">
          {!collapsed && (
            <div>
              <div className="text-xl font-bold text-white">
                {settings?.ministry_name || "Louvor App"}
              </div>

              <div className="text-sm text-zinc-500">
                {settings?.church_name || "Gestão ministerial"}
              </div>
            </div>
          )}

          {collapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">
              L
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white lg:block"
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                  active
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
