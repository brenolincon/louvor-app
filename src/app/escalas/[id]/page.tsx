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

type Profile = {
  id: string;
  full_name: string;
  instrument: string | null;
  status: string;
  member_type: string | null;
};

type InstrumentAssignment = {
  id: string;
  week_id: string;
  member_id: string;
  instrument: string;
  status: string;
  profiles:
    | {
        full_name: string;
      }[]
    | null;
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

  const [instrumentalists, setInstrumentalists] = useState<Profile[]>([]);

  const [instrumentAssignments, setInstrumentAssignments] = useState<
    InstrumentAssignment[]
  >([]);

  const [selectedInstrument, setSelectedInstrument] = useState("");

  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [savingInstrument, setSavingInstrument] = useState(false);

  function formatDateBR(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  }

  async function loadInstrumentalists() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, instrument, status, member_type")
      .eq("member_type", "instrumentalist")
      .eq("status", "approved")
      .order("full_name", {
        ascending: true,
      });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }

  async function loadInstrumentAssignments() {
    const { data, error } = await supabase
      .from("week_instrument_assignments")
      .select(
        `
        id,
        week_id,
        member_id,
        instrument,
        status,
        profiles (
          full_name
        )
      `,
      )
      .eq("week_id", weekId)
      .order("instrument", {
        ascending: true,
      });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }

  async function saveInstrumentAssignment(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedInstrument || !selectedMemberId) {
      alert("Selecione instrumento e músico.");
      return;
    }

    setSavingInstrument(true);

    const { error } = await supabase.from("week_instrument_assignments").upsert(
      {
        week_id: weekId,
        instrument: selectedInstrument,
        member_id: selectedMemberId,
        status: "pending",
      },
      {
        onConflict: "week_id,instrument",
      },
    );

    setSavingInstrument(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedInstrument("");
    setSelectedMemberId("");

    const updatedAssignments = await loadInstrumentAssignments();

    setInstrumentAssignments(updatedAssignments);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadWeekData() {
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

      const { data: instrumentalistsData, error: instrumentalistsError } =
        await supabase
          .from("profiles")
          .select("id, full_name, instrument, status, member_type")
          .eq("member_type", "instrumentalist")
          .eq("status", "approved")
          .order("full_name", {
            ascending: true,
          });

      if (!isMounted) return;

      if (instrumentalistsError) {
        alert(instrumentalistsError.message);
        setLoading(false);
        return;
      }

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("week_instrument_assignments")
        .select(
          `
          id,
          week_id,
          member_id,
          instrument,
          status,
          profiles (
            full_name
          )
        `,
        )
        .eq("week_id", weekId)
        .order("instrument", {
          ascending: true,
        });

      if (!isMounted) return;

      if (assignmentsError) {
        alert(assignmentsError.message);
        setLoading(false);
        return;
      }

      setWeek(data);

      setInstrumentalists(instrumentalistsData || []);

      setInstrumentAssignments(assignmentsData || []);

      setLoading(false);
    }

    if (weekId) {
      loadWeekData();
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
            Grupo vocal responsável: {vocalGroupLabels[week.vocal_group]}
          </p>
        </div>

        <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          {statusLabels[week.status]}
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

          <form onSubmit={saveInstrumentAssignment} className="space-y-3">
            <select
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value)}
              required
            >
              <option value="">Instrumento</option>

              {[...new Set(instrumentalists.map((member) => member.instrument))]
                .filter(Boolean)
                .map((instrument) => (
                  <option key={instrument} value={instrument || ""}>
                    {instrument}
                  </option>
                ))}
            </select>

            <select
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              required
            >
              <option value="">Músico</option>

              {instrumentalists
                .filter((member) =>
                  selectedInstrument
                    ? member.instrument === selectedInstrument
                    : true,
                )
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
            </select>

            <button
              disabled={savingInstrument}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {savingInstrument ? "Salvando..." : "Salvar instrumentista"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {instrumentAssignments.length === 0 && (
              <p className="text-sm text-zinc-500">
                Nenhum instrumentista definido ainda.
              </p>
            )}

            {instrumentAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div>
                  <p className="font-medium">{assignment.instrument}</p>

                  <p className="text-sm text-zinc-400">
                    {assignment.profiles?.[0]?.full_name}
                  </p>
                </div>

                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  {assignment.status}
                </span>
              </div>
            ))}
          </div>
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
