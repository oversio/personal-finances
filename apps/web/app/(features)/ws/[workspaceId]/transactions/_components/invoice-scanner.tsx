"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Button, Card, CardBody, Progress, Spinner } from "@heroui/react";
import {
  CameraIcon,
  PhotoIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@repo/ui/icons";
import type { InvoiceScanResult } from "../_api/invoice-scan.types";
import { useScanInvoice } from "../_api/scan-invoice/use-scan-invoice";

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface InvoiceScannerProps {
  workspaceId: string;
  onScanComplete: (result: InvoiceScanResult) => void;
  onClose?: () => void;
}

export function InvoiceScanner({ workspaceId, onScanComplete, onClose }: InvoiceScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const scanMutation = useScanInvoice();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleScan = async () => {
    if (!selectedFile) return;

    scanMutation.mutate(
      { workspaceId, file: selectedFile },
      {
        onSuccess: result => {
          onScanComplete(result);
          onClose?.();
        },
      },
    );
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    scanMutation.reset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        <div className="flex items-center gap-2">
          <CameraIcon className="size-5 text-primary" />
          <h3 className="text-lg font-semibold">Escanear Factura</h3>
        </div>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors
              ${isDragActive ? "border-primary bg-primary/10" : "border-default-300 hover:border-primary hover:bg-default-100"}
            `}
          >
            <input {...getInputProps()} />
            <PhotoIcon className="size-12 text-default-400" />
            <p className="mt-4 text-center text-default-600">
              {isDragActive
                ? "Suelta la imagen aquí..."
                : "Arrastra una imagen de factura o haz clic para seleccionar"}
            </p>
            <p className="mt-2 text-center text-small text-default-400">
              JPEG, PNG, WebP o GIF (máx. 10MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative h-48 w-full">
              <Image
                src={preview ?? ""}
                alt="Vista previa de factura"
                fill
                className="rounded-lg object-cover"
                unoptimized
              />
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="flat"
                className="absolute right-2 top-2"
                onPress={handleRemoveFile}
                isDisabled={scanMutation.isPending}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-small text-default-500">
              <span className="truncate">{selectedFile.name}</span>
              <span>{formatFileSize(selectedFile.size)}</span>
            </div>

            {scanMutation.isPending && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-small text-default-600">Analizando factura...</span>
                </div>
                <Progress isIndeterminate aria-label="Escaneando..." size="sm" color="primary" />
              </div>
            )}

            {scanMutation.isError && (
              <div className="flex items-center gap-2 rounded-lg bg-danger-50 p-3">
                <ExclamationTriangleIcon className="size-5 text-danger" />
                <span className="text-small text-danger">
                  {scanMutation.error?.message || "Error al escanear la factura"}
                </span>
              </div>
            )}

            {scanMutation.isSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3">
                <CheckCircleIcon className="size-5 text-success" />
                <span className="text-small text-success">Factura escaneada correctamente</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          {onClose && (
            <Button variant="flat" onPress={onClose} isDisabled={scanMutation.isPending}>
              Cancelar
            </Button>
          )}
          <Button
            color="primary"
            onPress={handleScan}
            isDisabled={!selectedFile || scanMutation.isPending}
            isLoading={scanMutation.isPending}
            startContent={!scanMutation.isPending && <CameraIcon className="size-4" />}
          >
            Escanear
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
