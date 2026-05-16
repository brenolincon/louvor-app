"use client";

import { useState } from "react";
import { Crown, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const [loadedMemberId, setLoadedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openMemberForEditing(memberData: Profile) {
    setFullName(memberData.full_name);
    setPhone(memberData.phone || "");
    setBirthDate(memberData.birth_date || "");
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

  async function addLeadership(
    leadershipTypeValue: string,
    vocalGroupValue: string | null,
    instrumentValue: string | null,
  ) {
    if (!member) return;

    setLoading(true);

    const { error } = await supabase.from("member_leaderships").insert({
      member_id: member.id,
      leadership_type: leadershipTypeValue,
      vocal_group: vocalGroupValue,
      instrument: instrumentValue,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdated();
  }

  async function removeLeadership(leadershipId: string) {
    setLoading(true);

    const { error } = await supabase
      .from("member_leaderships")
      .delete()
      .eq("id", leadershipId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onUpdated();
  }

  if (!open || !member) return null;

  const currentMember = member;

  if (loadedMemberId !== currentMember.id) {
    openMemberForEditing(currentMember);
    setLoadedMemberId(currentMember.id);
  }

  const memberVocalGroups = [
    ...new Set(
      member.member_functions
        .filter((func) => func.function_type === "vocalist" && func.vocal_group)
        .map((func) => func.vocal_group as string),
    ),
  ];

  const memberInstruments = member.member_functions
    .filter(
      (func) => func.function_type === "instrumentalist" && func.instrument,
    )
    .map((func) => func.instrument as string);

  const uniqueMemberInstruments = [...new Set(memberInstruments)];

  function hasLeadership(
    leadershipTypeValue: string,
    vocalGroupValue: string | null,
    instrumentValue: string | null,
  ) {
    return currentMember.member_leaderships.some((leadership) => {
      return (
        leadership.leadership_type === leadershipTypeValue &&
        leadership.vocal_group === vocalGroupValue &&
        leadership.instrument === instrumentValue
      );
    });
  }

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="h-full w-full overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl lg:max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Detalhes do membro</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Visualize, edite e gerencie lideranças.
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
              <h3 className="text-lg font-semibold">Lideranças</h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Líder geral</p>
                    <p className="text-sm text-zinc-500">
                      Pode gerenciar todo o sistema.
                    </p>
                  </div>

                  {hasLeadership("general_leader", null, null) ? (
                    <Button
                      variant="danger"
                      onClick={() => {
                        const leadership = member.member_leaderships.find(
                          (item) => item.leadership_type === "general_leader",
                        );

                        if (leadership) {
                          removeLeadership(leadership.id);
                        }
                      }}
                      disabled={loading}
                    >
                      Remover liderança
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        addLeadership("general_leader", null, null)
                      }
                      disabled={loading}
                    >
                      Promover
                    </Button>
                  )}
                </div>
              </div>

              {memberVocalGroups.map((group) => (
                <div
                  key={group}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        Líder {vocalGroupLabels[group] || group}
                      </p>
                      <p className="text-sm text-zinc-500">
                        Pode liderar o grupo vocal que pertence.
                      </p>
                    </div>

                    {hasLeadership("vocal_leader", group, null) ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          const leadership = member.member_leaderships.find(
                            (item) =>
                              item.leadership_type === "vocal_leader" &&
                              item.vocal_group === group,
                          );

                          if (leadership) {
                            removeLeadership(leadership.id);
                          }
                        }}
                        disabled={loading}
                      >
                        Remover liderança
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          addLeadership("vocal_leader", group, null)
                        }
                        disabled={loading}
                      >
                        Promover
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {uniqueMemberInstruments.map((instrument) => (
                <div
                  key={instrument}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">Líder de {instrument}</p>
                      <p className="text-sm text-zinc-500">
                        Pode liderar apenas este instrumento.
                      </p>
                    </div>

                    {hasLeadership("instrument_leader", null, instrument) ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          const leadership = member.member_leaderships.find(
                            (item) =>
                              item.leadership_type === "instrument_leader" &&
                              item.instrument === instrument,
                          );

                          if (leadership) {
                            removeLeadership(leadership.id);
                          }
                        }}
                        disabled={loading}
                      >
                        Remover liderança
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          addLeadership("instrument_leader", null, instrument)
                        }
                        disabled={loading}
                      >
                        Promover
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {memberVocalGroups.length === 0 &&
                uniqueMemberInstruments.length === 0 && (
                  <p className="text-sm text-zinc-500">
                    Este membro não possui funções que permitam promoção para
                    liderança vocal ou instrumental.
                  </p>
                )}
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
