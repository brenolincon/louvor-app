import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";

type Props = {
  sundayDate: string;
  vocalGroup: string;
  loading: boolean;
  onSundayDateChange: (value: string) => void;
  onVocalGroupChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function parseDate(date?: string) {
  return date ? new Date(date + "T00:00:00") : undefined;
}

function formatDateInput(date?: Date) {
  return date ? date.toISOString().split("T")[0] : "";
}

export function CreateWeekCard({
  sundayDate,
  vocalGroup,
  loading,
  onSundayDateChange,
  onVocalGroupChange,
  onSubmit,
}: Props) {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Criar semana ministerial</h2>
      <p className="mt-1 text-sm text-zinc-400">
        O sistema gera automaticamente ensaio, domingo e quarta.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Domingo da semana
          </label>

          <DatePicker
            value={parseDate(sundayDate)}
            placeholder="Selecione o domingo"
            onChange={(date) => onSundayDateChange(formatDateInput(date))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Grupo vocal responsável
          </label>

          <Select
            value={vocalGroup}
            onChange={(e) => onVocalGroupChange(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="unit">Unit</option>
            <option value="ative">Ative</option>
            <option value="teens">Geração Teens</option>
          </Select>
        </div>

        <Button disabled={loading} className="w-full">
          {loading ? "Criando..." : "Criar semana"}
        </Button>
      </form>
    </Card>
  );
}
