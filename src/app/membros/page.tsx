"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { MemberCard } from "@/components/members/member-card";
import { MemberDetailsModal } from "@/components/members/member-details-modal";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

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

export default function MembrosPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManageMembers, setCanManageMembers] = useState(false);

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

      const permissions = await getCurrentUserPermissions();
      setCanManageMembers(!!permissions?.isGeneralLeader);
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

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Users size={24} />
        </div>

        <h1 className="text-3xl font-bold">Membros</h1>
        <p className="mt-2 text-zinc-400">
          Gerencie integrantes, funções ministeriais e lideranças.
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
            <MemberCard
              key={member.id}
              member={member}
              onClick={() => {
                if (canManageMembers) {
                  setSelectedMember(member);
                }
              }}
            />
          ))}
        </div>
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
