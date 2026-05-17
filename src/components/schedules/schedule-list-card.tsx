import Link from "next/link";

import { Card } from "@/components/ui/card";
import { MemberScheduleSummary } from "@/components/schedules/member-schedule-summary";
import { formatDateBR } from "@/lib/date";
import { vocalGroupLabels, weekStatusLabels } from "@/lib/labels";
import { MinistryWeek } from "@/types/schedules";

type Props = {
  week: MinistryWeek;
  isLeader: boolean;
};

export function ScheduleListCard({ week, isLeader }: Props) {
  return (
    <Card className="space-y-4">
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
          {weekStatusLabels[week.status] || week.status}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Ensaio</p>
          <p className="mt-1 font-medium">
            {formatDateBR(week.rehearsal_date)}
          </p>
          <p className="text-sm text-zinc-400">{week.rehearsal_time}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Domingo</p>
          <p className="mt-1 font-medium">{formatDateBR(week.sunday_date)}</p>
          <p className="text-sm text-zinc-400">{week.sunday_time}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">Quarta</p>
          <p className="mt-1 font-medium">
            {formatDateBR(week.wednesday_date)}
          </p>
          <p className="text-sm text-zinc-400">{week.wednesday_time}</p>
        </div>
      </div>

      {!isLeader && <MemberScheduleSummary week={week} />}

      {isLeader && (
        <Link
          href={`/escalas/${week.id}`}
          className="inline-flex rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          Abrir semana
        </Link>
      )}
    </Card>
  );
}
