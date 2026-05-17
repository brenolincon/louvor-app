import { assignmentStatusLabels } from "@/lib/labels";
import { MinistryWeek } from "@/types/schedules";

const vocalRoleLabels: Record<string, string> = {
  minister: "Ministro",
  backvocal: "Backvocal",
};

const serviceDayLabels: Record<string, string> = {
  sunday: "Domingo",
  wednesday: "Quarta",
};

export function MemberScheduleSummary({ week }: { week: MinistryWeek }) {
  return (
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
              <p className="font-medium">{assignment.instrument}</p>
              <p className="text-sm text-zinc-400">
                {assignment.profiles?.full_name || "-"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {assignmentStatusLabels[assignment.status] || assignment.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-semibold">Vozes</h4>

        {week.week_vocal_assignments?.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma voz definida.</p>
        )}

        <div className="grid gap-2 md:grid-cols-2">
          {week.week_vocal_assignments?.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
            >
              <p className="font-medium">
                {vocalRoleLabels[assignment.role] || assignment.role} •{" "}
                {serviceDayLabels[assignment.service_day] ||
                  assignment.service_day}
              </p>
              <p className="text-sm text-zinc-400">
                {assignment.profiles?.full_name || "-"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {assignmentStatusLabels[assignment.status] || assignment.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
