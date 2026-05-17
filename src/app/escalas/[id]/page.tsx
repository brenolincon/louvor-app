"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

import { ScheduleHeader } from "@/components/schedules/schedule-header";
import { ScheduleStatusCard } from "@/components/schedules/schedule-status-card";

import { InstrumentAssignmentsCard } from "@/components/weeks/instrument-assignments-card";
import { VocalAssignmentsCard } from "@/components/weeks/vocal-assignments-card";
import { validateScaleBeforePublish } from "@/lib/schedule-validation";
import { getSchedulePermissions } from "@/lib/schedule-permissions";
import {
  createInstrumentAssignment,
  createVocalAssignment,
  fetchScheduleDetails,
  updateScheduleStatus,
} from "@/lib/schedule-service";

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

    try {
      const data = await fetchScheduleDetails(weekId);

      setWeek(data.week);
      setSettings(data.settings);
      setInstrumentalists(data.instrumentalists);
      setVocalists(data.vocalists);
      setInstrumentAssignments(data.instrumentAssignments);
      setVocalAssignments(data.vocalAssignments);
      setLoading(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao carregar escala.",
      );
      setLoading(false);
    }
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

    try {
      await updateScheduleStatus(week.id, status);
      await loadWeekData();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao atualizar status.",
      );
    }
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

    try {
      await createInstrumentAssignment({
        weekId,
        memberId: selectedMemberId,
        instrument: selectedInstrument,
      });
    } catch (error) {
      setSavingInstrument(false);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao salvar instrumentista.",
      );
      return;
    }

    setSavingInstrument(false);

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

    try {
      await createVocalAssignment({
        weekId,
        memberId: selectedVocalistId,
        role: selectedVocalRole,
        serviceDay: selectedServiceDay,
      });
    } catch (error) {
      setSavingVocal(false);
      alert(error instanceof Error ? error.message : "Erro ao salvar voz.");
      return;
    }

    setSavingVocal(false);

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

  const {
    canManageVocals,
    canManageInstruments,
    instrumentsUserCanManage,
    filteredInstrumentalists,
  } = getSchedulePermissions({
    permissions,
    weekVocalGroup: week.vocal_group,
    instrumentalists,
  });

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
