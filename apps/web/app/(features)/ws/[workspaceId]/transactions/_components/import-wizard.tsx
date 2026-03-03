"use client";

import { useState } from "react";
import { useConfirmImport } from "../_api/confirm-import/use-confirm-import";
import type { ConfirmImportResponse, PreviewImportResponse } from "../_api/import.types";
import { usePreviewImport } from "../_api/preview-import/use-preview-import";
import { ImportConfirmStep } from "./import-confirm-step";
import { ImportPreviewStep } from "./import-preview-step";
import { ImportResultStep } from "./import-result-step";
import { ImportUploadStep } from "./import-upload-step";

type WizardStep = "upload" | "preview" | "confirm" | "result";

interface ImportWizardProps {
  workspaceId: string;
}

export function ImportWizard({ workspaceId }: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [previewData, setPreviewData] = useState<PreviewImportResponse | null>(null);
  const [resultData, setResultData] = useState<ConfirmImportResponse | null>(null);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [createMissingCategories, setCreateMissingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previewMutation = usePreviewImport();
  const confirmMutation = useConfirmImport();

  const handleFileSelect = async (file: File) => {
    setError(null);
    previewMutation.mutate(
      { workspaceId, file },
      {
        onSuccess: data => {
          setPreviewData(data);
          setStep("preview");
        },
        onError: err => {
          setError(err instanceof Error ? err.message : "Error al procesar el archivo");
        },
      },
    );
  };

  const handleConfirm = async () => {
    if (!previewData) return;

    confirmMutation.mutate(
      {
        workspaceId,
        data: {
          sessionId: previewData.sessionId,
          skipInvalid,
          createMissingCategories,
        },
      },
      {
        onSuccess: data => {
          setResultData(data);
          setStep("result");
        },
        onError: err => {
          setError(err instanceof Error ? err.message : "Error al importar transacciones");
        },
      },
    );
  };

  const handleReset = () => {
    setStep("upload");
    setPreviewData(null);
    setResultData(null);
    setSkipInvalid(true);
    setCreateMissingCategories(true);
    setError(null);
    previewMutation.reset();
    confirmMutation.reset();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {(["upload", "preview", "confirm", "result"] as const).map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-small font-medium ${
                  step === s
                    ? "bg-primary text-white"
                    : idx < ["upload", "preview", "confirm", "result"].indexOf(step)
                      ? "bg-success text-white"
                      : "bg-default-200 text-default-500"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 3 && (
                <div
                  className={`mx-2 h-0.5 w-8 ${
                    idx < ["upload", "preview", "confirm", "result"].indexOf(step)
                      ? "bg-success"
                      : "bg-default-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-8 text-small text-default-500">
          <span className={step === "upload" ? "font-medium text-primary" : ""}>Subir</span>
          <span className={step === "preview" ? "font-medium text-primary" : ""}>Vista previa</span>
          <span className={step === "confirm" ? "font-medium text-primary" : ""}>Confirmar</span>
          <span className={step === "result" ? "font-medium text-primary" : ""}>Resultado</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-700">
          {error}
        </div>
      )}

      {step === "upload" && (
        <ImportUploadStep
          workspaceId={workspaceId}
          onFileSelect={handleFileSelect}
          isPending={previewMutation.isPending}
        />
      )}

      {step === "preview" && previewData && (
        <ImportPreviewStep
          rows={previewData.rows}
          summary={previewData.summary}
          categoriesToCreate={previewData.categoriesToCreate}
          onBack={() => setStep("upload")}
          onNext={() => setStep("confirm")}
        />
      )}

      {step === "confirm" && previewData && (
        <ImportConfirmStep
          summary={previewData.summary}
          categoriesToCreate={previewData.categoriesToCreate}
          skipInvalid={skipInvalid}
          onSkipInvalidChange={setSkipInvalid}
          createMissingCategories={createMissingCategories}
          onCreateMissingCategoriesChange={setCreateMissingCategories}
          onBack={() => setStep("preview")}
          onConfirm={handleConfirm}
          isPending={confirmMutation.isPending}
        />
      )}

      {step === "result" && resultData && (
        <ImportResultStep
          workspaceId={workspaceId}
          result={resultData}
          onImportMore={handleReset}
        />
      )}
    </div>
  );
}
