"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession();

      const user = data.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <p className="p-6">Carregando...</p>;
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Olá, {profile?.full_name}
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      <div className="border rounded p-4">
        <p>
          <strong>Status:</strong> {profile?.status}
        </p>

        <p>
          <strong>Tipo:</strong> {profile?.member_type}
        </p>

        <p>
          <strong>Grupo vocal:</strong> {profile?.vocal_group || "-"}
        </p>

        <p>
          <strong>Instrumento:</strong> {profile?.instrument || "-"}
        </p>
      </div>
    </main>
  );
}