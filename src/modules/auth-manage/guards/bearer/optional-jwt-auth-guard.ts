import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ВРЕМЕННОЕ РЕШЕНИЕ: выбрасываем ошибку с информацией о заголовках
    const authHeader = request.headers.authorization;
    const allHeaders = request.headers;

    throw new DomainException({
      code: DomainExceptionCode.InternalServerError,
      message: `DEBUG INFO - Auth Header: ${authHeader}, All Headers: ${JSON.stringify(allHeaders)}`,
      field: 'Debug',
    });

    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      return true;
    }
  }

  handleRequest(err: any, user: any): any {
    // Не выбрасываем ошибку, если пользователь не найден
    // Если user === false, возвращаем undefined
    return user === false ? undefined : user;
  }
}
