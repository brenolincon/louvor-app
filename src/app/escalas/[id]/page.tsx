"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/app-layout";

import { WeekHeader } from "@/components/weeks/week-header";
import { WeekSummaryCards } from "@/components/weeks/week-summary-cards";
import { InstrumentAssignmentsCard } from "@/components/weeks/instrument-assignments-card";
import { VocalAssignmentsCard } from "@/components/weeks/vocal-assignments-card";
import { WeekPlaceholderCard } from "@/components/weeks/week-placeholder-card";
import { RepertoireCard } from "@/components/weeks/repertoire-card";

type RepertoireSong = {
  id: string;
  song_name: string;
  version_name: string | null;
  key_signature: string | null;
  song_order: number | null;
};

type WeekRepertoire = {
  id: string;
  service_day: string;
  playlist_url: string | null;
  approval_status: string;
  week_repertoire_songs: RepertoireSong[];
};

type MinistryWeek = {
  id: string;
  sunday_date: string;
  wednesday_date: string;
  rehearsal_date: string;
  rehearsal_time: string;
  sunday_time: string;
  wednesday_time: string;
  vocal_group: string;
  status: string;
};

type Profile = {
  id: string;
  full_name: string;
  instrument: string | null;
  status: string;
  member_type: string | null;
};

type InstrumentAssignment = {
  id: string;
  week_id: string;
  member_id: string;
  instrument: string;
  status: string;
  profiles:
    | {
        full_name: string;
      }[]
    | null;
};

type Vocalist = {
  id: string;
  full_name: string;
  vocal_role: string | null;
  vocal_group: string | null;
};

type VocalAssignment = {
  id: string;
  member_id: string;
  role: string;
  service_day: string;
  status: string;
  profiles:
    | {
        full_name: string;
      }[]
    | null;
};

