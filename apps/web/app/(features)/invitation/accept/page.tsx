import { InvitationAcceptContent } from "./_components/invitation-accept-content";
import { InvalidInvitationCard } from "./_components/invalid-invitation-card";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitationAcceptPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidInvitationCard />;
  }

  return <InvitationAcceptContent token={token} />;
}
