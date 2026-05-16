import { Music } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

export default function RepertoriosPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Music size={24} />
        </div>

        <h1 className="text-3xl font-bold">Repertórios</h1>
        <p className="mt-2 text-zinc-400">
          Visualize e acompanhe os repertórios das semanas ministeriais.
        </p>
      </div>

      <Card>
        <p className="text-zinc-400">
          Em breve esta página listará repertórios de domingo e quarta.
        </p>
      </Card>
    </AppLayout>
  );
}
