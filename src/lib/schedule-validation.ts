import {
  InstrumentAssignment,
  SystemSettings,
  VocalAssignment,
} from "@/types/schedules";

type ValidateScheduleParams = {
  settings: SystemSettings | null;
  instrumentAssignments: InstrumentAssignment[];
  vocalAssignments: VocalAssignment[];
};

export function validateScaleBeforePublish({
  settings,
  instrumentAssignments,
  vocalAssignments,
}: ValidateScheduleParams) {
  if (!settings) {
    return "Configurações do sistema não carregadas.";
  }

  const requiredInstruments = [
    "Bateria",
    "Baixo",
    "Teclado",
    "Violão",
    "Guitarra",
  ];

  for (const instrument of requiredInstruments) {
    const exists = instrumentAssignments.some(
      (assignment) => assignment.instrument === instrument,
    );

    if (!exists) {
      return `Instrumento obrigatório não escalado: ${instrument}`;
    }
  }

  const sundayMinisterCount = vocalAssignments.filter(
    (assignment) =>
      assignment.service_day === "sunday" && assignment.role === "minister",
  ).length;

  if (sundayMinisterCount < settings.max_ministers_per_service) {
    return `Domingo precisa ter ${settings.max_ministers_per_service} ministro(s).`;
  }

  const wednesdayMinisterCount = vocalAssignments.filter(
    (assignment) =>
      assignment.service_day === "wednesday" && assignment.role === "minister",
  ).length;

  if (wednesdayMinisterCount < settings.max_ministers_per_service) {
    return `Quarta precisa ter ${settings.max_ministers_per_service} ministro(s).`;
  }

  const sundayBacks = vocalAssignments.filter(
    (assignment) =>
      assignment.service_day === "sunday" && assignment.role === "backvocal",
  ).length;

  if (sundayBacks < settings.max_backvocals_per_service) {
    return `Domingo precisa ter ${settings.max_backvocals_per_service} backs.`;
  }

  const wednesdayBacks = vocalAssignments.filter(
    (assignment) =>
      assignment.service_day === "wednesday" && assignment.role === "backvocal",
  ).length;

  if (wednesdayBacks < settings.max_backvocals_per_service) {
    return `Quarta precisa ter ${settings.max_backvocals_per_service} backs.`;
  }

  const pendingAssignments = [
    ...instrumentAssignments,
    ...vocalAssignments,
  ].some((assignment) => assignment.status === "pending");

  if (pendingAssignments) {
    return "Existem membros pendentes de confirmação.";
  }

  return null;
}
