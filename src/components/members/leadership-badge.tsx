import { MemberLeadership } from "@/types/members";

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

export function LeadershipBadge({
  leadership,
}: {
  leadership: MemberLeadership;
}) {
  if (leadership.leadership_type === "general_leader") {
    return (
      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
        Líder Geral
      </span>
    );
  }

  if (leadership.leadership_type === "vocal_leader") {
    return (
      <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-300">
        Líder{" "}
        {vocalGroupLabels[leadership.vocal_group || ""] ||
          leadership.vocal_group}
      </span>
    );
  }

  if (leadership.leadership_type === "instrument_leader") {
    return (
      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
        Líder de {leadership.instrument}
      </span>
    );
  }

  return null;
}
