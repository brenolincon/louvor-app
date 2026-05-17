const statusLabels: Record<string, string> = {
  pending: "Aguardando aprovação",

  approved: "Aprovado",

  rejected: "Recusado",

  inactive: "Inativo",

  training: "Em treinamento",
};

const statusClasses: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",

  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",

  rejected: "border-red-500/30 bg-red-500/10 text-red-300",

  inactive: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",

  training: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

export function MemberStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        statusClasses[status] || "border-zinc-700 text-zinc-400"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}
