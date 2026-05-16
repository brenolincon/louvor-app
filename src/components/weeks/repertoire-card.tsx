import { Music } from "lucide-react";
import { Card } from "@/components/ui/card";

type RepertoireSong = {
  id: string;
  song_name: string;
  version_name: string | null;
  key_signature: string | null;
  song_order: number | null;
};

type WeekRepertoire = {
  id: string;
  service_day: string;
  playlist_url: string | null;
  approval_status: string;
  week_repertoire_songs: RepertoireSong[];
};

type Props = {
  repertoires: WeekRepertoire[];

  selectedServiceDay: string;
  playlistUrl: string;
  songName: string;
  versionName: string;
  keySignature: string;

  saving: boolean;

  onServiceDayChange: (value: string) => void;
  onPlaylistUrlChange: (value: string) => void;
  onSongNameChange: (value: string) => void;
  onVersionNameChange: (value: string) => void;
  onKeySignatureChange: (value: string) => void;

  onSubmit: (e: React.FormEvent) => void;
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

export function RepertoireCard({
  repertoires,
  selectedServiceDay,
  playlistUrl,
  songName,
  versionName,
  keySignature,
  saving,
  onServiceDayChange,
  onPlaylistUrlChange,
  onSongNameChange,
  onVersionNameChange,
  onKeySignatureChange,
  onSubmit,
}: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <Music className="text-violet-400" size={22} />
        <h2 className="text-xl font-semibold">Repertório</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <select
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
          value={selectedServiceDay}
          onChange={(e) => onServiceDayChange(e.target.value)}
          required
        >
          <option value="">Culto</option>
          <option value="sunday">Domingo</option>
          <option value="wednesday">Quarta</option>
        </select>

        <input
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
          placeholder="Playlist única do YouTube/Spotify"
          value={playlistUrl}
          onChange={(e) => onPlaylistUrlChange(e.target.value)}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
            placeholder="Nome da música"
            value={songName}
            onChange={(e) => onSongNameChange(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
            placeholder="Versão"
            value={versionName}
            onChange={(e) => onVersionNameChange(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white"
            placeholder="Tom"
            value={keySignature}
            onChange={(e) => onKeySignatureChange(e.target.value)}
          />
        </div>

        <button
          disabled={saving}
          className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Adicionar música ao repertório"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {repertoires.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nenhum repertório criado ainda.
          </p>
        )}

        {repertoires.map((repertoire) => (
          <div
            key={repertoire.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Repertório {serviceDayLabels[repertoire.service_day]}
                </h3>

                {repertoire.playlist_url ? (
                  <a
                    href={repertoire.playlist_url}
                    target="_blank"
                    className="mt-1 inline-block text-sm text-violet-400 hover:text-violet-300"
                  >
                    Abrir playlist
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-zinc-500">Sem playlist</p>
                )}
              </div>

              <span className="w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                {approvalLabels[repertoire.approval_status] ||
                  repertoire.approval_status}
              </span>
            </div>

            <div className="space-y-2">
              {repertoire.week_repertoire_songs.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Nenhuma música adicionada.
                </p>
              )}

              {repertoire.week_repertoire_songs.map((song, index) => (
                <div
                  key={song.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
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
          </div>
        ))}
      </div>
    </Card>
  );
}
