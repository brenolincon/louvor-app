import { MemberFunction } from "@/types/schedules";
import { getCurrentUserPermissions } from "@/lib/get-current-user-permissions";

type Permissions = Awaited<ReturnType<typeof getCurrentUserPermissions>>;

type Params = {
  permissions: Permissions;
  weekVocalGroup: string;
  instrumentalists: MemberFunction[];
};

export function getSchedulePermissions({
  permissions,
  weekVocalGroup,
  instrumentalists,
}: Params) {
  const canManageAll = permissions?.isGeneralLeader === true;

  const canManageVocals =
    canManageAll ||
    permissions?.vocalGroupsLed?.includes(weekVocalGroup) === true;

  const userLedInstruments = permissions?.instrumentsLed || [];

  const canManageInstruments = canManageAll || userLedInstruments.length > 0;

  const instrumentsUserCanManage = canManageAll
    ? instrumentalists
        .map((item) => item.instrument)
        .filter((instrument): instrument is string => Boolean(instrument))
    : userLedInstruments;

  const filteredInstrumentalists = canManageInstruments
    ? canManageAll
      ? instrumentalists
      : instrumentalists.filter(
          (item) =>
            item.instrument !== null &&
            instrumentsUserCanManage.includes(item.instrument),
        )
    : [];

  return {
    canManageAll,
    canManageVocals,
    canManageInstruments,
    instrumentsUserCanManage,
    filteredInstrumentalists,
  };
}
