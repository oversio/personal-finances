"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { ArrowLeftIcon } from "@repo/ui/icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ImportWizard } from "../_components/import-wizard";

export default function ImportTransactionsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Button
          as={Link}
          href={`/ws/${workspaceId}/transactions`}
          variant="light"
          size="sm"
          startContent={<ArrowLeftIcon className="size-4" />}
        >
          Volver a Transacciones
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
          <h1 className="text-xl font-bold">Importar Transacciones</h1>
          <p className="text-small text-default-500">
            Carga un archivo CSV con múltiples transacciones
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <ImportWizard workspaceId={workspaceId} />
        </CardBody>
      </Card>
    </div>
  );
}
