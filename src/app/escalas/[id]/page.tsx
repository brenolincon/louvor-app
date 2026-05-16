"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CalendarDays } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

import { AppLayout } from "@/components/app-layout";

import { Card } from "@/components/ui/card";

import { InstrumentAssignmentsCard } from "@/components/weeks/instrument-assignments-card";
import { VocalAssignmentsCard } from "@/components/weeks/vocal-assignments-card";

type Week = {
  id: string;
  sunday_date: string;
  wednesday_date: string;
  rehearsal_date: string;
  vocal_group: string;
};

type MemberFunction = {
  id: string;
  instrument: string | null;
  vocal_group: string | null;
  profiles: {
    id: string;
    full_name: string;
    status: string;
  } | null;
};

type InstrumentAssignment = {
  id: string;
  week_id: string;
  member_id: string;
  instrument: string;
  status: string;
  profiles: {
    full_name: string;
  } | null;
};

type VocalAssignment = {
  id: string;
  member_id: string;
  role: string;
  service_day: string;
  status: string;
  profiles: {
    full_name: string;
  } | null;
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function EscalaDetailsPage() {
  const params = useParams();

  const weekId = params.id as string;

  const [week, setWeek] = useState<Week | null>(null);

  const [permissions, setPermissions] = useState<any>(null);

  const [instrumentalists, setInstrumentalists] = useState<MemberFunction[]>(
    [],
  );

  const [vocalists, setVocalists] = useState<MemberFunction[]>([]);

  const [instrumentAssignments, setInstrumentAssignments] = useState<
    InstrumentAssignment[]
  >([]);

  const [vocalAssignments, setVocalAssignments] = useState<VocalAssignment[]>(
    [],
  );

  const [selectedInstrument, setSelectedInstrument] = useState("");

  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [selectedServiceDay, setSelectedServiceDay] = useState("");

  const [selectedVocalRole, setSelectedVocalRole] = useState("");

  const [selectedVocalistId, setSelectedVocalistId] = useState("");

  const [savingInstrument, setSavingInstrument] = useState(false);

  const [savingVocal, setSavingVocal] = useState(false);

  const [loading, setLoading] = useState(true);

  const loadWeekData = useCallback(async () => {
    setLoading(true);

    const currentPermissions = await getCurrentUserPermissions();

    if (!currentPermissions) {
      setLoading(false);
      return;
    }

    if (!currentPermissions.isAnyLeader) {
      alert("Você não tem permissão para acessar esta página.");
      window.location.href = "/escalas";
      return;
    }

    setPermissions(currentPermissions);

    const { data: weekData, error: weekError } = await supabase
      .from("ministry_weeks")
      .select(
        `
          id,
          sunday_date,
          wednesday_date,
          rehearsal_date,
          vocal_group
        `,
      )
      .eq("id", weekId)
      .single();

    if (weekError) {
      alert(weekError.message);
      setLoading(false);
      return;
    }

    const { data: instrumentalistsData, error: instrumentalistsError } =
      await supabase
        .from("member_functions")
        .select(
          `
        id,
        instrument,
        vocal_group,
        profiles!inner (
          id,
          full_name,
          status
        )
      `,
        )
        .eq("function_type", "instrumentalist")
        .eq("profiles.status", "approved")
        .order("instrument", {
          ascending: true,
        });

    if (instrumentalistsError) {
      alert(instrumentalistsError.message);
      setLoading(false);
      return;
    }

    const { data: vocalistsData, error: vocalistsError } = await supabase
      .from("member_functions")
      .select(
        `
        id,
        instrument,
        vocal_group,
        profiles!inner (
          id,
          full_name,
          status
        )
      `,
      )
      .eq("function_type", "vocalist")
      .eq("vocal_group", weekData.vocal_group)
      .eq("profiles.status", "approved")
      .order("created_at", {
        ascending: true,
      });

    if (vocalistsError) {
      alert(vocalistsError.message);
      setLoading(false);
      return;
    }

    const {
      data: instrumentAssignmentsData,
      error: instrumentAssignmentsError,
    } = await supabase
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

    if (instrumentAssignmentsError) {
      alert(instrumentAssignmentsError.message);
      setLoading(false);
      return;
    }

    const { data: vocalAssignmentsData, error: vocalAssignmentsError } =
      await supabase
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
        .eq("week_id", weekId)
        .order("service_day", {
          ascending: true,
        });

    if (vocalAssignmentsError) {
      alert(vocalAssignmentsError.message);
      setLoading(false);
      return;
    }

    setWeek(weekData);

    setInstrumentalists(
      (instrumentalistsData || []) as unknown as MemberFunction[],
    );

    setVocalists((vocalistsData || []) as unknown as MemberFunction[]);

    setInstrumentAssignments(
      (instrumentAssignmentsData || []) as unknown as InstrumentAssignment[],
    );

    setVocalAssignments(
      (vocalAssignmentsData || []) as unknown as VocalAssignment[],
    );

    setLoading(false);
  }, [weekId]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  async function saveInstrumentAssignment(e: React.FormEvent) {
    e.preventDefault();

    const canManageAll = permissions?.isGeneralLeader === true;

    const canManageThisInstrument =
      canManageAll ||
      permissions?.instrumentsLed?.includes(selectedInstrument) === true;

    if (!canManageThisInstrument) {
      alert("Você só pode escalar instrumentos que lidera.");
      return;
    }

    const alreadyExists = instrumentAssignments.some(
      (assignment) => assignment.instrument === selectedInstrument,
    );

    if (alreadyExists) {
      alert("Já existe um músico escalado para este instrumento.");

      return;
    }

    setSavingInstrument(true);

    const { error } = await supabase
      .from("week_instrument_assignments")
      .insert({
        week_id: weekId,
        member_id: selectedMemberId,
        instrument: selectedInstrument,
        status: "pending",
      });

    setSavingInstrument(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedInstrument("");
    setSelectedMemberId("");

    await loadWeekData();
  }

  async function saveVocalAssignment(e: React.FormEvent) {
    e.preventDefault();

    const canManageVocals =
      permissions?.isGeneralLeader === true ||
      (week?.vocal_group !== undefined &&
        week?.vocal_group !== null &&
        permissions?.vocalGroupsLed?.includes(week.vocal_group) === true);

    if (!canManageVocals) {
      alert("Você não tem permissão para editar vozes nesta escala.");
      return;
    }

    if (!selectedServiceDay || !selectedVocalRole || !selectedVocalistId) {
      alert("Preencha todos os campos.");

      return;
    }

    const ministerExists = vocalAssignments.some(
      (assignment) =>
        assignment.service_day === selectedServiceDay &&
        assignment.role === "minister",
    );

    if (selectedVocalRole === "minister" && ministerExists) {
      alert("Já existe um ministro escalado neste culto.");

      return;
    }

    const backvocalCount = vocalAssignments.filter(
      (assignment) =>
        assignment.service_day === selectedServiceDay &&
        assignment.role === "backvocal",
    ).length;

    if (selectedVocalRole === "backvocal" && backvocalCount >= 3) {
      alert("Limite máximo de 3 backs por culto.");

      return;
    }

    const alreadyAssigned = vocalAssignments.some(
      (assignment) =>
        assignment.service_day === selectedServiceDay &&
        assignment.member_id === selectedVocalistId,
    );

    if (alreadyAssigned) {
      alert("Este vocalista já está escalado neste culto.");

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

    await loadWeekData();
  }

  if (loading) {
    return (
      <AppLayout>
        <Card>
          <p className="text-zinc-400">Carregando escala...</p>
        </Card>
      </AppLayout>
    );
  }

  if (!week) {
    return (
      <AppLayout>
        <Card>
          <p className="text-zinc-400">Escala não encontrada.</p>
        </Card>
      </AppLayout>
    );
  }

  const canManageAll = permissions?.isGeneralLeader === true;

  const canManageVocals =
    canManageAll ||
    permissions?.vocalGroupsLed?.includes(week.vocal_group) === true;

  const userLedInstruments = permissions?.instrumentsLed || [];

  const canManageInstruments = canManageAll || userLedInstruments.length > 0;

  const instrumentsUserCanManage = canManageAll
    ? instrumentalists
        .map((item) => item.instrument)
        .filter((instrument): instrument is string => Boolean(instrument))
    : userLedInstruments;

  const filteredInstrumentalists = canManageInstruments
    ? canManageAll
      ? instrumentalists
      : instrumentalists.filter(
          (item) =>
            item.instrument !== null &&
            instrumentsUserCanManage.includes(item.instrument),
        )
    : [];

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <CalendarDays size={24} />
        </div>

        <h1 className="text-3xl font-bold">
          Semana {formatDate(week.sunday_date)} a{" "}
          {formatDate(week.wednesday_date)}
        </h1>

        <p className="mt-2 text-zinc-400">
          Grupo vocal: {vocalGroupLabels[week.vocal_group] || week.vocal_group}
        </p>

        <p className="text-sm text-zinc-500">
          Ensaio: {formatDate(week.rehearsal_date)}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <InstrumentAssignmentsCard
          instrumentalists={filteredInstrumentalists}
          assignments={instrumentAssignments}
          selectedInstrument={selectedInstrument}
          selectedMemberId={selectedMemberId}
          saving={savingInstrument}
          canManage={!!canManageInstruments}
          allowedInstruments={instrumentsUserCanManage}
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
          canManage={!!canManageVocals}
          onServiceDayChange={setSelectedServiceDay}
          onVocalRoleChange={setSelectedVocalRole}
          onVocalistChange={setSelectedVocalistId}
          onSubmit={saveVocalAssignment}
        />
      </div>
    </AppLayout>
  );
}
