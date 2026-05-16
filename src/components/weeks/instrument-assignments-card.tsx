import { Users } from "lucide-react";

import { Card } from "@/components/ui/card";

type InstrumentalistFunction = {
  id: string;
  instrument: string | null;
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

type Props = {
  instrumentalists: InstrumentalistFunction[];
  assignments: InstrumentAssignment[];

  selectedInstrument: string;
  selectedMemberId: string;

  saving: boolean;

  canManage: boolean;
  allowedInstruments: string[];

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

  canManage,
  allowedInstruments,

  onInstrumentChange,
  onMemberChange,

  onSubmit,
}: Props) {
  const instruments = [
    ...new Set(instrumentalists.map((member) => member.instrument)),
  ].filter((instrument): instrument is string => Boolean(instrument));

  const visibleInstruments = canManage
    ? instruments.filter((instrument) =>
        allowedInstruments.includes(instrument),
      )
    : instruments;

  const availableMembers = instrumentalists.filter((member) =>
    selectedInstrument ? member.instrument === selectedInstrument : true,
  );

  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <Users className="text-violet-400" size={22} />

        <h2 className="text-xl font-semibold">Instrumentistas</h2>
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
            value={selectedInstrument}
            onChange={(e) => onInstrumentChange(e.target.value)}
            required
          >
            <option value="">Instrumento</option>

            {visibleInstruments.map((instrument) => (
              <option key={instrument} value={instrument}>
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

            {availableMembers.map((member) => {
              const profile = member.profiles;

              if (!profile) return null;

              return (
                <option key={member.id} value={profile.id}>
                  {profile.full_name}
                </option>
              );
            })}
          </select>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar instrumentista"}
          </button>
        </form>
      )}

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
                {assignment.profiles?.full_name}
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
