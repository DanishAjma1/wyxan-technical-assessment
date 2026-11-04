import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        throw new BadRequestException({
          statusCode: 400,
          error: 'Validation Failed',
          message: formattedErrors[0]?.message || 'Invalid request payload',
          details: formattedErrors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
