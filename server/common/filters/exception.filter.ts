import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // For non-API GET requests that 404, serve the SPA index.html
    if (status === 404 && request.method === 'GET' && !request.path.startsWith('/api/')) {
      return response.sendFile(join(process.cwd(), 'dist', 'client', 'index.html'));
    }

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';
    response.status(status).json({ success: false, message, statusCode: status });
  }
}
