export const SETTINGS_QUERY_KEYS = {
  settings: "workspace-settings",
  members: "workspace-members",
  updateSettings: "workspace-update-settings",
  inviteMember: "workspace-invite-member",
  changeMemberRole: "workspace-change-member-role",
  removeMember: "workspace-remove-member",
  deleteWorkspace: "workspace-delete",
} as const;

export type SettingsQueryKey = (typeof SETTINGS_QUERY_KEYS)[keyof typeof SETTINGS_QUERY_KEYS];
