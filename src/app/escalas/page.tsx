"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

type WeekProfile = {
  full_name: string;
} | null;

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

  week_instrument_assignments?: {
    id: string;
    instrument: string;
    status: string;
    profiles: WeekProfile;
  }[];

  week_vocal_assignments?: {
    id: string;
    role: string;
    service_day: string;
    status: string;
    profiles: WeekProfile;
  }[];
};

type Permissions = Awaited<ReturnType<typeof getCurrentUserPermissions>>;

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

const assignmentStatusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
  justified: "Justificado",
  substituted: "Substituído",
};

const vocalRoleLabels: Record<string, string> = {
  minister: "Ministro",
  backvocal: "Backvocal",
};

const serviceDayLabels: Record<string, string> = {
  sunday: "Domingo",
  wednesday: "Quarta",
};

function parseDate(date?: string) {
  return date ? new Date(date + "T00:00:00") : undefined;
}

function formatDateInput(date?: Date) {
  return date ? date.toISOString().split("T")[0] : "";
}

function formatDateBR(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function EscalasPage() {
  const [sundayDate, setSundayDate] = useState("");
  const [vocalGroup, setVocalGroup] = useState("");
  const [weeks, setWeeks] = useState<MinistryWeek[]>([]);
  const [permissions, setPermissions] = useState<Permissions>(null);

  const [loading, setLoading] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(true);

  async function fetchWeeks() {
    const currentPermissions = await getCurrentUserPermissions();

    if (!currentPermissions) {
      return [];
    }

    setPermissions(currentPermissions);

    if (currentPermissions.isAnyLeader) {
      const { data, error } = await supabase
        .from("ministry_weeks")
        .select(
          `
          *,
          week_instrument_assignments (
            id,
            instrument,
            status,
            profiles (
              full_name
            )
          ),
          week_vocal_assignments (
            id,
            role,
            service_day,
            status,
            profiles (
              full_name
            )
          )
        `,
        )
        .order("sunday_date", { ascending: false });

      if (error) {
        alert(error.message);
        return [];
      }

      return (data || []) as unknown as MinistryWeek[];
    }

    const { data: instrumentWeeks, error: instrumentError } = await supabase
      .from("week_instrument_assignments")
      .select(
        `
        ministry_weeks (
          *,
          week_instrument_assignments (
            id,
            instrument,
            status,
            profiles (
              full_name
            )
          ),
          week_vocal_assignments (
            id,
            role,
            service_day,
            status,
            profiles (
              full_name
            )
          )
        )
      `,
      )
      .eq("member_id", currentPermissions.userId);

    if (instrumentError) {
      alert(instrumentError.message);
      return [];
    }

    const { data: vocalWeeks, error: vocalError } = await supabase
      .from("week_vocal_assignments")
      .select(
        `
        ministry_weeks (
          *,
          week_instrument_assignments (
            id,
            instrument,
            status,
            profiles (
              full_name
            )
          ),
          week_vocal_assignments (
            id,
            role,
            service_day,
            status,
            profiles (
              full_name
            )
          )
        )
      `,
      )
      .eq("member_id", currentPermissions.userId);

    if (vocalError) {
      alert(vocalError.message);
      return [];
    }

    const memberWeeks = [
      ...(instrumentWeeks || []).map((item) => item.ministry_weeks),
      ...(vocalWeeks || []).map((item) => item.ministry_weeks),
    ].filter(Boolean) as unknown as MinistryWeek[];

    return Array.from(
      new Map(memberWeeks.map((week) => [week.id, week])).values(),
    );
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

    if (!permissions?.isGeneralLeader) {
      alert("Apenas o líder geral pode criar semanas.");
      return;
    }

    if (!sundayDate) {
      alert("Selecione o domingo da semana.");
      return;
    }

    setLoading(true);

    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settingsError) {
      setLoading(false);
      alert(settingsError.message);
      return;
    }

    const sunday = new Date(sundayDate);

    const rehearsal = new Date(sunday);

    const rehearsalOffsets: Record<string, number> = {
      monday: -6,
      tuesday: -5,
      wednesday: -4,
      thursday: -3,
      friday: -2,
      saturday: -1,
    };

    const rehearsalOffset =
      rehearsalOffsets[settingsData.rehearsal_weekday] ?? -2;

    rehearsal.setDate(sunday.getDate() + rehearsalOffset);

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

      sunday_time: settingsData.sunday_time,

      wednesday_time: settingsData.wednesday_time,

      rehearsal_time: settingsData.rehearsal_time,

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
          Crie semanas ministeriais e acompanhe escalas do ministério.
        </p>
      </div>

      <div
        className={
          permissions?.isGeneralLeader
            ? "grid gap-6 lg:grid-cols-[420px_1fr]"
            : "grid gap-6"
        }
      >
        {permissions?.isGeneralLeader && (
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

                <DatePicker
                  value={parseDate(sundayDate)}
                  placeholder="Selecione o domingo"
                  onChange={(date) => setSundayDate(formatDateInput(date))}
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
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {permissions?.isAnyLeader ? "Semanas criadas" : "Minhas escalas"}
          </h2>

          {loadingWeeks && (
            <Card>
              <p className="text-zinc-400">Carregando semanas...</p>
            </Card>
          )}

          {!loadingWeeks && weeks.length === 0 && (
            <Card>
              <p className="text-zinc-400">
                {permissions?.isAnyLeader
                  ? "Nenhuma semana ministerial criada ainda."
                  : "Você ainda não possui escalas."}
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

                {!permissions?.isAnyLeader && (
                  <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div>
                      <h4 className="mb-3 font-semibold">Instrumentistas</h4>

                      {week.week_instrument_assignments?.length === 0 && (
                        <p className="text-sm text-zinc-500">
                          Nenhum instrumentista definido.
                        </p>
                      )}

                      <div className="grid gap-2 md:grid-cols-2">
                        {week.week_instrument_assignments?.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                          >
                            <p className="font-medium">
                              {assignment.instrument}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {assignment.profiles?.full_name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {assignmentStatusLabels[assignment.status] ||
                                assignment.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 font-semibold">Vozes</h4>

                      {week.week_vocal_assignments?.length === 0 && (
                        <p className="text-sm text-zinc-500">
                          Nenhuma voz definida.
                        </p>
                      )}

                      <div className="grid gap-2 md:grid-cols-2">
                        {week.week_vocal_assignments?.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                          >
                            <p className="font-medium">
                              {vocalRoleLabels[assignment.role] ||
                                assignment.role}{" "}
                              •{" "}
                              {serviceDayLabels[assignment.service_day] ||
                                assignment.service_day}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {assignment.profiles?.full_name || "-"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {assignmentStatusLabels[assignment.status] ||
                                assignment.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {permissions?.isAnyLeader && (
                  <Link
                    href={`/escalas/${week.id}`}
                    className="inline-flex rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
                  >
                    Abrir semana
                  </Link>
                )}
              </Card>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