export default function WeekDetailsPage() {
  const [repertoires, setRepertoires] = useState<WeekRepertoire[]>([]);

  const [selectedRepertoireServiceDay, setSelectedRepertoireServiceDay] =
    useState("");

  const [playlistUrl, setPlaylistUrl] = useState("");
  const [songName, setSongName] = useState("");
  const [versionName, setVersionName] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [savingRepertoireSong, setSavingRepertoireSong] = useState(false);

  const params = useParams();
  const weekId = params.id as string;

  const [week, setWeek] = useState<MinistryWeek | null>(null);
  const [loading, setLoading] = useState(true);

  const [instrumentalists, setInstrumentalists] = useState<Profile[]>([]);
  const [instrumentAssignments, setInstrumentAssignments] = useState<
    InstrumentAssignment[]
  >([]);

  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [savingInstrument, setSavingInstrument] = useState(false);

  const [vocalists, setVocalists] = useState<Vocalist[]>([]);
  const [vocalAssignments, setVocalAssignments] = useState<VocalAssignment[]>(
    [],
  );

  const [selectedServiceDay, setSelectedServiceDay] = useState("");
  const [selectedVocalRole, setSelectedVocalRole] = useState("");
  const [selectedVocalistId, setSelectedVocalistId] = useState("");
  const [savingVocal, setSavingVocal] = useState(false);

  const fetchRepertoires = useCallback(async () => {
    const { data, error } = await supabase
      .from("week_repertoires")
      .select(
        `
      id,
      service_day,
      playlist_url,
      approval_status,
      week_repertoire_songs (
        id,
        song_name,
        version_name,
        key_signature,
        song_order
      )
    `,
      )
      .eq("week_id", weekId)
      .order("service_day", { ascending: true });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }, [weekId]);

  const fetchInstrumentAssignments = useCallback(async () => {
    const { data, error } = await supabase
      .from("week_instrument_assignments")
      .select(
        `
        id,
        week_id,
        member_id,
        instrument,
        status,
        profiles (
          full_name
        )
      `,
      )
      .eq("week_id", weekId)
      .order("instrument", { ascending: true });

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }, [weekId]);

  const fetchVocalAssignments = useCallback(async () => {
    const { data, error } = await supabase
      .from("week_vocal_assignments")
      .select(
        `
        id,
        member_id,
        role,
        service_day,
        status,
        profiles (
          full_name
        )
      `,
      )
      .eq("week_id", weekId);

    if (error) {
      alert(error.message);
      return [];
    }

    return data || [];
  }, [weekId]);

  async function saveInstrumentAssignment(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedInstrument || !selectedMemberId) {
      alert("Selecione instrumento e músico.");
      return;
    }

    setSavingInstrument(true);

    const { error } = await supabase.from("week_instrument_assignments").upsert(
      {
        week_id: weekId,
        instrument: selectedInstrument,
        member_id: selectedMemberId,
        status: "pending",
      },
      {
        onConflict: "week_id,instrument",
      },
    );

    setSavingInstrument(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedInstrument("");
    setSelectedMemberId("");

    const updatedAssignments = await fetchInstrumentAssignments();
    setInstrumentAssignments(updatedAssignments);
  }

  async function saveVocalAssignment(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedServiceDay || !selectedVocalRole || !selectedVocalistId) {
      alert("Preencha todos os campos.");
      return;
    }

    setSavingVocal(true);

    const { error } = await supabase.from("week_vocal_assignments").insert({
      week_id: weekId,
      member_id: selectedVocalistId,
      role: selectedVocalRole,
      service_day: selectedServiceDay,
      status: "pending",
    });

    setSavingVocal(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedServiceDay("");
    setSelectedVocalRole("");
    setSelectedVocalistId("");

    const updatedAssignments = await fetchVocalAssignments();
    setVocalAssignments(updatedAssignments);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadWeekData() {
      setLoading(true);

      const { data: weekData, error: weekError } = await supabase
        .from("ministry_weeks")
        .select("*")
        .eq("id", weekId)
        .single();

      if (!isMounted) return;

      if (weekError) {
        alert(weekError.message);
        setLoading(false);
        return;
      }

      const { data: instrumentalistsData, error: instrumentalistsError } =
        await supabase
          .from("profiles")
          .select("id, full_name, instrument, status, member_type")
          .eq("member_type", "instrumentalist")
          .eq("status", "approved")
          .order("full_name", { ascending: true });

      if (!isMounted) return;

      if (instrumentalistsError) {
        alert(instrumentalistsError.message);
        setLoading(false);
        return;
      }

      const { data: vocalistsData, error: vocalistsError } = await supabase
        .from("profiles")
        .select("id, full_name, vocal_role, vocal_group")
        .eq("member_type", "vocalist")
        .eq("status", "approved")
        .eq("vocal_group", weekData.vocal_group)
        .order("full_name", { ascending: true });

      if (!isMounted) return;

      if (vocalistsError) {
        alert(vocalistsError.message);
        setLoading(false);
        return;
      }

      const instrumentAssignmentsData = await fetchInstrumentAssignments();
      const vocalAssignmentsData = await fetchVocalAssignments();

      const repertoiresData = await fetchRepertoires();

      if (!isMounted) return;

      setWeek(weekData);
      setInstrumentalists(instrumentalistsData || []);
      setVocalists(vocalistsData || []);
      setInstrumentAssignments(instrumentAssignmentsData);
      setVocalAssignments(vocalAssignmentsData);
      setLoading(false);
      setRepertoires(repertoiresData);
    }

    if (weekId) {
      loadWeekData();
    }

    return () => {
      isMounted = false;
    };
  }, [
    weekId,
    fetchInstrumentAssignments,
    fetchVocalAssignments,
    fetchRepertoires,
  ]);

  if (loading) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Carregando semana...</p>
      </AppLayout>
    );
  }

  if (!week) {
    return (
      <AppLayout>
        <p className="text-zinc-400">Semana não encontrada.</p>
      </AppLayout>
    );
  }

  async function saveRepertoireSong(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedRepertoireServiceDay || !songName) {
      alert("Selecione o culto e informe o nome da música.");
      return;
    }

    setSavingRepertoireSong(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    const { data: repertoire, error: repertoireError } = await supabase
      .from("week_repertoires")
      .upsert(
        {
          week_id: weekId,
          service_day: selectedRepertoireServiceDay,
          playlist_url: playlistUrl,
          created_by: user?.id,
        },
        {
          onConflict: "week_id,service_day",
        },
      )
      .select("id")
      .single();

    if (repertoireError) {
      setSavingRepertoireSong(false);
      alert(repertoireError.message);
      return;
    }

    const { count } = await supabase
      .from("week_repertoire_songs")
      .select("*", { count: "exact", head: true })
      .eq("repertoire_id", repertoire.id);

    const { error: songError } = await supabase
      .from("week_repertoire_songs")
      .insert({
        repertoire_id: repertoire.id,
        song_name: songName,
        version_name: versionName,
        key_signature: keySignature,
        song_order: (count || 0) + 1,
      });

    setSavingRepertoireSong(false);

    if (songError) {
      alert(songError.message);
      return;
    }

    setSongName("");
    setVersionName("");
    setKeySignature("");

    const updatedRepertoires = await fetchRepertoires();
    setRepertoires(updatedRepertoires);
  }

  return (
    <AppLayout>
      <WeekHeader
        sundayDate={week.sunday_date}
        wednesdayDate={week.wednesday_date}
        vocalGroup={week.vocal_group}
        status={week.status}
      />

      <WeekSummaryCards
        rehearsalDate={week.rehearsal_date}
        rehearsalTime={week.rehearsal_time}
        sundayDate={week.sunday_date}
        sundayTime={week.sunday_time}
        wednesdayDate={week.wednesday_date}
        wednesdayTime={week.wednesday_time}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <InstrumentAssignmentsCard
          instrumentalists={instrumentalists}
          assignments={instrumentAssignments}
          selectedInstrument={selectedInstrument}
          selectedMemberId={selectedMemberId}
          saving={savingInstrument}
          onInstrumentChange={setSelectedInstrument}
          onMemberChange={setSelectedMemberId}
          onSubmit={saveInstrumentAssignment}
        />

        <VocalAssignmentsCard
          vocalists={vocalists}
          assignments={vocalAssignments}
          selectedServiceDay={selectedServiceDay}
          selectedVocalRole={selectedVocalRole}
          selectedVocalistId={selectedVocalistId}
          saving={savingVocal}
          onServiceDayChange={setSelectedServiceDay}
          onVocalRoleChange={setSelectedVocalRole}
          onVocalistChange={setSelectedVocalistId}
          onSubmit={saveVocalAssignment}
        />

        <RepertoireCard
          repertoires={repertoires}
          selectedServiceDay={selectedRepertoireServiceDay}
          playlistUrl={playlistUrl}
          songName={songName}
          versionName={versionName}
          keySignature={keySignature}
          saving={savingRepertoireSong}
          onServiceDayChange={setSelectedRepertoireServiceDay}
          onPlaylistUrlChange={setPlaylistUrl}
          onSongNameChange={setSongName}
          onVersionNameChange={setVersionName}
          onKeySignatureChange={setKeySignature}
          onSubmit={saveRepertoireSong}
        />

        <WeekPlaceholderCard
          title="Confirmações"
          description="Em breve os integrantes confirmarão presença."
          icon={CalendarDays}
        />
      </div>
    </AppLayout>
  );
}
