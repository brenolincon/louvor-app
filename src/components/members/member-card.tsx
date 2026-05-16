import { ChevronRight, Music2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

type MemberFunction = {
  id: string;
  function_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

type MemberLeadership = {
  id: string;
  leadership_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  status: string;
  ministry_role: string;
  created_at: string;
  member_functions: MemberFunction[];
  member_leaderships: MemberLeadership[];
};

type Props = {
  member: Profile;
  onClick: () => void;
};

const statusLabels: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
  inactive: "Inativo",
  training: "Em treinamento",
};

const statusStyles: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",
  inactive: "border-zinc-700 bg-zinc-800 text-zinc-300",
  training: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

function formatFunctions(functions: MemberFunction[]) {
  if (!functions?.length) return ["Sem função ministerial"];

  return functions.map((func) => {
    if (func.function_type === "vocalist") {
      return `Vocal • ${func.vocal_group ? vocalGroupLabels[func.vocal_group] : "-"}`;
    }

    if (func.function_type === "instrumentalist") {
      return `Instrumentista • ${func.instrument || "-"}`;
    }

    return func.function_type;
  });
}

function formatLeaderships(leaderships: MemberLeadership[]) {
  if (!leaderships?.length) return [];

  return leaderships.map((leadership) => {
    if (leadership.leadership_type === "general_leader") return "Líder geral";

    if (leadership.leadership_type === "vocal_leader") {
      return `Líder ${leadership.vocal_group ? vocalGroupLabels[leadership.vocal_group] : "vocal"}`;
    }

    if (leadership.leadership_type === "instrument_leader") {
      return `Líder de ${leadership.instrument || "instrumento"}`;
    }

    return leadership.leadership_type;
  });
}

export function MemberCard({ member, onClick }: Props) {
  const functions = formatFunctions(member.member_functions);
  const leaderships = formatLeaderships(member.member_leaderships);

  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="transition hover:border-violet-500/40 hover:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">{member.full_name}</h2>

              {member.phone && (
                <p className="mt-1 text-sm text-zinc-500">
                  Telefone: {member.phone}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {functions.map((func) => (
                <span
                  key={func}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300"
                >
                  <Music2 size={13} />
                  {func}
                </span>
              ))}
            </div>

            {leaderships.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {leaderships.map((leadership) => (
                  <span
                    key={leadership}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300"
                  >
                    <ShieldCheck size={13} />
                    {leadership}
                  </span>
                ))}
              </div>
            )}

            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs ${
                statusStyles[member.status] ||
                "border-zinc-700 bg-zinc-800 text-zinc-300"
              }`}
            >
              {statusLabels[member.status] || member.status}
            </span>
          </div>

          <ChevronRight className="text-zinc-500" size={22} />
        </div>
      </Card>
    </button>
  );
}
