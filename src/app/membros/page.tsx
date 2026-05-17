"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";

import { MembersGrid } from "@/components/members/members-grid";
import { MemberDetailsModal } from "@/components/members/member-details-modal";

import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";
import { fetchMembers } from "@/lib/member-service";

import { MemberProfile } from "@/types/members";

export default function MembrosPage() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(
    null,
  );
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshMembers() {
    const updatedMembers = await fetchMembers();

    setMembers(updatedMembers);

    if (selectedMember) {
      const updatedSelected = updatedMembers.find(
        (member) => member.id === selectedMember.id,
      );

      setSelectedMember(updatedSelected || null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      setLoading(true);

      try {
        const permissions = await getCurrentUserPermissions();
        const data = await fetchMembers();

        if (!isMounted) return;

        setCanManageMembers(permissions?.isGeneralLeader === true);
        setMembers(data);
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "Erro ao carregar membros.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Users size={24} />
        </div>

        <h1 className="text-3xl font-bold">Membros</h1>

        <p className="mt-2 text-zinc-400">
          Visualize membros, funções ministeriais e lideranças.
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
        <MembersGrid
          members={members}
          canManageMembers={canManageMembers}
          onSelectMember={setSelectedMember}
        />
      )}

      {canManageMembers && (
        <MemberDetailsModal
          open={!!selectedMember}
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdated={refreshMembers}
        />
      )}
    </AppLayout>
  );
}
