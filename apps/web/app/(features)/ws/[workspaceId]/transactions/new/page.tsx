"use client";

import { useState, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalContent,
  Spinner,
} from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CameraIcon, ExclamationTriangleIcon } from "@repo/ui/icons";
import { useGetAccountList } from "../../accounts/_api/get-account-list/use-get-account-list";
import { useGetCategoryList } from "../../categories/_api/get-category-list/use-get-category-list";
import { useCreateTransaction } from "../_api/create-transaction/use-create-transaction";
import type { InvoiceScanResult } from "../_api/invoice-scan.types";
import { InvoiceScanner } from "../_components/invoice-scanner";
import { TransactionForm, type TransactionFormRef } from "../_components/transaction-form";
import type { CreateTransactionFormData } from "../_schemas/transaction.schema";

export default function NewTransactionPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<InvoiceScanResult | null>(null);
  const formRef = useRef<TransactionFormRef>(null);

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccountList({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoryList({ workspaceId });
  const createMutation = useCreateTransaction();

  const handleScanComplete = (result: InvoiceScanResult) => {
    setScanResult(result);
    setIsScannerOpen(false);

    // Pre-fill form with scanned data (always expense for invoices)
    if (formRef.current) {
      formRef.current.setValue("type", "expense");
      if (result.amount) {
        formRef.current.setValue("amount", result.amount);
      }
      if (result.currency) {
        formRef.current.setValue(
          "currency",
          result.currency as CreateTransactionFormData["currency"],
        );
      }
      if (result.date) {
        formRef.current.setValue("date", new Date(result.date));
      }
      if (result.description) {
        const prefix = result.vendor ?? "Compra";
        formRef.current.setValue("notes", `${prefix}: ${result.description}`);
      } else if (result.vendor) {
        formRef.current.setValue("notes", result.vendor);
      }
      if (result.categoryId) {
        formRef.current.setValue("categoryId", result.categoryId);
      }
      if (result.subcategoryId) {
        formRef.current.setValue("subcategoryId", result.subcategoryId);
      }
    }
  };

  // Find matched category name for display
  const matchedCategory = scanResult?.categoryId
    ? categories?.find(c => c.id === scanResult.categoryId)
    : null;
  const matchedSubcategory = matchedCategory?.subcategories?.find(
    s => s.id === scanResult?.subcategoryId,
  );

  const handleSubmit = (data: CreateTransactionFormData) => {
    createMutation.mutate(
      {
        workspaceId,
        data: {
          type: data.type,
          accountId: data.accountId,
          toAccountId: data.toAccountId,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          amount: data.amount,
          currency: data.currency,
          notes: data.notes,
          date: data.date,
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/transactions`);
        },
      },
    );
  };

  const isLoading = isLoadingAccounts || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button
          as={Link}
          href={`/ws/${workspaceId}/transactions`}
          variant="light"
          size="sm"
          startContent={
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Volver a Transacciones
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
          <div className="flex w-full items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Nueva Transacción</h1>
              <p className="text-small text-default-500">
                Registra un nuevo ingreso, gasto o transferencia
              </p>
            </div>
            <Button
              color="secondary"
              variant="flat"
              startContent={<CameraIcon className="size-4" />}
              onPress={() => setIsScannerOpen(true)}
            >
              Escanear Factura
            </Button>
          </div>

          {scanResult && (
            <div className="mt-4 flex w-full flex-col gap-2 rounded-lg bg-default-100 p-3">
              <div className="flex items-center gap-2">
                <span className="text-small font-medium">Datos extraídos de factura</span>
                {scanResult.confidence < 0.8 && (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    startContent={<ExclamationTriangleIcon className="size-3" />}
                  >
                    Confianza baja ({Math.round(scanResult.confidence * 100)}%)
                  </Chip>
                )}
              </div>
              {matchedCategory && (
                <span className="text-small text-default-500">
                  Categoría: {matchedCategory.name}
                  {matchedSubcategory && ` → ${matchedSubcategory.name}`}
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <TransactionForm
            ref={formRef}
            workspaceId={workspaceId}
            accounts={accounts ?? []}
            categories={categories ?? []}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            error={createMutation.error}
            submitLabel="Crear Transacción"
          />
        </CardBody>
      </Card>

      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} size="lg">
        <ModalContent>
          <InvoiceScanner
            workspaceId={workspaceId}
            onScanComplete={handleScanComplete}
            onClose={() => setIsScannerOpen(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
}
