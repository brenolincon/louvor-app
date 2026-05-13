"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/get-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function CompletarPerfilPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [memberType, setMemberType] = useState("");
  const [vocalRole, setVocalRole] = useState("");
  const [instrument, setInstrument] = useState("");
  const [loading, setLoading] = useState(false);

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

    const vocalGroup =
      memberType === "vocalist" ? getVocalGroup(birthDate) : null;

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      phone,
      birth_date: birthDate,
      member_type: memberType,
      vocal_role: memberType === "vocalist" ? vocalRole : null,
      vocal_group: vocalGroup,
      instrument: memberType === "instrumentalist" ? instrument : null,
      status: "pending",
      ministry_role: "member",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
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

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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

            <Select
              value={memberType}
              onChange={(e) => setMemberType(e.target.value)}
              required
            >
              <option value="">Tipo de integrante</option>
              <option value="vocalist">Cantor</option>
              <option value="instrumentalist">Instrumentista</option>
            </Select>

            {memberType === "vocalist" && (
              <Select
                value={vocalRole}
                onChange={(e) => setVocalRole(e.target.value)}
                required
              >
                <option value="">Função vocal</option>
                <option value="minister">Ministro</option>
                <option value="backvocal">Backvocal</option>
              </Select>
            )}

            {memberType === "instrumentalist" && (
              <Input
                placeholder="Instrumento"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                required
              />
            )}

            <Button disabled={loading} className="md:col-span-2">
              {loading ? "Salvando..." : "Salvar perfil"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}