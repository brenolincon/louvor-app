import { CalendarDays } from "lucide-react";

type WeekHeaderProps = {
  sundayDate: string;
  wednesdayDate: string;
  vocalGroup: string;
  status: string;
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

function formatDateBR(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export function WeekHeader({
  sundayDate,
  wednesdayDate,
  vocalGroup,
  status,
}: WeekHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <CalendarDays size={24} />
        </div>

        <h1 className="text-3xl font-bold">
          Semana {formatDateBR(sundayDate)} a {formatDateBR(wednesdayDate)}
        </h1>

        <p className="mt-2 text-zinc-400">
          Grupo vocal responsável: {vocalGroupLabels[vocalGroup] || vocalGroup}
        </p>
      </div>

      <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
        {statusLabels[status] || status}
      </span>
    </div>
  );
}
