import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('🔍 OptionalJwtAuthGuard.canActivate - starting');
    console.log(
      '🔍 OptionalJwtAuthGuard.canActivate - auth header:',
      request.headers.authorization,
    );

    try {
      const result = await super.canActivate(context);
      console.log(
        '🔍 OptionalJwtAuthGuard.canActivate SUCCESS - result:',
        result,
      );
      console.log(
        '🔍 OptionalJwtAuthGuard.canActivate SUCCESS - request.user:',
        request.user,
      );
      return result as boolean;
    } catch (error) {
      console.log('🔍 OptionalJwtAuthGuard.canActivate ERROR:', error.message);
      console.log(
        '🔍 OptionalJwtAuthGuard.canActivate ERROR - request.user after error:',
        request.user,
      );
      return true;
    }
  }

  handleRequest(err: any, user: any): any {
    console.log('🔍 OptionalJwtAuthGuard.handleRequest called:', { err, user });
    // Не выбрасываем ошибку, если пользователь не найден
    // Если user === false, возвращаем undefined
    const result = user === false ? undefined : user;
    console.log('🔍 OptionalJwtAuthGuard.handleRequest returning:', result);
    return result;
  }
}
