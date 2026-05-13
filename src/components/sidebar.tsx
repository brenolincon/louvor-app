"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Music,
  Users,
  ClipboardCheck,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/escalas", label: "Escalas", icon: CalendarDays },
  { href: "/repertorios", label: "Repertórios", icon: Music },
  { href: "/membros", label: "Membros", icon: Users },
  { href: "/confirmacoes", label: "Confirmações", icon: ClipboardCheck },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-zinc-800 bg-zinc-950 p-5 lg:block">
      <div className="mb-10">
        <div className="text-xl font-bold text-white">Louvor App</div>
        <div className="text-sm text-zinc-500">Gestão ministerial</div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}