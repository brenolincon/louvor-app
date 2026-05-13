"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  member_type: string | null;
  vocal_role: string | null;
  vocal_group: string | null;
  instrument: string | null;
  status: string;
};

const statusLabels: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
  inactive: "Inativo",
  training: "Em treinamento",
};

const memberTypeLabels: Record<string, string> = {
  vocalist: "Vocal",
  instrumentalist: "Instrumentista",
};

const vocalRoleLabels: Record<string, string> = {
  minister: "Ministro",
  backvocal: "Backvocal",
};

const vocalGroupLabels: Record<string, string> = {
  unit: "Unit",
  ative: "Ative",
  teens: "Geração Teens",
};

export default function MembrosPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMembers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
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
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", memberId);

    if (error) {
      alert(error.message);
      return;
    }

    const updatedMembers = await fetchMembers();
    setMembers(updatedMembers);
  }

  function getMemberDescription(member: Profile) {
    if (member.member_type === "vocalist") {
      const role = member.vocal_role
        ? vocalRoleLabels[member.vocal_role] || member.vocal_role
        : "Vocal";

      const group = member.vocal_group
        ? vocalGroupLabels[member.vocal_group] || member.vocal_group
        : "-";

      return `${role} • ${group}`;
    }

    if (member.member_type === "instrumentalist") {
      return member.instrument || "Instrumentista";
    }

    return "-";
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Users size={24} />
        </div>

        <h1 className="text-3xl font-bold">Membros</h1>
        <p className="mt-2 text-zinc-400">
          Gerencie integrantes, aprovações e status ministerial.
        </p>
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
          {members.map((member) => (
            <Card key={member.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{member.full_name}</h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    {member.member_type
                      ? memberTypeLabels[member.member_type] ||
                        member.member_type
                      : "-"}{" "}
                    • {getMemberDescription(member)}
                  </p>

                  {member.phone && (
                    <p className="mt-1 text-sm text-zinc-500">
                      Telefone: {member.phone}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                    {statusLabels[member.status] || member.status}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {member.status !== "training" && (
                      <Button
                        variant="secondary"
                        onClick={() => updateStatus(member.id, "training")}
                      >
                        Treinamento
                      </Button>
                    )}

                    {member.status !== "approved" && (
                      <Button
                        onClick={() => updateStatus(member.id, "approved")}
                      >
                        Aprovar
                      </Button>
                    )}

                    {member.status !== "rejected" && (
                      <Button
                        variant="danger"
                        onClick={() => updateStatus(member.id, "rejected")}
                      >
                        Recusar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
