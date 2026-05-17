import { Search } from "lucide-react";

type Props = {
  search: string;

  onSearchChange: (value: string) => void;
};

export function MembersToolbar({ search, onSearchChange }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">Lista de membros</h2>

        <p className="text-sm text-zinc-400">
          Pesquise membros, funções e lideranças.
        </p>
      </div>

      <div className="relative w-full lg:w-80">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar membro..."
          className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-violet-500"
        />
      </div>
    </div>
  );
}
