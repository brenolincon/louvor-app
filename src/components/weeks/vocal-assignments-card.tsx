import { Mic2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type VocalistFunction = {
  id: string;
  vocal_group: string | null;
  profiles: {
    id: string;
    full_name: string;
    status: string;
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

type Props = {
  vocalists: VocalistFunction[];
  assignments: VocalAssignment[];
  selectedServiceDay: string;
  selectedVocalRole: string;
  selectedVocalistId: string;
  saving: boolean;
  canManage: boolean;
  onServiceDayChange: (value: string) => void;
  onVocalRoleChange: (value: string) => void;
  onVocalistChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
  justified: "Justificado",
  substituted: "Substituído",
};

const statusClasses: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  declined: "border-red-500/30 bg-red-500/10 text-red-300",
  justified: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  substituted: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

export function VocalAssignmentsCard({
  vocalists,
  assignments,
  selectedServiceDay,
  selectedVocalRole,
  selectedVocalistId,
  saving,
  canManage,
  onServiceDayChange,
  onVocalRoleChange,
  onVocalistChange,
  onSubmit,
}: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <Mic2 className="text-violet-400" size={22} />
        <h2 className="text-xl font-semibold">Vozes</h2>
      </div>

      {!canManage && (
        <p className="mb-4 text-sm text-zinc-500">
          Você possui apenas permissão de visualização.
        </p>
      )}

      {canManage && (
        <form onSubmit={onSubmit} className="space-y-3">
          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
            value={selectedServiceDay}
            onChange={(e) => onServiceDayChange(e.target.value)}
            required
          >
            <option value="">Culto</option>
            <option value="sunday">Domingo</option>
            <option value="wednesday">Quarta</option>
          </select>

          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
            value={selectedVocalRole}
            onChange={(e) => onVocalRoleChange(e.target.value)}
            required
          >
            <option value="">Função na escala</option>
            <option value="minister">Ministro</option>
            <option value="backvocal">Backvocal</option>
          </select>

          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
            value={selectedVocalistId}
            onChange={(e) => onVocalistChange(e.target.value)}
            required
          >
            <option value="">Vocalista</option>

            {vocalists.map((vocalist) => {
              const profile = vocalist.profiles;

              if (!profile) return null;

              return (
                <option key={vocalist.id} value={profile.id}>
                  {profile.full_name}
                </option>
              );
            })}
          </select>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar voz"}
          </button>
        </form>
      )}

      <div className="mt-5 space-y-2">
        {assignments.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma voz definida ainda.</p>
        )}

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <div>
              <p className="font-medium">
                {assignment.role === "minister" ? "Ministro" : "Backvocal"}
              </p>

              <p className="text-sm text-zinc-400">
                {assignment.profiles?.full_name}
              </p>
            </div>

            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              {assignment.service_day === "sunday" ? "Domingo" : "Quarta"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                statusClasses[assignment.status] ||
                "border-zinc-700 text-zinc-400"
              }`}
            >
              {statusLabels[assignment.status] || assignment.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
