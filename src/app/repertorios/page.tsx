"use client";

import { useCallback, useEffect, useState } from "react";
import { Music } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

type Repertoire = {
  id: string;
  service_day: string;
  playlist_url: string | null;
  approval_status: string;
  ministry_weeks: {
    id: string;
    sunday_date: string;
    wednesday_date: string;
    vocal_group: string;
  } | null;
  week_repertoire_songs: {
    id: string;
    song_name: string;
    version_name: string | null;
    key_signature: string | null;
    song_order: number | null;
  }[];
};

const serviceDayLabels: Record<string, string> = {
  sunday: "Domingo",
  wednesday: "Quarta",
};

const approvalLabels: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
};

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function RepertoriosPage() {
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRepertoires = useCallback(async () => {
    setLoading(true);

    const permissions = await getCurrentUserPermissions();

    if (!permissions) {
      setLoading(false);
      return;
    }

    if (permissions.isAnyLeader) {
      const { data, error } = await supabase
        .from("week_repertoires")
        .select(
          `
          id,
          service_day,
          playlist_url,
          approval_status,
          ministry_weeks (
            id,
            sunday_date,
            wednesday_date,
            vocal_group
          ),
          week_repertoire_songs (
            id,
            song_name,
            version_name,
            key_signature,
            song_order
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setRepertoires((data || []) as unknown as Repertoire[]);
      setLoading(false);
      return;
    }

    const { data: instrumentAssignments } = await supabase
      .from("week_instrument_assignments")
      .select("week_id")
      .eq("member_id", permissions.userId);

    const { data: vocalAssignments } = await supabase
      .from("week_vocal_assignments")
      .select("week_id")
      .eq("member_id", permissions.userId);

    const weekIds = Array.from(
      new Set([
        ...(instrumentAssignments || []).map((item) => item.week_id),
        ...(vocalAssignments || []).map((item) => item.week_id),
      ]),
    );

    if (weekIds.length === 0) {
      setRepertoires([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("week_repertoires")
      .select(
        `
        id,
        service_day,
        playlist_url,
        approval_status,
        ministry_weeks (
          id,
          sunday_date,
          wednesday_date,
          vocal_group
        ),
        week_repertoire_songs (
          id,
          song_name,
          version_name,
          key_signature,
          song_order
        )
      `,
      )
      .in("week_id", weekIds)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setRepertoires((data || []) as unknown as Repertoire[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      await loadRepertoires();
    }

    init();
  }, [loadRepertoires]);

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Music size={24} />
        </div>

        <h1 className="text-3xl font-bold">Repertórios</h1>
        <p className="mt-2 text-zinc-400">
          Visualize os repertórios disponíveis para suas escalas.
        </p>
      </div>

      {loading && (
        <Card>
          <p className="text-zinc-400">Carregando repertórios...</p>
        </Card>
      )}

      {!loading && repertoires.length === 0 && (
        <Card>
          <p className="text-zinc-400">
            Nenhum repertório disponível para você.
          </p>
        </Card>
      )}

      {!loading && repertoires.length > 0 && (
        <div className="grid gap-4">
          {repertoires.map((repertoire) => (
            <Card key={repertoire.id}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Repertório {serviceDayLabels[repertoire.service_day]}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Semana {formatDate(repertoire.ministry_weeks?.sunday_date)}{" "}
                    a {formatDate(repertoire.ministry_weeks?.wednesday_date)}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                  {approvalLabels[repertoire.approval_status] ||
                    repertoire.approval_status}
                </span>
              </div>

              {repertoire.playlist_url && (
                <a
                  href={repertoire.playlist_url}
                  target="_blank"
                  className="mb-4 inline-block text-sm text-violet-400 hover:text-violet-300"
                >
                  Abrir playlist
                </a>
              )}

              <div className="space-y-2">
                {repertoire.week_repertoire_songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                  >
                    <p className="font-medium">
                      {index + 1}. {song.song_name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {song.version_name || "Sem versão"} •{" "}
                      {song.key_signature || "Sem tom"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
