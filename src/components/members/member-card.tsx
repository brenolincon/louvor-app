import { User2 } from "lucide-react";

import { MemberProfile } from "@/types/members";

import { MemberStatusBadge } from "@/components/members/member-status-badge";

import { LeadershipBadge } from "@/components/members/leadership-badge";

type Props = {
  member: MemberProfile;

  onClick: () => void;
};

export function MemberCard({ member, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-violet-500 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
            <User2 size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-white">{member.full_name}</h3>

            {member.phone && (
              <p className="text-sm text-zinc-400">{member.phone}</p>
            )}
          </div>
        </div>

        <MemberStatusBadge status={member.status} />
      </div>

      {member.member_functions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {member.member_functions.map((func) => (
            <span
              key={func.id}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
            >
              {func.function_type === "vocalist" &&
                `Vocal • ${func.vocal_group}`}

              {func.function_type === "instrumentalist" && func.instrument}
            </span>
          ))}
        </div>
      )}

      {member.member_leaderships.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {member.member_leaderships.map((leadership) => (
            <LeadershipBadge key={leadership.id} leadership={leadership} />
          ))}
        </div>
      )}
    </button>
  );
}
