import { getErrorMessage } from "@/_commons/i18n/error-messages";

type ValidationError = {
  code: string;
  description: string;
};

export class ValidationErrors extends Error {
  readonly name = "ValidationErrors";

  // General errors API
  private _generalErrors: ValidationError[] = [];

  addGeneralError(code: string, description: string) {
    this._generalErrors.push({ code, description });
  }

  get generalErrors() {
    return this._generalErrors;
  }

  get hasGeneralErrors() {
    return Boolean(this.generalErrors?.length);
  }

  get generalErrorsMessage() {
    return ValidationErrors._validationErrorsMessage(this.generalErrors);
  }

  // Field errors API
  private _fieldErrors: Record<string, ValidationError[]> = {};

  addFieldError(fieldName: string, code: string, description: string) {
    this._fieldErrors[fieldName] ||= [];
    this._fieldErrors[fieldName].push({ code, description });
  }

  fieldErrors(fieldName: string): ValidationError[] | undefined {
    return this._fieldErrors[fieldName];
  }

  hasFieldErrors(fieldName?: string) {
    return Boolean(
      fieldName ? this.fieldErrors(fieldName)?.length : Object.keys(this._fieldErrors).length,
    );
  }

  fieldErrorsMessage(fieldName: string) {
    return ValidationErrors._validationErrorsMessage(this.fieldErrors(fieldName));
  }

  get fieldsWithErrors() {
    return Object.keys(this._fieldErrors);
  }

  // Translation helper - uses Spanish translations with fallback to API description
  private static _validationErrorsMessage(errors: ValidationError[] | undefined) {
    return errors?.map(error => getErrorMessage(error.code, error.description)).join(" ");
  }
}

export function isValidationErrors(error: unknown): error is ValidationErrors {
  return error instanceof ValidationErrors;
}
