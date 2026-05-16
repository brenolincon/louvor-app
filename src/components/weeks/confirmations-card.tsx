"use client";

import { CalendarCheck2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Assignment = {
  id: string;
  role: string;
  service_day?: string;
  instrument?: string;
  status: string;

  profiles:
    | {
        full_name: string;
      }[]
    | null;
};

type Props = {
  title: string;
  assignments: Assignment[];

  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
  justified: "Justificado",
  substituted: "Substituído",
};

export function ConfirmationsCard({
  title,
  assignments,
  onConfirm,
  onDecline,
}: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <CalendarCheck2 className="text-violet-400" size={22} />

        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="space-y-3">
        {assignments.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma confirmação pendente.</p>
        )}

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-medium">
                  {assignment.profiles?.[0]?.full_name || "-"}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  {assignment.instrument || assignment.role}
                </p>

                {assignment.service_day && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {assignment.service_day === "sunday" ? "Domingo" : "Quarta"}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  {statusLabels[assignment.status]}
                </span>

                {assignment.status === "pending" && (
                  <div className="flex gap-2">
                    <Button onClick={() => onConfirm(assignment.id)}>
                      Confirmar
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => onDecline(assignment.id)}
                    >
                      Recusar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
