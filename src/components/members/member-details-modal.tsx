"use client";

import { useState } from "react";
import { Crown, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
  ministry_role: string;
  created_at: string;
  member_functions: MemberFunction[];
  member_leaderships: MemberLeadership[];
};

type Props = {
  member: Profile | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

export function MemberDetailsModal({
  member,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [leadershipType, setLeadershipType] = useState("");
  const [leadershipVocalGroup, setLeadershipVocalGroup] = useState("");
  const [leadershipInstrument, setLeadershipInstrument] = useState("");

  const [loadedMemberId, setLoadedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openMemberForEditing(memberData: Profile) {
    setFullName(memberData.full_name);
    setPhone(memberData.phone || "");
    setBirthDate(memberData.birth_date || "");
    setLeadershipType("");
    setLeadershipVocalGroup("");
    setLeadershipInstrument("");
  }

  function handleClose() {
    setLoadedMemberId(null);
    onClose();
  }

  async function updateMemberInfo() {
    if (!member) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        birth_date: birthDate,
      })
      .eq("id", member.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdated();
  }

  async function promoteLeadership() {
    if (!member) return;

    if (!leadershipType) {
      alert("Selecione o tipo de liderança.");
      return;
    }

    if (leadershipType === "vocal_leader" && !leadershipVocalGroup) {
      alert("Selecione o grupo vocal.");
      return;
    }

    if (leadershipType === "instrument_leader" && !leadershipInstrument) {
      alert("Selecione o instrumento.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("member_leaderships").insert({
      member_id: member.id,
      leadership_type: leadershipType,
      vocal_group:
        leadershipType === "vocal_leader" ? leadershipVocalGroup : null,
      instrument:
        leadershipType === "instrument_leader" ? leadershipInstrument : null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setLeadershipType("");
    setLeadershipVocalGroup("");
    setLeadershipInstrument("");

    onUpdated();
  }

  async function updateStatus(status: string) {
    if (!member) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", member.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdated();
  }

  if (!open || !member) return null;

  if (loadedMemberId !== member.id) {
    openMemberForEditing(member);
    setLoadedMemberId(member.id);
  }

  const canPromoteVocalLeader = member.member_functions.some(
    (func) => func.function_type === "vocalist",
  );

  const memberInstruments = member.member_functions
    .filter(
      (func) => func.function_type === "instrumentalist" && func.instrument,
    )
    .map((func) => func.instrument as string);

  const uniqueMemberInstruments = [...new Set(memberInstruments)];

  const canPromoteInstrumentLeader = uniqueMemberInstruments.length > 0;

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="h-full w-full overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl lg:max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Detalhes do membro</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Visualize, edite e promova lideranças.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold">Informações pessoais</h3>

              <Button onClick={updateMemberInfo} disabled={loading}>
                <span className="flex items-center gap-2">
                  <Save size={16} />
                  Salvar
                </span>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <h3 className="mb-4 text-lg font-semibold">Funções ministeriais</h3>

            <div className="space-y-3">
              {member.member_functions.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Nenhuma função ministerial cadastrada.
                </p>
              )}

              {member.member_functions.map((func) => (
                <div
                  key={func.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  {func.function_type === "vocalist" && (
                    <>
                      <p className="font-medium">Vocal</p>
                      <p className="text-sm text-zinc-400">
                        Grupo:{" "}
                        {func.vocal_group
                          ? vocalGroupLabels[func.vocal_group]
                          : "-"}
                      </p>
                    </>
                  )}

                  {func.function_type === "instrumentalist" && (
                    <>
                      <p className="font-medium">Instrumentista</p>
                      <p className="text-sm text-zinc-400">
                        Instrumento: {func.instrument || "-"}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="text-violet-400" size={20} />
              <h3 className="text-lg font-semibold">Promover liderança</h3>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Select
                value={leadershipType}
                onChange={(e) => setLeadershipType(e.target.value)}
              >
                <option value="">Tipo de liderança</option>
                <option value="general_leader">Líder geral</option>

                {canPromoteVocalLeader && (
                  <option value="vocal_leader">Líder vocal</option>
                )}

                {canPromoteInstrumentLeader && (
                  <option value="instrument_leader">
                    Líder de instrumento
                  </option>
                )}
              </Select>

              {leadershipType === "vocal_leader" && (
                <Select
                  value={leadershipVocalGroup}
                  onChange={(e) => setLeadershipVocalGroup(e.target.value)}
                >
                  <option value="">Grupo vocal</option>
                  <option value="unit">Unit</option>
                  <option value="ative">Ative</option>
                  <option value="teens">Geração Teens</option>
                </Select>
              )}

              {leadershipType === "instrument_leader" && (
                <Select
                  value={leadershipInstrument}
                  onChange={(e) => setLeadershipInstrument(e.target.value)}
                >
                  <option value="">Instrumento</option>

                  {uniqueMemberInstruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </Select>
              )}

              <Button onClick={promoteLeadership} disabled={loading}>
                Promover
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {member.member_leaderships.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Este membro ainda não possui liderança.
                </p>
              )}

              {member.member_leaderships.map((leadership) => (
                <div
                  key={leadership.id}
                  className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200"
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
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <h3 className="mb-4 text-lg font-semibold">Ações</h3>

            <div className="flex flex-wrap gap-2">
              {member.status !== "approved" && (
                <Button
                  onClick={() => updateStatus("approved")}
                  disabled={loading}
                >
                  Aprovar
                </Button>
              )}

              {member.status !== "training" && (
                <Button
                  variant="secondary"
                  onClick={() => updateStatus("training")}
                  disabled={loading}
                >
                  Treinamento
                </Button>
              )}

              {member.status !== "rejected" && (
                <Button
                  variant="danger"
                  onClick={() => updateStatus("rejected")}
                  disabled={loading}
                >
                  Recusar
                </Button>
              )}

              {member.status !== "inactive" && (
                <Button
                  variant="danger"
                  onClick={() => updateStatus("inactive")}
                  disabled={loading}
                >
                  Inativar
                </Button>
              )}

              {member.status === "inactive" && (
                <Button
                  onClick={() => updateStatus("approved")}
                  disabled={loading}
                >
                  Reativar
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
