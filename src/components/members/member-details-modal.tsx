"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import {
  approveMember,
  promoteInstrumentLeader,
  promoteVocalLeader,
  rejectMember,
  removeInstrumentLeader,
  removeVocalLeader,
  updateMemberProfile,
} from "@/lib/member-actions";

import { MemberProfile } from "@/types/members";

type Props = {
  open: boolean;
  member: MemberProfile | null;
  onClose: () => void;
  onUpdated: () => Promise<void>;
};

export function MemberDetailsModal({
  open,
  member,
  onClose,
  onUpdated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loadedMemberId, setLoadedMemberId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  function loadMemberData(currentMember: MemberProfile) {
    setFullName(currentMember.full_name || "");
    setPhone(currentMember.phone || "");
    setBirthDate(currentMember.birth_date || "");
  }

  function handleClose() {
    setLoadedMemberId(null);
    onClose();
  }

  const currentMember = member!;

  const vocalFunction = useMemo(() => {
    return currentMember?.member_functions.find(
      (func) => func.function_type === "vocalist",
    );
  }, [currentMember]);

  const instrumentalFunctions = useMemo(() => {
    return (
      currentMember?.member_functions.filter(
        (func) => func.function_type === "instrumentalist",
      ) || []
    );
  }, [currentMember]);

  const vocalLeadership = useMemo(() => {
    return currentMember?.member_leaderships.find(
      (leadership) => leadership.leadership_type === "vocal_leader",
    );
  }, [currentMember]);

  const instrumentLeaderships = useMemo(() => {
    return (
      currentMember?.member_leaderships.filter(
        (leadership) => leadership.leadership_type === "instrument_leader",
      ) || []
    );
  }, [currentMember]);

  if (!open || !currentMember) {
    return null;
  }

  if (loadedMemberId !== currentMember.id) {
    loadMemberData(currentMember);
    setLoadedMemberId(currentMember.id);
  }
  async function handleSaveProfile() {
    try {
      setSaving(true);

      await updateMemberProfile({
        memberId: currentMember.id,
        fullName,
        phone: phone || null,
        birthDate: birthDate || null,
      });

      await onUpdated();

      alert("Perfil atualizado.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao atualizar perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    try {
      setSaving(true);

      await approveMember(currentMember.id);

      await onUpdated();

      alert("Membro aprovado.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao aprovar membro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    try {
      setSaving(true);

      await rejectMember(currentMember.id);

      await onUpdated();

      alert("Membro recusado.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao recusar membro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVocalLeadership() {
    if (!vocalFunction?.vocal_group) {
      alert("Membro não possui grupo vocal.");
      return;
    }

    try {
      setSaving(true);

      if (vocalLeadership) {
        await removeVocalLeader(currentMember.id);
      } else {
        await promoteVocalLeader({
          memberId: currentMember.id,
          vocalGroup: vocalFunction.vocal_group,
        });
      }

      await onUpdated();

      alert(
        vocalLeadership
          ? "Liderança vocal removida."
          : "Promovido para liderança vocal.",
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar liderança vocal.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleInstrumentLeadership(instrument: string) {
    if (!instrument) {
      alert("Instrumento inválido.");
      return;
    }

    const alreadyLeader = instrumentLeaderships.some(
      (leadership) => leadership.instrument === instrument,
    );

    try {
      setSaving(true);

      if (alreadyLeader) {
        await removeInstrumentLeader({
          memberId: currentMember.id,
          instrument,
        });
      } else {
        await promoteInstrumentLeader({
          memberId: currentMember.id,
          instrument,
        });
      }

      await onUpdated();

      alert(
        alreadyLeader ? "Liderança removida." : "Promovido para liderança.",
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao atualizar liderança.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {currentMember.full_name}
            </h2>

            <p className="text-sm text-zinc-400">
              Gerenciamento completo do membro
            </p>
          </div>

          <button
            onClick={handleClose}
            className="rounded-xl border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Informações pessoais
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Nome completo
                </label>

                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Telefone
                </label>

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Data nascimento
                </label>

                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-violet-500"
                />
              </div>
            </div>

            <button
              disabled={saving}
              onClick={handleSaveProfile}
              className="mt-5 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
              type="button"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>

          {currentMember.status === "pending" && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Aprovação
              </h3>

              <div className="flex flex-wrap gap-3">
                <button
                  disabled={saving}
                  onClick={handleApprove}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  type="button"
                >
                  Aprovar membro
                </button>

                <button
                  disabled={saving}
                  onClick={handleReject}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                  type="button"
                >
                  Recusar membro
                </button>
              </div>
            </div>
          )}

          {vocalFunction && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Liderança vocal
                  </h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    Grupo: {vocalFunction.vocal_group}
                  </p>
                </div>

                <button
                  disabled={saving}
                  onClick={handleToggleVocalLeadership}
                  className={`rounded-2xl px-5 py-3 text-sm font-medium text-white transition disabled:opacity-50 ${
                    vocalLeadership
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-violet-600 hover:bg-violet-500"
                  }`}
                  type="button"
                >
                  {vocalLeadership ? "Remover liderança" : "Promover liderança"}
                </button>
              </div>
            </div>
          )}

          {instrumentalFunctions.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Liderança instrumentos
              </h3>

              <div className="space-y-3">
                {instrumentalFunctions.map((func) => {
                  const isLeader = instrumentLeaderships.some(
                    (leadership) => leadership.instrument === func.instrument,
                  );

                  return (
                    <div
                      key={func.id}
                      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {func.instrument}
                        </p>
                      </div>

                      <button
                        disabled={saving}
                        onClick={() =>
                          handleToggleInstrumentLeadership(
                            func.instrument || "",
                          )
                        }
                        className={`rounded-2xl px-5 py-3 text-sm font-medium text-white transition disabled:opacity-50 ${
                          isLeader
                            ? "bg-red-600 hover:bg-red-500"
                            : "bg-cyan-600 hover:bg-cyan-500"
                        }`}
                        type="button"
                      >
                        {isLeader ? "Remover liderança" : "Promover liderança"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
