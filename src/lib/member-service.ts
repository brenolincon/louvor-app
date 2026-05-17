import { supabase } from "@/lib/supabase";
import { MemberProfile } from "@/types/members";

export async function fetchMembers() {
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
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as MemberProfile[];
}
