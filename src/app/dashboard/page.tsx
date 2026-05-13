"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  full_name: string;
  status: string;
  member_type: string | null;
  vocal_group: string | null;
  instrument: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Carregando...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400">Bem-vindo, {profile?.full_name}</p>
        </div>

        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Status ministerial</p>
          <h2 className="mt-2 text-2xl font-bold">{profile?.status}</h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Tipo</p>
          <h2 className="mt-2 text-2xl font-bold">{profile?.member_type}</h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Grupo / Instrumento</p>
          <h2 className="mt-2 text-2xl font-bold">
            {profile?.vocal_group || profile?.instrument || "-"}
          </h2>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Próxima escala</h2>
          <p className="mt-2 text-zinc-400">Nenhuma escala publicada ainda.</p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Confirmações</h2>
          <p className="mt-2 text-zinc-400">
            Você não possui confirmações pendentes.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
