import { Card } from "@/components/ui/card";

type WeekSummaryCardsProps = {
  rehearsalDate: string;
  rehearsalTime: string;
  sundayDate: string;
  sundayTime: string;
  wednesdayDate: string;
  wednesdayTime: string;
};

function formatDateBR(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export function WeekSummaryCards({
  rehearsalDate,
  rehearsalTime,
  sundayDate,
  sundayTime,
  wednesdayDate,
  wednesdayTime,
}: WeekSummaryCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Card>
        <p className="text-sm text-zinc-500">Ensaio</p>
        <h2 className="mt-2 text-xl font-semibold">
          {formatDateBR(rehearsalDate)}
        </h2>
        <p className="text-zinc-400">{rehearsalTime}</p>
      </Card>

      <Card>
        <p className="text-sm text-zinc-500">Culto domingo</p>
        <h2 className="mt-2 text-xl font-semibold">
          {formatDateBR(sundayDate)}
        </h2>
        <p className="text-zinc-400">{sundayTime}</p>
      </Card>

      <Card>
        <p className="text-sm text-zinc-500">Culto quarta</p>
        <h2 className="mt-2 text-xl font-semibold">
          {formatDateBR(wednesdayDate)}
        </h2>
        <p className="text-zinc-400">{wednesdayTime}</p>
      </Card>
    </div>
  );
}
