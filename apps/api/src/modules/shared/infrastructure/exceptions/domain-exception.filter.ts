import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import type { ZodIssue } from "zod";
import { ZodError } from "zod";
import {
  DomainException,
  ErrorCodes,
  type ApiError,
  type StandardErrorResponse,
  type ValidationErrorResponse,
} from "../../domain/exceptions";

/**
 * Maps exception class names to HTTP status codes.
 */
const EXCEPTION_STATUS_MAP: Record<string, HttpStatus> = {
  // Forbidden errors (403)
  WorkspaceAccessDeniedError: HttpStatus.FORBIDDEN,

  // Not Found errors (404)
  EntityNotFoundError: HttpStatus.NOT_FOUND,
  UserNotFoundError: HttpStatus.NOT_FOUND,
  WorkspaceNotFoundError: HttpStatus.NOT_FOUND,
  WorkspaceMemberNotFoundError: HttpStatus.NOT_FOUND,
  TransactionNotFoundError: HttpStatus.NOT_FOUND,
  AccountNotFoundError: HttpStatus.NOT_FOUND,
  CategoryNotFoundError: HttpStatus.NOT_FOUND,
  BudgetNotFoundError: HttpStatus.NOT_FOUND,

  // Unprocessable Entity errors (422) - Business rules, validation
  EntityAlreadyExistsError: HttpStatus.UNPROCESSABLE_ENTITY,
  UserAlreadyExistsError: HttpStatus.UNPROCESSABLE_ENTITY,
  UserAlreadyMemberError: HttpStatus.UNPROCESSABLE_ENTITY,
  InvalidCredentialsError: HttpStatus.UNPROCESSABLE_ENTITY,
  InvalidRefreshTokenError: HttpStatus.UNPROCESSABLE_ENTITY,
  OAuthAccountNotLinkedError: HttpStatus.UNPROCESSABLE_ENTITY,
  PasswordRequiredError: HttpStatus.UNPROCESSABLE_ENTITY,
  InsufficientBalanceError: HttpStatus.UNPROCESSABLE_ENTITY,
  BudgetExceededError: HttpStatus.UNPROCESSABLE_ENTITY,

  // Bad Request errors (400)
  InvalidEntityIdError: HttpStatus.BAD_REQUEST,
};

/**
 * Maps Zod issue codes to our validation error codes.
 */
function mapZodIssueToErrorCode(code: ZodIssue["code"]): string {
  const mapping: Record<string, string> = {
    invalid_type: ErrorCodes.validation.invalidType,
    invalid_string: ErrorCodes.validation.invalidFormat,
    too_small: ErrorCodes.validation.tooSmall,
    too_big: ErrorCodes.validation.tooBig,
  };
  return mapping[code] ?? ErrorCodes.validation.invalidFormat;
}

/**
 * Gets a human-readable error name from HTTP status code.
 */
function getErrorName(status: HttpStatus): string {
  const names: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: "Bad Request",
    [HttpStatus.UNAUTHORIZED]: "Unauthorized",
    [HttpStatus.FORBIDDEN]: "Forbidden",
    [HttpStatus.NOT_FOUND]: "Not Found",
    [HttpStatus.CONFLICT]: "Conflict",
    [HttpStatus.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
    [HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
  };
  return names[status] ?? "Error";
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    const errorResponse = this.buildErrorResponse(exception, path);

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `Internal Server Error: ${exception instanceof Error ? exception.message : "Unknown error"}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    return response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    path: string,
  ): ValidationErrorResponse | StandardErrorResponse {
    const timestamp = new Date().toISOString();

    // Zod validation errors -> 422 with errors array
    if (exception instanceof ZodError) {
      const errors: ApiError[] = exception.issues.map(issue => ({
        errorCode: mapZodIssueToErrorCode(issue.code),
        errorDescription: issue.message,
        fieldName: issue.path.length > 0 ? issue.path.join(".") : null,
        handler: "user" as const,
      }));

      return {
        statusCode: 422,
        timestamp,
        path,
        errors,
      };
    }

    // NestJS HTTP exceptions (e.g., UnauthorizedException from passport)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle string responses
      if (typeof exceptionResponse === "string") {
        return {
          statusCode: status,
          timestamp,
          path,
          error: getErrorName(status),
          message: exceptionResponse,
        };
      }

      // Handle object responses (NestJS default format)
      const responseObj = exceptionResponse as { message?: string | string[]; error?: string };
      const message = Array.isArray(responseObj.message)
        ? responseObj.message.join(", ")
        : (responseObj.message ?? exception.message);

      return {
        statusCode: status,
        timestamp,
        path,
        error: responseObj.error ?? getErrorName(status),
        message,
      };
    }

    // Domain exceptions
    if (exception instanceof DomainException) {
      const status = EXCEPTION_STATUS_MAP[exception.name] ?? HttpStatus.UNPROCESSABLE_ENTITY;

      // 422 errors use Format A (errors array)
      if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        return {
          statusCode: 422,
          timestamp,
          path,
          errors: [
            {
              errorCode: exception.errorCode,
              errorDescription: exception.message,
              fieldName: exception.fieldName,
              handler: exception.handler,
            },
          ],
        };
      }

      // Other status codes use Format B (simple message)
      return {
        statusCode: status,
        timestamp,
        path,
        error: getErrorName(status),
        message: exception.message,
      };
    }

    // Known Error types with mapped status
    if (exception instanceof Error) {
      const status = EXCEPTION_STATUS_MAP[exception.name];

      if (status) {
        return {
          statusCode: status,
          timestamp,
          path,
          error: getErrorName(status),
          message: exception.message,
        };
      }
    }

    // Unknown errors -> 500
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    };
  }
}
