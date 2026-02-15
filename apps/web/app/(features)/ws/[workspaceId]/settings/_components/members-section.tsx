"use client";

import { Button, Divider, Spinner } from "@heroui/react";
import { useState } from "react";
import type { MemberRole, WorkspaceMember } from "../_api/settings.types";
import { useChangeMemberRole } from "../_api/change-member-role/use-change-member-role";
import { useGetMemberList } from "../_api/get-member-list/use-get-member-list";
import { useInviteMember } from "../_api/invite-member/use-invite-member";
import { useRemoveMember } from "../_api/remove-member/use-remove-member";
import type { InviteMemberFormData } from "../_schemas/invite-member.schema";
import { ChangeRoleModal } from "./change-role-modal";
import { InviteMemberModal } from "./invite-member-modal";
import { MemberRow } from "./member-row";
import { RemoveMemberModal } from "./remove-member-modal";

interface MembersSectionProps {
  workspaceId: string;
  currentUserRole: MemberRole;
}

export function MembersSection({ workspaceId, currentUserRole }: MembersSectionProps) {
  const { data: members, isLoading } = useGetMemberList({ workspaceId });
  const inviteMemberMutation = useInviteMember();
  const changeMemberRoleMutation = useChangeMemberRole();
  const removeMemberMutation = useRemoveMember();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState<WorkspaceMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  const handleInvite = (data: InviteMemberFormData) => {
    inviteMemberMutation.mutate(
      { workspaceId, data },
      {
        onSuccess: () => {
          setShowInviteModal(false);
        },
      },
    );
  };

  const handleChangeRole = (role: "admin" | "member") => {
    if (!memberToChangeRole) return;
    changeMemberRoleMutation.mutate(
      { workspaceId, memberId: memberToChangeRole.id, data: { role } },
      {
        onSuccess: () => {
          setMemberToChangeRole(null);
        },
      },
    );
  };

  const handleRemove = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(
      { workspaceId, memberId: memberToRemove.id },
      {
        onSuccess: () => {
          setMemberToRemove(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <div className="flex justify-end">
          <Button
            color="primary"
            startContent={
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            onPress={() => setShowInviteModal(true)}
          >
            Invite Member
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-divider bg-content1 p-4">
        {members && members.length > 0 ? (
          <div className="divide-y divide-divider">
            {members.map((member, index) => (
              <div key={member.id}>
                {index > 0 && <Divider />}
                <MemberRow
                  member={member}
                  currentUserRole={currentUserRole}
                  onChangeRole={setMemberToChangeRole}
                  onRemove={setMemberToRemove}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-default-500">No members yet</p>
        )}
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInvite}
        isPending={inviteMemberMutation.isPending}
        error={inviteMemberMutation.error}
      />

      <ChangeRoleModal
        member={memberToChangeRole}
        isOpen={!!memberToChangeRole}
        onClose={() => setMemberToChangeRole(null)}
        onSubmit={handleChangeRole}
        isPending={changeMemberRoleMutation.isPending}
      />

      <RemoveMemberModal
        member={memberToRemove}
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemove}
        isPending={removeMemberMutation.isPending}
      />
    </div>
  );
}
