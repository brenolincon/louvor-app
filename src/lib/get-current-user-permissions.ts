import { supabase } from "@/lib/supabase";

export async function getCurrentUserPermissions() {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      status,
      ministry_role,
      member_leaderships (
        id,
        leadership_type,
        vocal_group,
        instrument
      )
    `,
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  const leaderships = profile.member_leaderships || [];

  return {
    userId: user.id,
    profile,
    isGeneralLeader: leaderships.some(
      (item) => item.leadership_type === "general_leader",
    ),
    vocalGroupsLed: leaderships
      .filter((item) => item.leadership_type === "vocal_leader")
      .map((item) => item.vocal_group),
    instrumentsLed: leaderships
      .filter((item) => item.leadership_type === "instrument_leader")
      .map((item) => item.instrument),
  };
}
