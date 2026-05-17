import { MemberProfile } from "@/types/members";
import { MemberCard } from "@/components/members/member-card";

type Props = {
  members: MemberProfile[];
  canManageMembers: boolean;
  onSelectMember: (member: MemberProfile) => void;
};

export function MembersGrid({
  members,
  canManageMembers,
  onSelectMember,
}: Props) {
  return (
    <div className="grid gap-4">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          onClick={() => {
            if (canManageMembers) {
              onSelectMember(member);
            }
          }}
        />
      ))}
    </div>
  );
}
