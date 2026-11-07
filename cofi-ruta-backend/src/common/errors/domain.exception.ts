import { HttpException } from '@nestjs/common';

export interface DomainErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Error de dominio con un código estable para el cliente.
 * El cuerpo siempre tiene la forma `{ statusCode, code, message, details? }`.
 */
export class DomainException extends HttpException {
  readonly code: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    const body: DomainErrorBody = { statusCode, code, message };
    if (details !== undefined) {
      body.details = details;
    }
    super(body, statusCode);
    this.code = code;
  }
}
