"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Music, Users, Mic2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

type MinistryWeek = {
  id: string;
  sunday_date: string;
  wednesday_date: string;
  rehearsal_date: string;
  rehearsal_time: string;
  sunday_time: string;
  wednesday_time: string;
  vocal_group: string;
  status: string;
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  building: "Montando",
  waiting_repertoire: "Aguardando repertório",
  waiting_approval: "Aguardando aprovação",
  published: "Publicada",
};

export default function WeekDetailsPage() {
  const params = useParams();
  const weekId = params.id as string;

  const [week, setWeek] = useState<MinistryWeek | null>(null);
  const [loading, setLoading] = useState(true);

  function formatDateBR(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  }

  useEffect(() => {
    let isMounted = true;

    async function loadWeek() {
      setLoading(true);

      const { data, error } = await supabase
        .from("ministry_weeks")
        .select("*")
        .eq("id", weekId)
        .single();

      if (!isMounted) return;

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setWeek(data);
      setLoading(false);
    }

    if (weekId) {
      loadWeek();
    }

    return () => {
      isMounted = false;
    };
  }, [weekId]);

  if (loading) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Carregando semana...</p>
      </AppLayout>
    );
  }

  if (!week) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Semana não encontrada.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
            <CalendarDays size={24} />
          </div>

          <h1 className="text-3xl font-bold">
            Semana {formatDateBR(week.sunday_date)} a{" "}
            {formatDateBR(week.wednesday_date)}
          </h1>

          <p className="mt-2 text-zinc-400">
            Grupo vocal responsável:{" "}
            {vocalGroupLabels[week.vocal_group] || week.vocal_group}
          </p>
        </div>

        <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          {statusLabels[week.status] || week.status}
        </span>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Ensaio</p>
          <h2 className="mt-2 text-xl font-semibold">
            {formatDateBR(week.rehearsal_date)}
          </h2>
          <p className="text-zinc-400">{week.rehearsal_time}</p>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Culto domingo</p>
          <h2 className="mt-2 text-xl font-semibold">
            {formatDateBR(week.sunday_date)}
          </h2>
          <p className="text-zinc-400">{week.sunday_time}</p>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Culto quarta</p>
          <h2 className="mt-2 text-xl font-semibold">
            {formatDateBR(week.wednesday_date)}
          </h2>
          <p className="text-zinc-400">{week.wednesday_time}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Users className="text-violet-400" size={22} />
            <h2 className="text-xl font-semibold">Instrumentistas</h2>
          </div>

          <p className="text-zinc-400">
            Em breve você poderá definir os músicos da semana.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Mic2 className="text-violet-400" size={22} />
            <h2 className="text-xl font-semibold">Vozes</h2>
          </div>

          <p className="text-zinc-400">
            Em breve você poderá definir ministro e backs.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Music className="text-violet-400" size={22} />
            <h2 className="text-xl font-semibold">Repertório</h2>
          </div>

          <p className="text-zinc-400">
            Em breve o ministro poderá enviar o repertório.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <CalendarDays className="text-violet-400" size={22} />
            <h2 className="text-xl font-semibold">Confirmações</h2>
          </div>

          <p className="text-zinc-400">
            Em breve os integrantes confirmarão presença.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
