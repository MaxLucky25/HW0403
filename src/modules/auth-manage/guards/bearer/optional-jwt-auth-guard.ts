import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // Если родительский метод не сработал, но есть токен,
      // пытаемся обработать его вручную
      const authHeader = request.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
          const secret = this.configService.get<string>('JWT_SECRET');
          if (secret) {
            const payload = this.jwtService.verify(token, { secret });
            request.user = payload; // Явно устанавливаем пользователя
            return true;
          }
        } catch (jwtError) {
          // Токен невалиден
        }
      }

      // Нет токена или токен невалиден - разрешаем доступ без пользователя
      request.user = undefined;
      return true;
    }
  }

  handleRequest(err: any, user: any): any {
    // Не выбрасываем ошибку, если пользователь не найден
    // Если user === false, возвращаем undefined
    return user === false ? undefined : user;
  }
}
