"use client";

import { useEffect, useState } from "react";
import {
  Music2,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";

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

const statusLabels: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
  inactive: "Inativo",
  training: "Em treinamento",
};

const statusStyles: Record<string, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",
  inactive: "border-zinc-700 bg-zinc-800 text-zinc-300",
  training: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

const leadershipLabels: Record<string, string> = {
  general_leader: "Líder geral",
  vocal_leader: "Líder vocal",
  instrument_leader: "Líder de instrumento",
};

function formatFunctions(functions: MemberFunction[]) {
  if (!functions?.length) {
    return ["Sem função ministerial"];
  }

  return functions.map((func) => {
    if (func.function_type === "vocalist") {
      return `Vocal • ${
        func.vocal_group ? vocalGroupLabels[func.vocal_group] : "-"
      }`;
    }

    if (func.function_type === "instrumentalist") {
      return `Instrumentista • ${func.instrument || "-"}`;
    }

    return func.function_type;
  });
}

function formatLeaderships(leaderships: MemberLeadership[]) {
  if (!leaderships?.length) {
    return [];
  }

  return leaderships.map((leadership) => {
    if (leadership.leadership_type === "general_leader") {
      return "Líder geral";
    }

    if (leadership.leadership_type === "vocal_leader") {
      return `Líder ${
        leadership.vocal_group
          ? vocalGroupLabels[leadership.vocal_group]
          : "vocal"
      }`;
    }

    if (leadership.leadership_type === "instrument_leader") {
      return `Líder de ${leadership.instrument || "instrumento"}`;
    }

    return (
      leadershipLabels[leadership.leadership_type] || leadership.leadership_type
    );
  });
}

export default function MembrosPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function fetchMembers() {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        phone,
        birth_date,
        status,
        ministry_role,
        created_at,
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
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      setLoading(true);

      const data = await fetchMembers();

      if (!isMounted) return;

      setMembers(data);
      setLoading(false);
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateStatus(memberId: string, status: string) {
    setUpdating(true);

    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", memberId);

    if (error) {
      setUpdating(false);
      alert(error.message);
      return;
    }

    const updatedMembers = await fetchMembers();
    setMembers(updatedMembers);
    setUpdating(false);
  }

  async function deactivateSelectedMember() {
    if (!selectedMember) return;

    await updateStatus(selectedMember.id, "inactive");

    setModalOpen(false);
    setSelectedMember(null);
  }

  const pendingCount = members.filter(
    (member) => member.status === "pending",
  ).length;
  const approvedCount = members.filter(
    (member) => member.status === "approved",
  ).length;
  const inactiveCount = members.filter(
    (member) => member.status === "inactive",
  ).length;

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Users size={24} />
        </div>

        <h1 className="text-3xl font-bold">Membros</h1>
        <p className="mt-2 text-zinc-400">
          Gerencie integrantes, funções ministeriais, aprovações e status.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Pendentes</p>
          <h2 className="mt-2 text-3xl font-bold">{pendingCount}</h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Aprovados</p>
          <h2 className="mt-2 text-3xl font-bold">{approvedCount}</h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">Inativos</p>
          <h2 className="mt-2 text-3xl font-bold">{inactiveCount}</h2>
        </Card>
      </div>

      {loading && (
        <Card>
          <p className="text-zinc-400">Carregando membros...</p>
        </Card>
      )}

      {!loading && members.length === 0 && (
        <Card>
          <p className="text-zinc-400">Nenhum membro cadastrado ainda.</p>
        </Card>
      )}

      {!loading && members.length > 0 && (
        <div className="grid gap-4">
          {members.map((member) => {
            const functions = formatFunctions(member.member_functions);
            const leaderships = formatLeaderships(member.member_leaderships);

            return (
              <Card key={member.id}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {member.full_name}
                      </h2>

                      {member.phone && (
                        <p className="mt-1 text-sm text-zinc-500">
                          Telefone: {member.phone}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {functions.map((func) => (
                        <span
                          key={func}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300"
                        >
                          <Music2 size={13} />
                          {func}
                        </span>
                      ))}
                    </div>

                    {leaderships.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {leaderships.map((leadership) => (
                          <span
                            key={leadership}
                            className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300"
                          >
                            <ShieldCheck size={13} />
                            {leadership}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs ${
                        statusStyles[member.status] ||
                        "border-zinc-700 bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {statusLabels[member.status] || member.status}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {member.status === "pending" && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => updateStatus(member.id, "training")}
                          >
                            <span className="flex items-center gap-2">
                              <UserCog size={16} />
                              Treinamento
                            </span>
                          </Button>

                          <Button
                            onClick={() => updateStatus(member.id, "approved")}
                          >
                            <span className="flex items-center gap-2">
                              <UserCheck size={16} />
                              Aprovar
                            </span>
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => updateStatus(member.id, "rejected")}
                          >
                            Recusar
                          </Button>
                        </>
                      )}

                      {member.status === "training" && (
                        <>
                          <Button
                            onClick={() => updateStatus(member.id, "approved")}
                          >
                            Aprovar
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => updateStatus(member.id, "rejected")}
                          >
                            Recusar
                          </Button>
                        </>
                      )}

                      {member.status === "rejected" && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => updateStatus(member.id, "training")}
                          >
                            Treinamento
                          </Button>

                          <Button
                            onClick={() => updateStatus(member.id, "approved")}
                          >
                            Aprovar
                          </Button>
                        </>
                      )}

                      {member.status === "approved" && (
                        <Button
                          variant="danger"
                          onClick={() => {
                            setSelectedMember(member);
                            setModalOpen(true);
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <UserMinus size={16} />
                            Excluir membro
                          </span>
                        </Button>
                      )}

                      {member.status === "inactive" && (
                        <Button
                          onClick={() => updateStatus(member.id, "approved")}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={modalOpen}
        title="Excluir membro?"
        description={`Tem certeza que deseja remover ${
          selectedMember?.full_name || "este membro"
        } dos membros ativos? Ele não aparecerá mais para novas escalas.`}
        confirmText="Excluir membro"
        cancelText="Cancelar"
        loading={updating}
        onConfirm={deactivateSelectedMember}
        onCancel={() => {
          setModalOpen(false);
          setSelectedMember(null);
        }}
      />
    </AppLayout>
  );
}
