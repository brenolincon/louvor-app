import { Sidebar } from "@/components/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        <Sidebar />

        <main className="min-h-screen flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}