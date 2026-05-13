"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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

const statusLabels: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
  inactive: "Inativo",
  training: "Em treinamento",
};

const memberTypeLabels: Record<string, string> = {
  vocalist: "Vocal",
  instrumentalist: "Instrumentista",
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

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

      if (!isMounted) return;

      setProfile(profileData);
      setLoading(false);
    }

    loadUser();

    return () => {
      isMounted = false;
    };
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

  const displayType = profile?.member_type
    ? memberTypeLabels[profile.member_type] || profile.member_type
    : "-";

  const displayGroupOrInstrument = profile?.vocal_group
    ? vocalGroupLabels[profile.vocal_group] || profile.vocal_group
    : profile?.instrument || "-";

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-zinc-400">Bem-vindo, {profile?.full_name}</p>
        </div>

        <Button
          variant="danger"
          onClick={handleLogout}
          className="w-full sm:w-auto"
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut size={18} />
            Sair
          </span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Status ministerial</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            {profile?.status
              ? statusLabels[profile.status] || profile.status
              : "-"}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Tipo de integrante</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">{displayType}</h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Grupo / Instrumento</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            {displayGroupOrInstrument}
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
