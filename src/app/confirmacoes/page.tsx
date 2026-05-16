import { ClipboardCheck } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

export default function ConfirmacoesPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <ClipboardCheck size={24} />
        </div>

        <h1 className="text-3xl font-bold">Confirmações</h1>
        <p className="mt-2 text-zinc-400">
          Acompanhe confirmações, recusas e pendências de presença.
        </p>
      </div>

      <Card>
        <p className="text-zinc-400">
          Em breve esta página mostrará todas as confirmações pendentes.
        </p>
      </Card>
    </AppLayout>
  );
}
