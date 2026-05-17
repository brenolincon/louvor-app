import { CalendarDays } from "lucide-react";

import { Week } from "@/types/schedules";

import { formatDateBR } from "@/lib/date";

import { vocalGroupLabels } from "@/lib/labels";

type Props = {
  week: Week;
};

export function ScheduleHeader({ week }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
        <CalendarDays size={24} />
      </div>

      <h1 className="text-3xl font-bold">
        Semana {formatDateBR(week.sunday_date)} a{" "}
        {formatDateBR(week.wednesday_date)}
      </h1>

      <p className="mt-2 text-zinc-400">
        Grupo vocal: {vocalGroupLabels[week.vocal_group] || week.vocal_group}
      </p>

      <p className="text-sm text-zinc-500">
        Ensaio: {formatDateBR(week.rehearsal_date)}
      </p>
    </div>
  );
}
