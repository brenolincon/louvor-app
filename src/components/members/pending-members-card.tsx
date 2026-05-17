import { Clock3 } from "lucide-react";

import { MemberProfile } from "@/types/members";

import { MemberStatusBadge } from "@/components/members/member-status-badge";

type Props = {
  pendingMembers: MemberProfile[];
  onSelectMember: (member: MemberProfile) => void;
};

export function PendingMembersCard({ pendingMembers, onSelectMember }: Props) {
  if (pendingMembers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300">
          <Clock3 size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Aprovações pendentes
          </h2>

          <p className="text-sm text-zinc-400">
            Novos membros aguardando aprovação.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {pendingMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelectMember(member)}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-yellow-500"
          >
            <div>
              <h3 className="font-medium text-white">{member.full_name}</h3>

              {member.phone && (
                <p className="text-sm text-zinc-400">{member.phone}</p>
              )}
            </div>

            <MemberStatusBadge status={member.status} />
          </button>
        ))}
      </div>
    </div>
  );
}
