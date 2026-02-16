"use client";

import { Card, CardBody } from "@heroui/react";

export function InvalidInvitationCard() {
  return (
    <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
      <CardBody className="text-center">
        <h1 className="mb-2 text-xl font-semibold text-danger">Invitación Inválida</h1>
        <p className="text-default-500">
          Este enlace de invitación no es válido. Por favor, verifica el enlace e intenta de nuevo.
        </p>
      </CardBody>
    </Card>
  );
}
