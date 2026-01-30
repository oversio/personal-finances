import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";
import { ZodError } from "zod";
import { DomainException } from "../../domain/exceptions";

const EXCEPTION_STATUS_MAP: Record<string, HttpStatus> = {
  // Not Found errors
  EntityNotFoundError: HttpStatus.NOT_FOUND,
  TransactionNotFoundError: HttpStatus.NOT_FOUND,
  AccountNotFoundError: HttpStatus.NOT_FOUND,
  CategoryNotFoundError: HttpStatus.NOT_FOUND,
  BudgetNotFoundError: HttpStatus.NOT_FOUND,

  // Conflict errors
  EntityAlreadyExistsError: HttpStatus.CONFLICT,

  // Bad Request errors
  InvalidEntityIdError: HttpStatus.BAD_REQUEST,

  // Business logic errors
  InsufficientBalanceError: HttpStatus.UNPROCESSABLE_ENTITY,
  BudgetExceededError: HttpStatus.UNPROCESSABLE_ENTITY,
};

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | { field: string; message: string }[];
  timestamp: string;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.buildErrorResponse(exception);

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `Internal Server Error: ${exception instanceof Error ? exception.message : "Unknown error"}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    return response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    // Zod validation errors
    if (exception instanceof ZodError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Validation Error",
        message: exception.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
        timestamp,
      };
    }

    // Domain exceptions
    if (exception instanceof DomainException) {
      const status = EXCEPTION_STATUS_MAP[exception.name] ?? HttpStatus.UNPROCESSABLE_ENTITY;

      return {
        statusCode: status,
        error: exception.name,
        message: exception.message,
        timestamp,
      };
    }

    // Known Error types with mapped status
    if (exception instanceof Error) {
      const status = EXCEPTION_STATUS_MAP[exception.name];

      if (status) {
        return {
          statusCode: status,
          error: exception.name,
          message: exception.message,
          timestamp,
        };
      }
    }

    // Unknown errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      timestamp,
    };
  }
}
