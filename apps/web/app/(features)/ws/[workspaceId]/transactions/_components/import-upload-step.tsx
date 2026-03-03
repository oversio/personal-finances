"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { DocumentArrowDownIcon, DocumentArrowUpIcon } from "@repo/ui/icons";
import { useCallback, useState } from "react";
import { getImportTemplateUrl } from "../_api/get-import-template/get-import-template";

interface ImportUploadStepProps {
  workspaceId: string;
  onFileSelect: (file: File) => void;
  isPending: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["text/csv", "application/csv", "text/comma-separated-values"];

export function ImportUploadStep({ workspaceId, onFileSelect, isPending }: ImportUploadStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo excede el tamaño máximo de 5MB";
    }
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith(".csv")) {
      return "Solo se aceptan archivos CSV";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Sube tu archivo de transacciones</h2>
        <p className="mt-1 text-small text-default-500">
          Usa nuestra plantilla CSV o sube tu propio archivo con el mismo formato
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          as="a"
          href={getImportTemplateUrl(workspaceId)}
          download="transactions-template.csv"
          variant="flat"
          color="primary"
          startContent={<DocumentArrowDownIcon className="size-5" />}
        >
          Descargar plantilla CSV
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <label
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-default-300 hover:border-primary"
            } ${isPending ? "cursor-not-allowed opacity-50" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleInputChange}
              disabled={isPending}
              className="hidden"
            />
            <DocumentArrowUpIcon className="size-12 text-default-400" />
            <p className="mt-4 text-center text-default-600">
              <span className="font-medium text-primary">Haz clic para seleccionar</span> o arrastra
              tu archivo aquí
            </p>
            <p className="mt-2 text-small text-default-400">CSV (máx. 5MB)</p>
          </label>
        </CardBody>
      </Card>

      {error && <p className="text-center text-small text-danger">{error}</p>}
    </div>
  );
}
