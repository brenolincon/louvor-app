import { supabase } from "@/lib/supabase";

type Leadership = {
  leadership_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

export async function getCurrentUserPermissions() {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      status,
      member_leaderships (
        leadership_type,
        vocal_group,
        instrument
      )
    `,
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  const leaderships = (profile.member_leaderships || []) as Leadership[];

  const isGeneralLeader = leaderships.some(
    (item) => item.leadership_type === "general_leader",
  );

  const vocalGroupsLed = leaderships
    .filter(
      (item) => item.leadership_type === "vocal_leader" && item.vocal_group,
    )
    .map((item) => item.vocal_group as string);

  const instrumentsLed = leaderships
    .filter(
      (item) => item.leadership_type === "instrument_leader" && item.instrument,
    )
    .map((item) => item.instrument as string);

  return {
    userId: user.id,
    profile,
    isGeneralLeader,
    isVocalLeader: vocalGroupsLed.length > 0,
    isInstrumentLeader: instrumentsLed.length > 0,
    isAnyLeader:
      isGeneralLeader || vocalGroupsLed.length > 0 || instrumentsLed.length > 0,
    vocalGroupsLed,
    instrumentsLed,
  };
}
