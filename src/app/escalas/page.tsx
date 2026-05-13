"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EscalasPage() {
  const [sundayDate, setSundayDate] = useState("");
  const [vocalGroup, setVocalGroup] = useState("");

  async function createWeek(e: React.FormEvent) {
    e.preventDefault();

    const sunday = new Date(sundayDate);

    const rehearsal = new Date(sunday);
    rehearsal.setDate(sunday.getDate() - 2);

    const wednesday = new Date(sunday);
    wednesday.setDate(sunday.getDate() + 3);

    const formatDate = (date: Date) =>
      date.toISOString().split("T")[0];

    const { data: sessionData } =
      await supabase.auth.getSession();

    const user = sessionData.session?.user;

    const { error } = await supabase
      .from("ministry_weeks")
      .insert({
        sunday_date: formatDate(sunday),
        wednesday_date: formatDate(wednesday),
        rehearsal_date: formatDate(rehearsal),
        vocal_group: vocalGroup,
        created_by: user?.id,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Semana criada com sucesso!");
  }

  return (
    <main className="p-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Criar Semana Ministerial
      </h1>

      <form
        onSubmit={createWeek}
        className="space-y-4"
      >
        <div>
          <label>Domingo da semana</label>

          <input
            type="date"
            className="w-full border rounded p-3"
            value={sundayDate}
            onChange={(e) =>
              setSundayDate(e.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Grupo vocal responsável</label>

          <select
            className="w-full border rounded p-3"
            value={vocalGroup}
            onChange={(e) =>
              setVocalGroup(e.target.value)
            }
            required
          >
            <option value="">
              Selecione
            </option>

            <option value="unit">
              Unit
            </option>

            <option value="ative">
              Ative
            </option>

            <option value="teens">
              Geração Teens
            </option>
          </select>
        </div>

        <button className="bg-black text-white px-4 py-3 rounded">
          Criar semana
        </button>
      </form>
    </main>
  );
}