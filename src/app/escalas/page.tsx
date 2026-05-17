"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { CreateWeekCard } from "@/components/schedules/create-week-card";
import { ScheduleListCard } from "@/components/schedules/schedule-list-card";

import { MinistryWeek } from "@/types/schedules";

type Permissions = Awaited<ReturnType<typeof getCurrentUserPermissions>>;

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
          <CreateWeekCard
            sundayDate={sundayDate}
            vocalGroup={vocalGroup}
            loading={loading}
            onSundayDateChange={setSundayDate}
            onVocalGroupChange={setVocalGroup}
            onSubmit={createWeek}
          />
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
              <ScheduleListCard
                key={week.id}
                week={week}
                isLeader={permissions?.isAnyLeader === true}
              />
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
