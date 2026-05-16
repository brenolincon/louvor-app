"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SettingsData = {
  id: number;
  ministry_name: string;
  church_name: string;
  city: string;
  sunday_time: string;
  wednesday_time: string;
  rehearsal_weekday: string;
  rehearsal_time: string;
  max_ministers_per_service: number;
  max_backvocals_per_service: number;
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);

    const permissions = await getCurrentUserPermissions();

    if (!permissions?.isGeneralLeader) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    setAllowed(true);

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      await loadSettings();
    }

    init();
  }, [loadSettings]);

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);

    const { error } = await supabase
      .from("system_settings")
      .update({
        ministry_name: settings.ministry_name,
        church_name: settings.church_name,
        city: settings.city,
        sunday_time: settings.sunday_time,
        wednesday_time: settings.wednesday_time,
        rehearsal_weekday: settings.rehearsal_weekday,
        rehearsal_time: settings.rehearsal_time,
        max_ministers_per_service: settings.max_ministers_per_service,
        max_backvocals_per_service: settings.max_backvocals_per_service,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await loadSettings();
  }

  function updateField<K extends keyof SettingsData>(
    field: K,
    value: SettingsData[K],
  ) {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
          <Settings size={24} />
        </div>

        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="mt-2 text-zinc-400">
          Configure regras globais do ministério.
        </p>
      </div>

      {loading && (
        <Card>
          <p className="text-zinc-400">Carregando configurações...</p>
        </Card>
      )}

      {!loading && !allowed && (
        <Card>
          <p className="text-zinc-400">
            Apenas o líder geral pode acessar as configurações.
          </p>
        </Card>
      )}

      {!loading && allowed && settings && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-xl font-semibold">Dados do ministério</h2>

            <div className="space-y-4">
              <Input
                placeholder="Nome do ministério"
                value={settings.ministry_name}
                onChange={(e) => updateField("ministry_name", e.target.value)}
              />

              <Input
                placeholder="Nome da igreja"
                value={settings.church_name}
                onChange={(e) => updateField("church_name", e.target.value)}
              />

              <Input
                placeholder="Cidade"
                value={settings.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold">Horários padrão</h2>

            <div className="space-y-4">
              <Input
                placeholder="Horário domingo"
                value={settings.sunday_time}
                onChange={(e) => updateField("sunday_time", e.target.value)}
              />

              <Input
                placeholder="Horário quarta"
                value={settings.wednesday_time}
                onChange={(e) => updateField("wednesday_time", e.target.value)}
              />

              <Input
                placeholder="Dia padrão do ensaio"
                value={settings.rehearsal_weekday}
                onChange={(e) =>
                  updateField("rehearsal_weekday", e.target.value)
                }
              />

              <Input
                placeholder="Horário ensaio"
                value={settings.rehearsal_time}
                onChange={(e) => updateField("rehearsal_time", e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold">Regras da escala</h2>

            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Ministros por culto"
                value={settings.max_ministers_per_service}
                onChange={(e) =>
                  updateField(
                    "max_ministers_per_service",
                    Number(e.target.value),
                  )
                }
              />

              <Input
                type="number"
                placeholder="Backvocals por culto"
                value={settings.max_backvocals_per_service}
                onChange={(e) =>
                  updateField(
                    "max_backvocals_per_service",
                    Number(e.target.value),
                  )
                }
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold">Resumo do sistema</h2>

            <div className="space-y-3 text-sm text-zinc-400">
              <p>Instrumentistas repetem domingo e quarta.</p>
              <p>Repertório é separado para domingo e quarta.</p>
              <p>Configurações visíveis somente para líder geral.</p>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
