"use client";

import { Card, CardBody } from "@heroui/react";

export function InvalidInvitationCard() {
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
