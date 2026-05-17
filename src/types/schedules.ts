export type Week = {
  id: string;
  sunday_date: string;
  wednesday_date: string;
  rehearsal_date: string;
  vocal_group: string;
  status: string;
};

export type MemberFunction = {
  id: string;
  instrument: string | null;
  vocal_group: string | null;

  profiles: {
    id: string;
    full_name: string;
    status: string;
  } | null;
};

export type InstrumentAssignment = {
  id: string;
  week_id: string;
  member_id: string;
  instrument: string;
  status: string;

  profiles: {
    full_name: string;
  } | null;
};

export type VocalAssignment = {
  id: string;
  member_id: string;
  role: string;
  service_day: string;
  status: string;

  profiles: {
    full_name: string;
  } | null;
};

export type SystemSettings = {
  max_ministers_per_service: number;
  max_backvocals_per_service: number;
};
