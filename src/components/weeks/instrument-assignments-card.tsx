import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

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

type Props = {
  instrumentalists: Profile[];
  assignments: InstrumentAssignment[];
  selectedInstrument: string;
  selectedMemberId: string;
  saving: boolean;
  onInstrumentChange: (value: string) => void;
  onMemberChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function InstrumentAssignmentsCard({
  instrumentalists,
  assignments,
  selectedInstrument,
  selectedMemberId,
  saving,
  onInstrumentChange,
  onMemberChange,
  onSubmit,
}: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <Users className="text-violet-400" size={22} />
        <h2 className="text-xl font-semibold">Instrumentistas</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <select
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
          value={selectedInstrument}
          onChange={(e) => onInstrumentChange(e.target.value)}
          required
        >
          <option value="">Instrumento</option>

          {[...new Set(instrumentalists.map((member) => member.instrument))]
            .filter(Boolean)
            .map((instrument) => (
              <option key={instrument} value={instrument || ""}>
                {instrument}
              </option>
            ))}
        </select>

        <select
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
          value={selectedMemberId}
          onChange={(e) => onMemberChange(e.target.value)}
          required
        >
          <option value="">Músico</option>

          {instrumentalists
            .filter((member) =>
              selectedInstrument
                ? member.instrument === selectedInstrument
                : true,
            )
            .map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
        </select>

        <button
          disabled={saving}
          className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar instrumentista"}
        </button>
      </form>

      <div className="mt-5 space-y-2">
        {assignments.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nenhum instrumentista definido ainda.
          </p>
        )}

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <div>
              <p className="font-medium">{assignment.instrument}</p>
              <p className="text-sm text-zinc-400">
                {assignment.profiles?.[0]?.full_name}
              </p>
            </div>

            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
              {assignment.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
