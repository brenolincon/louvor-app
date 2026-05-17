import { supabase } from "@/lib/supabase";
import {
  InstrumentAssignment,
  MemberFunction,
  SystemSettings,
  VocalAssignment,
  Week,
} from "@/types/schedules";

export async function fetchScheduleDetails(weekId: string) {
  const { data: weekData, error: weekError } = await supabase
    .from("ministry_weeks")
    .select(
      `
      id,
      sunday_date,
      wednesday_date,
      rehearsal_date,
      vocal_group,
      status
    `,
    )
    .eq("id", weekId)
    .single();

  if (weekError) {
    throw new Error(weekError.message);
  }

  const { data: settingsData, error: settingsError } = await supabase
    .from("system_settings")
    .select(
      `
      max_ministers_per_service,
      max_backvocals_per_service
    `,
    )
    .eq("id", 1)
    .single();

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  const { data: instrumentalistsData, error: instrumentalistsError } =
    await supabase
      .from("member_functions")
      .select(
        `
        id,
        instrument,
        vocal_group,
        profiles!inner (
          id,
          full_name,
          status
        )
      `,
      )
      .eq("function_type", "instrumentalist")
      .eq("profiles.status", "approved")
      .order("instrument", { ascending: true });

  if (instrumentalistsError) {
    throw new Error(instrumentalistsError.message);
  }

  const { data: vocalistsData, error: vocalistsError } = await supabase
    .from("member_functions")
    .select(
      `
      id,
      instrument,
      vocal_group,
      profiles!inner (
        id,
        full_name,
        status
      )
    `,
    )
    .eq("function_type", "vocalist")
    .eq("vocal_group", weekData.vocal_group)
    .eq("profiles.status", "approved")
    .order("created_at", { ascending: true });

  if (vocalistsError) {
    throw new Error(vocalistsError.message);
  }

  const { data: instrumentAssignmentsData, error: instrumentAssignmentsError } =
    await supabase
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

  if (instrumentAssignmentsError) {
    throw new Error(instrumentAssignmentsError.message);
  }

  const { data: vocalAssignmentsData, error: vocalAssignmentsError } =
    await supabase
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
      .eq("week_id", weekId)
      .order("service_day", { ascending: true });

  if (vocalAssignmentsError) {
    throw new Error(vocalAssignmentsError.message);
  }

  return {
    week: weekData as Week,
    settings: settingsData as SystemSettings,
    instrumentalists: (instrumentalistsData ||
      []) as unknown as MemberFunction[],
    vocalists: (vocalistsData || []) as unknown as MemberFunction[],
    instrumentAssignments: (instrumentAssignmentsData ||
      []) as unknown as InstrumentAssignment[],
    vocalAssignments: (vocalAssignmentsData ||
      []) as unknown as VocalAssignment[],
  };
}
