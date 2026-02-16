export const INVITATION_QUERY_KEYS = {
  invitation: "invitation",
  accept: "invitation-accept",
} as const;

export type InvitationQueryKey = (typeof INVITATION_QUERY_KEYS)[keyof typeof INVITATION_QUERY_KEYS];
