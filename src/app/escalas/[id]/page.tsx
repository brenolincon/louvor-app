"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

import { ScheduleHeader } from "@/components/schedules/schedule-header";
import { ScheduleStatusCard } from "@/components/schedules/schedule-status-card";

import { InstrumentAssignmentsCard } from "@/components/weeks/instrument-assignments-card";
import { VocalAssignmentsCard } from "@/components/weeks/vocal-assignments-card";
import { validateScaleBeforePublish } from "@/lib/schedule-validation";

import {
  InstrumentAssignment,
  MemberFunction,
  SystemSettings,
  VocalAssignment,
  Week,
} from "@/types/schedules";

type Permissions = Awaited<ReturnType<typeof getCurrentUserPermissions>>;

export default function EscalaDetailsPage() {
  const params = useParams();
  const weekId = params.id as string;

  const [week, setWeek] = useState<Week | null>(null);
  const [permissions, setPermissions] = useState<Permissions>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

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
        vocal_group,
        status
      `,
      )
      .eq("id", weekId)
      .single();

    if (weekError) {
      alert(weekError.message);
      setLoading(false);
      return;
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select(
        `
        max_ministers_per_service,
        max_backvocals_per_service
      `,
      )
      .eq("id", 1)
      .single();

    if (settingsError) {
      alert(settingsError.message);
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
        .order("instrument", { ascending: true });

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
      .order("created_at", { ascending: true });

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
      .order("instrument", { ascending: true });

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
        .order("service_day", { ascending: true });

    if (vocalAssignmentsError) {
      alert(vocalAssignmentsError.message);
      setLoading(false);
      return;
    }

    setWeek(weekData);
    setSettings(settingsData);
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
    async function init() {
      await loadWeekData();
    }

    init();
  }, [loadWeekData]);

  async function updateWeekStatus(status: string) {
    if (!week) return;

    if (permissions?.isGeneralLeader !== true) {
      alert("Apenas o líder geral pode alterar o status da escala.");
      return;
    }

    if (status === "published") {
      const validationError = validateScaleBeforePublish({
        settings,
        instrumentAssignments,
        vocalAssignments,
      });

      if (validationError) {
        alert(validationError);
        return;
      }
    }

    const { error } = await supabase
      .from("ministry_weeks")
      .update({ status })
      .eq("id", week.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadWeekData();
  }

  async function saveInstrumentAssignment(e: React.FormEvent) {
    e.preventDefault();

    if (week?.status === "published" || week?.status === "closed") {
      alert("Esta escala já foi publicada ou encerrada.");
      return;
    }

    if (!selectedInstrument || !selectedMemberId) {
      alert("Selecione instrumento e músico.");
      return;
    }

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

    if (week?.status === "published" || week?.status === "closed") {
      alert("Esta escala já foi publicada ou encerrada.");
      return;
    }

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

    const ministerCount = vocalAssignments.filter(
      (assignment) =>
        assignment.service_day === selectedServiceDay &&
        assignment.role === "minister",
    ).length;

    if (
      selectedVocalRole === "minister" &&
      ministerCount >= (settings?.max_ministers_per_service ?? 1)
    ) {
      alert(
        `Limite máximo de ${
          settings?.max_ministers_per_service ?? 1
        } ministro(s) atingido.`,
      );
      return;
    }

    const backvocalCount = vocalAssignments.filter(
      (assignment) =>
        assignment.service_day === selectedServiceDay &&
        assignment.role === "backvocal",
    ).length;

    if (
      selectedVocalRole === "backvocal" &&
      backvocalCount >= (settings?.max_backvocals_per_service ?? 3)
    ) {
      alert(
        `Limite máximo de ${
          settings?.max_backvocals_per_service ?? 3
        } backs por culto.`,
      );
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

  const isPublishedOrClosed =
    week.status === "published" || week.status === "closed";

  const canEditScale = !isPublishedOrClosed;

  return (
    <AppLayout>
      <ScheduleHeader week={week} />

      <ScheduleStatusCard
        status={week.status}
        isPublishedOrClosed={isPublishedOrClosed}
        isGeneralLeader={permissions?.isGeneralLeader === true}
        onChangeStatus={updateWeekStatus}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <InstrumentAssignmentsCard
          instrumentalists={filteredInstrumentalists}
          assignments={instrumentAssignments}
          selectedInstrument={selectedInstrument}
          selectedMemberId={selectedMemberId}
          saving={savingInstrument}
          canManage={canManageInstruments && canEditScale}
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
          canManage={canManageVocals && canEditScale}
          onServiceDayChange={setSelectedServiceDay}
          onVocalRoleChange={setSelectedVocalRole}
          onVocalistChange={setSelectedVocalistId}
          onSubmit={saveVocalAssignment}
        />
      </div>
    </AppLayout>
  );
}
