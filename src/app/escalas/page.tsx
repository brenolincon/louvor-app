"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function EscalasPage() {
  const [sundayDate, setSundayDate] = useState("");
  const [vocalGroup, setVocalGroup] = useState("");
  const [loading, setLoading] = useState(false);

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

    alert("Semana criada com sucesso!");
    setSundayDate("");
    setVocalGroup("");
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
            O sistema gera automaticamente o ensaio, domingo e quarta.
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

        <Card>
          <h2 className="text-xl font-semibold">Como funciona</h2>

          <div className="mt-6 space-y-4 text-sm text-zinc-400">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <strong className="text-white">Ensaio</strong>
              <p>Sexta-feira anterior às 19:30.</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <strong className="text-white">Domingo</strong>
              <p>Culto principal às 19:00.</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <strong className="text-white">Quarta</strong>
              <p>Culto de quarta às 19:30.</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}