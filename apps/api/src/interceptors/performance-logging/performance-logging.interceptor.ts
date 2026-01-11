import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PerformanceLoggingService } from './performance-logging.service';

@Injectable()
export class PerformanceLoggingInterceptor implements NestInterceptor {
  public constructor(
    private readonly performanceLoggingService: PerformanceLoggingService
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    const startTime = performance.now();

    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        return this.performanceLoggingService.logPerformance({
          className,
          methodName,
          startTime
        });
      })
    );
  }
}

export function LogPerformance(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = async function (...args: unknown[]): Promise<unknown> {
    const startTime = performance.now();
    const performanceLoggingService = new PerformanceLoggingService();

    const result = originalMethod.apply(this, args);

    if (result instanceof Promise) {
      // Handle async method
      return result
        .then((res: unknown) => {
          performanceLoggingService.logPerformance({
            startTime,
            className: (target as any).constructor.name,
            methodName: propertyKey
          });

          return res;
        })
        .catch((error: unknown) => {
          throw error;
        });
    } else {
      // Handle sync method
      performanceLoggingService.logPerformance({
        startTime,
        className: (target as any).constructor.name,
        methodName: propertyKey
      });

      return result;
    }
  };

  return descriptor;
}
