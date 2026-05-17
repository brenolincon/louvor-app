import { Card } from "@/components/ui/card";

import { weekStatusLabels } from "@/lib/labels";

type Props = {
  status: string;

  isPublishedOrClosed: boolean;

  isGeneralLeader: boolean;

  onChangeStatus: (status: string) => void;
};

export function ScheduleStatusCard({
  status,
  isPublishedOrClosed,
  isGeneralLeader,
  onChangeStatus,
}: Props) {
  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Status da escala</p>

          <h2 className="mt-1 text-xl font-semibold">
            {weekStatusLabels[status] || status}
          </h2>

          {isPublishedOrClosed && (
            <p className="mt-2 text-sm text-zinc-400">
              Esta escala está publicada ou encerrada.
            </p>
          )}
        </div>

        {isGeneralLeader && (
          <div className="flex flex-wrap gap-2">
            {status === "draft" && (
              <button
                onClick={() => onChangeStatus("building")}
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Iniciar montagem
              </button>
            )}

            {status === "building" && (
              <button
                onClick={() => onChangeStatus("waiting_repertoire")}
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Aguardar repertório
              </button>
            )}

            {status === "waiting_repertoire" && (
              <button
                onClick={() => onChangeStatus("waiting_confirmations")}
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Aguardar confirmações
              </button>
            )}

            {status === "waiting_confirmations" && (
              <button
                onClick={() => onChangeStatus("published")}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Publicar escala
              </button>
            )}

            {status === "published" && (
              <button
                onClick={() => onChangeStatus("closed")}
                className="rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                Encerrar escala
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
