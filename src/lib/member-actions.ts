import { supabase } from "@/lib/supabase";

export async function approveMember(memberId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      status: "approved",
    })
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function rejectMember(memberId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      status: "rejected",
    })
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateMemberProfile({
  memberId,
  fullName,
  phone,
  birthDate,
}: {
  memberId: string;
  fullName: string;
  phone: string | null;
  birthDate: string | null;
}) {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      birth_date: birthDate,
    })
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function promoteVocalLeader({
  memberId,
  vocalGroup,
}: {
  memberId: string;
  vocalGroup: string;
}) {
  const { error } = await supabase.from("member_leaderships").insert({
    member_id: memberId,
    leadership_type: "vocal_leader",
    vocal_group: vocalGroup,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeVocalLeader(memberId: string) {
  const { error } = await supabase
    .from("member_leaderships")
    .delete()
    .eq("member_id", memberId)
    .eq("leadership_type", "vocal_leader");

  if (error) {
    throw new Error(error.message);
  }
}

export async function promoteInstrumentLeader({
  memberId,
  instrument,
}: {
  memberId: string;
  instrument: string;
}) {
  const { error } = await supabase.from("member_leaderships").insert({
    member_id: memberId,
    leadership_type: "instrument_leader",
    instrument,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeInstrumentLeader({
  memberId,
  instrument,
}: {
  memberId: string;
  instrument: string;
}) {
  const { error } = await supabase
    .from("member_leaderships")
    .delete()
    .eq("member_id", memberId)
    .eq("leadership_type", "instrument_leader")
    .eq("instrument", instrument);

  if (error) {
    throw new Error(error.message);
  }
}
