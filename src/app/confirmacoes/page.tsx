"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InstrumentConfirmation = {
  id: string;
  instrument: string;
  status: string;
  ministry_weeks: {
    sunday_date: string;
    wednesday_date: string;
    rehearsal_date: string;
  } | null;
};

type VocalConfirmation = {
  id: string;
  role: string;
  service_day: string;
  status: string;
  ministry_weeks: {
    sunday_date: string;
    wednesday_date: string;
    rehearsal_date: string;
  } | null;
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado",
  justified: "Justificado",
  substituted: "Substituído",
};

const roleLabels: Record<string, string> = {
  minister: "Ministro",
  backvocal: "Backvocal",
};

const serviceDayLabels: Record<string, string> = {
  sunday: "Domingo",
  wednesday: "Quarta",
};

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function ConfirmacoesPage() {
  const [instrumentConfirmations, setInstrumentConfirmations] = useState<
    InstrumentConfirmation[]
  >([]);

  const [vocalConfirmations, setVocalConfirmations] = useState<
    VocalConfirmation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadConfirmations = useCallback(async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: instrumentsData, error: instrumentsError } = await supabase
      .from("week_instrument_assignments")
      .select(
        `
        id,
        instrument,
        status,
        ministry_weeks (
          sunday_date,
          wednesday_date,
          rehearsal_date
        )
      `,
      )
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    if (instrumentsError) {
      alert(instrumentsError.message);
      setLoading(false);
      return;
    }

    const { data: vocalsData, error: vocalsError } = await supabase
      .from("week_vocal_assignments")
      .select(
        `
        id,
        role,
        service_day,
        status,
        ministry_weeks (
          sunday_date,
          wednesday_date,
          rehearsal_date
        )
      `,
      )
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });

    if (vocalsError) {
      alert(vocalsError.message);
      setLoading(false);
      return;
    }

    setInstrumentConfirmations(
      (instrumentsData || []) as unknown as InstrumentConfirmation[],
    );

    setVocalConfirmations((vocalsData || []) as unknown as VocalConfirmation[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      await loadConfirmations();
    }

    init();
  }, [loadConfirmations]);

  async function updateInstrumentStatus(id: string, status: string) {
    const { error } = await supabase
      .from("week_instrument_assignments")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadConfirmations();
  }

  async function updateVocalStatus(id: string, status: string) {
    const { error } = await supabase
      .from("week_vocal_assignments")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadConfirmations();
  }

  const hasConfirmations =
    instrumentConfirmations.length > 0 || vocalConfirmations.length > 0;

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <ClipboardCheck size={24} />
        </div>

        <h1 className="text-3xl font-bold">Confirmações</h1>
        <p className="mt-2 text-zinc-400">
          Confirme ou recuse suas escalas pendentes.
        </p>
      </div>

      {loading && (
        <Card>
          <p className="text-zinc-400">Carregando confirmações...</p>
        </Card>
      )}

      {!loading && !hasConfirmations && (
        <Card>
          <p className="text-zinc-400">
            Você ainda não possui escalas para confirmar.
          </p>
        </Card>
      )}

      {!loading && hasConfirmations && (
        <div className="grid gap-4">
          {instrumentConfirmations.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Instrumento: {item.instrument}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Semana {formatDate(item.ministry_weeks?.sunday_date)} a{" "}
                    {formatDate(item.ministry_weeks?.wednesday_date)}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Ensaio: {formatDate(item.ministry_weeks?.rehearsal_date)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                    {statusLabels[item.status] || item.status}
                  </span>

                  {item.status === "pending" && (
                    <>
                      <Button
                        onClick={() =>
                          updateInstrumentStatus(item.id, "confirmed")
                        }
                      >
                        Confirmar
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() =>
                          updateInstrumentStatus(item.id, "declined")
                        }
                      >
                        Recusar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {vocalConfirmations.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {roleLabels[item.role] || item.role} -{" "}
                    {serviceDayLabels[item.service_day] || item.service_day}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Semana {formatDate(item.ministry_weeks?.sunday_date)} a{" "}
                    {formatDate(item.ministry_weeks?.wednesday_date)}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    Ensaio: {formatDate(item.ministry_weeks?.rehearsal_date)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                    {statusLabels[item.status] || item.status}
                  </span>

                  {item.status === "pending" && (
                    <>
                      <Button
                        onClick={() => updateVocalStatus(item.id, "confirmed")}
                      >
                        Confirmar
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => updateVocalStatus(item.id, "declined")}
                      >
                        Recusar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
