export const SETTINGS_QUERY_KEYS = {
  settings: "workspace-settings",
  members: "workspace-members",
  updateSettings: "workspace-update-settings",
  inviteMember: "workspace-invite-member",
  changeMemberRole: "workspace-change-member-role",
  removeMember: "workspace-remove-member",
  deleteWorkspace: "workspace-delete",
  pendingInvitations: "workspace-pending-invitations",
  sendInvitation: "workspace-send-invitation",
  resendInvitation: "workspace-resend-invitation",
  revokeInvitation: "workspace-revoke-invitation",
} as const;

export type SettingsQueryKey = (typeof SETTINGS_QUERY_KEYS)[keyof typeof SETTINGS_QUERY_KEYS];
