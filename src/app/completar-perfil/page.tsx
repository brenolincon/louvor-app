"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
      alert("Usuário não autenticado.");
      setLoading(false);
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
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Completar perfil</h1>

        <input
          className="w-full border rounded p-3"
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          className="w-full border rounded p-3"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full border rounded p-3"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />

        <select
          className="w-full border rounded p-3"
          value={memberType}
          onChange={(e) => setMemberType(e.target.value)}
          required
        >
          <option value="">Tipo de integrante</option>
          <option value="vocalist">Cantor</option>
          <option value="instrumentalist">Instrumentista</option>
        </select>

        {memberType === "vocalist" && (
          <select
            className="w-full border rounded p-3"
            value={vocalRole}
            onChange={(e) => setVocalRole(e.target.value)}
            required
          >
            <option value="">Função vocal</option>
            <option value="minister">Ministro</option>
            <option value="backvocal">Backvocal</option>
          </select>
        )}

        {memberType === "instrumentalist" && (
          <input
            className="w-full border rounded p-3"
            placeholder="Instrumento"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            required
          />
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white rounded p-3"
        >
          {loading ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </main>
  );
}