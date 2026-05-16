"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/get-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function CompletarPerfilPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [isVocalist, setIsVocalist] = useState(false);
  const [isInstrumentalist, setIsInstrumentalist] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const instruments = ["Bateria", "Baixo", "Teclado", "Violão", "Guitarra"];

  function toggleInstrument(instrument: string) {
    setSelectedInstruments((current) =>
      current.includes(instrument)
        ? current.filter((item) => item !== instrument)
        : [...current, instrument],
    );
  }

  function getVocalGroup(date: string) {
    const birth = new Date(date);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age >= 30) return "unit";
    if (age >= 18) return "ative";
    if (age >= 13) return "teens";

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isVocalist && !isInstrumentalist) {
      alert("Selecione pelo menos uma função ministerial.");
      return;
    }

    if (isInstrumentalist && selectedInstruments.length === 0) {
      alert("Selecione pelo menos um instrumento.");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const existingProfile = await getProfile(user.id);

    if (existingProfile) {
      setLoading(false);
      router.push("/dashboard");
      return;
    }

    const vocalGroup = isVocalist ? getVocalGroup(birthDate) : null;

    if (isVocalist && !vocalGroup) {
      setLoading(false);
      alert("A idade mínima para cadastro vocal é 13 anos.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      phone,
      birth_date: birthDate,

      // Mantemos esses campos antigos só para compatibilidade temporária.
      member_type: isVocalist
        ? "vocalist"
        : isInstrumentalist
          ? "instrumentalist"
          : null,
      vocal_role: null,
      vocal_group: vocalGroup,
      instrument: isInstrumentalist ? selectedInstruments.join(", ") : null,

      status: "pending",
      ministry_role: "member",
    });

    if (profileError) {
      setLoading(false);
      alert(profileError.message);
      return;
    }

    const functionsToInsert = [];

    if (isVocalist) {
      functionsToInsert.push({
        member_id: user.id,
        function_type: "vocalist",
        vocal_group: vocalGroup,
        instrument: null,
      });
    }

    if (isInstrumentalist) {
      selectedInstruments.forEach((instrument) => {
        functionsToInsert.push({
          member_id: user.id,
          function_type: "instrumentalist",
          vocal_group: null,
          instrument,
        });
      });
    }

    const { error: functionsError } = await supabase
      .from("member_functions")
      .insert(functionsToInsert);

    setLoading(false);

    if (functionsError) {
      alert(functionsError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-zinc-800 bg-zinc-900/80">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
              <UserPlus size={24} />
            </div>

            <h1 className="text-3xl font-bold">Completar perfil</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Preencha seus dados ministeriais para solicitar aprovação.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
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
                required
              />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="mb-3 text-sm font-medium text-zinc-300">
                Funções ministeriais
              </p>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <input
                    type="checkbox"
                    checked={isVocalist}
                    onChange={(e) => setIsVocalist(e.target.checked)}
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="font-medium">Sou cantor</p>
                    <p className="text-sm text-zinc-500">
                      O grupo vocal será definido automaticamente pela idade.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <input
                    type="checkbox"
                    checked={isInstrumentalist}
                    onChange={(e) => setIsInstrumentalist(e.target.checked)}
                    className="h-4 w-4"
                  />

                  <div>
                    <p className="font-medium">Sou instrumentista</p>
                    <p className="text-sm text-zinc-500">
                      Informe seu instrumento principal.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {isInstrumentalist && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Selecione seus instrumentos
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {instruments.map((instrument) => (
                    <label
                      key={instrument}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInstruments.includes(instrument)}
                        onChange={() => toggleInstrument(instrument)}
                        className="h-4 w-4"
                      />

                      <span className="font-medium">{instrument}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isVocalist && birthDate && (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-violet-200">
                Grupo vocal calculado:{" "}
                <strong>
                  {getVocalGroup(birthDate) || "Fora da idade mínima"}
                </strong>
              </div>
            )}

            <Button disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Salvar perfil"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
