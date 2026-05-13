"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/get-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setLoading(false);
      alert("Usuário não encontrado.");
      return;
    }

    const profile = await getProfile(user.id);

    setLoading(false);

    if (profile) {
      router.push("/dashboard");
    } else {
      router.push("/completar-perfil");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
              <Music2 size={28} />
            </div>

            <h1 className="text-3xl font-bold">Entrar</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Acesse sua conta do Louvor App.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button disabled={loading} className="w-full">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Ainda não tem conta?{" "}
            <a href="/cadastro" className="text-violet-400 hover:text-violet-300">
              Criar conta
            </a>
          </p>
        </Card>
      </div>
    </main>
  );
}