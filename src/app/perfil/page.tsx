"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type MemberFunction = {
  id: string;
  function_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

type MemberLeadership = {
  id: string;
  leadership_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  status: string;
  member_functions: MemberFunction[];
  member_leaderships: MemberLeadership[];
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        phone,
        birth_date,
        status,
        member_functions (
          id,
          function_type,
          vocal_group,
          instrument
        ),
        member_leaderships (
          id,
          leadership_type,
          vocal_group,
          instrument
        )
      `,
      )
      .eq("id", user.id)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const currentProfile = data as Profile;

    setProfile(currentProfile);
    setFullName(currentProfile.full_name);
    setPhone(currentProfile.phone || "");
    setBirthDate(currentProfile.birth_date || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      await loadProfile();
    }

    init();
  }, [loadProfile]);

  async function saveProfile() {
    if (!profile) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        birth_date: birthDate,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await loadProfile();
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <User size={24} />
        </div>

        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="mt-2 text-zinc-400">
          Visualize suas funções ministeriais e atualize seus dados pessoais.
        </p>
      </div>

      {loading && (
        <Card>
          <p className="text-zinc-400">Carregando perfil...</p>
        </Card>
      )}

      {!loading && profile && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-xl font-semibold">Informações pessoais</h2>

            <div className="space-y-4">
              <Input
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />

              <Button
                onClick={saveProfile}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold">Dados ministeriais</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500">Status</p>
                <p className="mt-1 font-medium">{profile.status}</p>
              </div>

              <div>
                <p className="text-sm text-zinc-500">Funções</p>

                <div className="mt-2 space-y-2">
                  {profile.member_functions.length === 0 && (
                    <p className="text-sm text-zinc-500">
                      Nenhuma função cadastrada.
                    </p>
                  )}

                  {profile.member_functions.map((func) => (
                    <div
                      key={func.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm"
                    >
                      {func.function_type === "vocalist" && (
                        <p>
                          Vocal •{" "}
                          {func.vocal_group
                            ? vocalGroupLabels[func.vocal_group]
                            : "-"}
                        </p>
                      )}

                      {func.function_type === "instrumentalist" && (
                        <p>Instrumentista • {func.instrument}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-500">Lideranças</p>

                <div className="mt-2 space-y-2">
                  {profile.member_leaderships.length === 0 && (
                    <p className="text-sm text-zinc-500">
                      Nenhuma liderança cadastrada.
                    </p>
                  )}

                  {profile.member_leaderships.map((leadership) => (
                    <div
                      key={leadership.id}
                      className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-sm text-violet-200"
                    >
                      {leadership.leadership_type === "general_leader" &&
                        "Líder geral"}

                      {leadership.leadership_type === "vocal_leader" &&
                        `Líder ${
                          leadership.vocal_group
                            ? vocalGroupLabels[leadership.vocal_group]
                            : "vocal"
                        }`}

                      {leadership.leadership_type === "instrument_leader" &&
                        `Líder de ${leadership.instrument}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
