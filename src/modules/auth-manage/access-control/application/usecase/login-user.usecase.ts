import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { LoginInputDto } from '../../api/input-dto/login.input.dto';

export class LoginUserCommand {
  constructor(public readonly dto: LoginInputDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, { accessToken: string }>
{
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<{ accessToken: string }> {
    const userId = await this.authService.validateUser(command.dto);
    const accessToken = this.jwtService.sign(userId);
    return { accessToken };
  }
}
