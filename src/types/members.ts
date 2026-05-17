export type MemberFunction = {
  id: string;
  function_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

export type MemberLeadership = {
  id: string;
  leadership_type: string;
  vocal_group: string | null;
  instrument: string | null;
};

export type MemberProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  status: string;
  ministry_role: string | null;
  created_at: string;

  member_functions: MemberFunction[];
  member_leaderships: MemberLeadership[];
};
