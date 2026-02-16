import { Suspense } from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import { InvitationAcceptContent } from "./_components/invitation-accept-content";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitationAcceptPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
        <CardBody className="text-center">
          <h1 className="mb-2 text-xl font-semibold text-danger">Invalid Invitation</h1>
          <p className="text-default-500">
            This invitation link is invalid. Please check the link and try again.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Suspense
      fallback={
        <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
          <CardBody className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </CardBody>
        </Card>
      }
    >
      <InvitationAcceptContent token={token} />
    </Suspense>
  );
}
