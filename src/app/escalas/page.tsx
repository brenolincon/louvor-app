"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
  created_at: string;
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

export default function EscalasPage() {
  const [sundayDate, setSundayDate] = useState("");
  const [vocalGroup, setVocalGroup] = useState("");
  const [weeks, setWeeks] = useState<MinistryWeek[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(true);

  function formatDateBR(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  }

  async function fetchWeeks() {
    const { data, error } = await supabase
      .from("ministry_weeks")
      .select("*")
      .order("sunday_date", { ascending: false });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialWeeks() {
      setLoadingWeeks(true);

      const data = await fetchWeeks();

      if (!isMounted) return;

      setWeeks(data);
      setLoadingWeeks(false);
    }

    loadInitialWeeks();

    return () => {
      isMounted = false;
    };
  }, []);

  async function createWeek(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const sunday = new Date(sundayDate);

    const rehearsal = new Date(sunday);
    rehearsal.setDate(sunday.getDate() - 2);

    const wednesday = new Date(sunday);
    wednesday.setDate(sunday.getDate() + 3);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    const { error } = await supabase.from("ministry_weeks").insert({
      sunday_date: formatDate(sunday),
      wednesday_date: formatDate(wednesday),
      rehearsal_date: formatDate(rehearsal),
      vocal_group: vocalGroup,
      created_by: user?.id,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSundayDate("");
    setVocalGroup("");

    const updatedWeeks = await fetchWeeks();
    setWeeks(updatedWeeks);
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <CalendarDays size={24} />
        </div>

        <h1 className="text-3xl font-bold">Escalas</h1>
        <p className="mt-2 text-zinc-400">
          Crie semanas ministeriais e organize cultos, ensaios e equipes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <h2 className="text-xl font-semibold">Criar semana ministerial</h2>
          <p className="mt-1 text-sm text-zinc-400">
            O sistema gera automaticamente ensaio, domingo e quarta.
          </p>

          <form onSubmit={createWeek} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Domingo da semana
              </label>

              <Input
                type="date"
                value={sundayDate}
                onChange={(e) => setSundayDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Grupo vocal responsável
              </label>

              <Select
                value={vocalGroup}
                onChange={(e) => setVocalGroup(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="unit">Unit</option>
                <option value="ative">Ative</option>
                <option value="teens">Geração Teens</option>
              </Select>
            </div>

            <Button disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar semana"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Semanas criadas</h2>

          {loadingWeeks && (
            <Card>
              <p className="text-zinc-400">Carregando semanas...</p>
            </Card>
          )}

          {!loadingWeeks && weeks.length === 0 && (
            <Card>
              <p className="text-zinc-400">
                Nenhuma semana ministerial criada ainda.
              </p>
            </Card>
          )}

          {!loadingWeeks &&
            weeks.map((week) => (
              <Card key={week.id} className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Semana {formatDateBR(week.sunday_date)} a{" "}
                      {formatDateBR(week.wednesday_date)}
                    </h3>

                    <p className="text-sm text-zinc-400">
                      Grupo vocal:{" "}
                      {vocalGroupLabels[week.vocal_group] || week.vocal_group}
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                    {statusLabels[week.status] || week.status}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Ensaio</p>
                    <p className="mt-1 font-medium">
                      {formatDateBR(week.rehearsal_date)}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {week.rehearsal_time}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Domingo</p>
                    <p className="mt-1 font-medium">
                      {formatDateBR(week.sunday_date)}
                    </p>
                    <p className="text-sm text-zinc-400">{week.sunday_time}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Quarta</p>
                    <p className="mt-1 font-medium">
                      {formatDateBR(week.wednesday_date)}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {week.wednesday_time}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/escalas/${week.id}`}
                  className="inline-flex rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
                >
                  Abrir semana
                </Link>
              </Card>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
