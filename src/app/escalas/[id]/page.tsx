"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Music } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";

import { WeekHeader } from "@/components/weeks/week-header";
import { WeekSummaryCards } from "@/components/weeks/week-summary-cards";
import { InstrumentAssignmentsCard } from "@/components/weeks/instrument-assignments-card";
import { VocalAssignmentsCard } from "@/components/weeks/vocal-assignments-card";
import { WeekPlaceholderCard } from "@/components/weeks/week-placeholder-card";

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

type Vocalist = {
  id: string;
  full_name: string;
  vocal_role: string | null;
  vocal_group: string | null;
};

type VocalAssignment = {
  id: string;
  member_id: string;
  role: string;
  service_day: string;
  status: string;
  profiles:
    | {
        full_name: string;
      }[]
    | null;
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

  const [vocalists, setVocalists] = useState<Vocalist[]>([]);
  const [vocalAssignments, setVocalAssignments] = useState<VocalAssignment[]>(
    [],
  );

  const [selectedServiceDay, setSelectedServiceDay] = useState("");
  const [selectedVocalRole, setSelectedVocalRole] = useState("");
  const [selectedVocalistId, setSelectedVocalistId] = useState("");
  const [savingVocal, setSavingVocal] = useState(false);

  const fetchInstrumentAssignments = useCallback(async () => {
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
      .order("instrument", { ascending: true });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }, [weekId]);

  const fetchVocalAssignments = useCallback(async () => {
    const { data, error } = await supabase
      .from("week_vocal_assignments")
      .select(
        `
        id,
        member_id,
        role,
        service_day,
        status,
        profiles (
          full_name
        )
      `,
      )
      .eq("week_id", weekId);

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }, [weekId]);

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

    const updatedAssignments = await fetchInstrumentAssignments();
    setInstrumentAssignments(updatedAssignments);
  }

  async function saveVocalAssignment(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedServiceDay || !selectedVocalRole || !selectedVocalistId) {
      alert("Preencha todos os campos.");
      return;
    }

    setSavingVocal(true);

    const { error } = await supabase.from("week_vocal_assignments").insert({
      week_id: weekId,
      member_id: selectedVocalistId,
      role: selectedVocalRole,
      service_day: selectedServiceDay,
      status: "pending",
    });

    setSavingVocal(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedServiceDay("");
    setSelectedVocalRole("");
    setSelectedVocalistId("");

    const updatedAssignments = await fetchVocalAssignments();
    setVocalAssignments(updatedAssignments);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadWeekData() {
      setLoading(true);

      const { data: weekData, error: weekError } = await supabase
        .from("ministry_weeks")
        .select("*")
        .eq("id", weekId)
        .single();

      if (!isMounted) return;

      if (weekError) {
        alert(weekError.message);
        setLoading(false);
        return;
      }

      const { data: instrumentalistsData, error: instrumentalistsError } =
        await supabase
          .from("profiles")
          .select("id, full_name, instrument, status, member_type")
          .eq("member_type", "instrumentalist")
          .eq("status", "approved")
          .order("full_name", { ascending: true });

      if (!isMounted) return;

      if (instrumentalistsError) {
        alert(instrumentalistsError.message);
        setLoading(false);
        return;
      }

      const { data: vocalistsData, error: vocalistsError } = await supabase
        .from("profiles")
        .select("id, full_name, vocal_role, vocal_group")
        .eq("member_type", "vocalist")
        .eq("status", "approved")
        .eq("vocal_group", weekData.vocal_group)
        .order("full_name", { ascending: true });

      if (!isMounted) return;

      if (vocalistsError) {
        alert(vocalistsError.message);
        setLoading(false);
        return;
      }

      const instrumentAssignmentsData = await fetchInstrumentAssignments();
      const vocalAssignmentsData = await fetchVocalAssignments();

      if (!isMounted) return;

      setWeek(weekData);
      setInstrumentalists(instrumentalistsData || []);
      setVocalists(vocalistsData || []);
      setInstrumentAssignments(instrumentAssignmentsData);
      setVocalAssignments(vocalAssignmentsData);
      setLoading(false);
    }

    if (weekId) {
      loadWeekData();
    }

    return () => {
      isMounted = false;
    };
  }, [weekId, fetchInstrumentAssignments, fetchVocalAssignments]);

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
      <WeekHeader
        sundayDate={week.sunday_date}
        wednesdayDate={week.wednesday_date}
        vocalGroup={week.vocal_group}
        status={week.status}
      />

      <WeekSummaryCards
        rehearsalDate={week.rehearsal_date}
        rehearsalTime={week.rehearsal_time}
        sundayDate={week.sunday_date}
        sundayTime={week.sunday_time}
        wednesdayDate={week.wednesday_date}
        wednesdayTime={week.wednesday_time}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <InstrumentAssignmentsCard
          instrumentalists={instrumentalists}
          assignments={instrumentAssignments}
          selectedInstrument={selectedInstrument}
          selectedMemberId={selectedMemberId}
          saving={savingInstrument}
          onInstrumentChange={setSelectedInstrument}
          onMemberChange={setSelectedMemberId}
          onSubmit={saveInstrumentAssignment}
        />

        <VocalAssignmentsCard
          vocalists={vocalists}
          assignments={vocalAssignments}
          selectedServiceDay={selectedServiceDay}
          selectedVocalRole={selectedVocalRole}
          selectedVocalistId={selectedVocalistId}
          saving={savingVocal}
          onServiceDayChange={setSelectedServiceDay}
          onVocalRoleChange={setSelectedVocalRole}
          onVocalistChange={setSelectedVocalistId}
          onSubmit={saveVocalAssignment}
        />

        <WeekPlaceholderCard
          title="Repertório"
          description="Em breve o ministro poderá enviar o repertório."
          icon={Music}
        />

        <WeekPlaceholderCard
          title="Confirmações"
          description="Em breve os integrantes confirmarão presença."
          icon={CalendarDays}
        />
      </div>
    </AppLayout>
  );
}
