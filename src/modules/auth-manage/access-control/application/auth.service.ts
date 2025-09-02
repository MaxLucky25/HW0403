import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../user-accounts/infrastructure/user.repository';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from './helping-application/bcrypt.service';
import { EmailService } from './helping-application/email.service';
import { ConfigService } from '@nestjs/config';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PasswordRecoveryInputDto } from '../api/input-dto/password-recovery.input.dto';
import { NewPasswordInputDto } from '../api/input-dto/new-password.input.dto';
import { RegistrationConfirmationInputDto } from '../api/input-dto/registration-confirmation.input.dto';
import { RegistrationEmailResendingInputDto } from '../api/input-dto/registration-email-resending.input.dto';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/users.input-dto';
import { UserFactory } from '../../user-accounts/application/user.factory';
import { LoginInputDto } from '../api/input-dto/login.input.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private emailService: EmailService,
    private configService: ConfigService,
    private userFactory: UserFactory,
  ) {}

  private getExpiration(key: string): number {
    const value = this.configService.get<number>(key);
    if (value === undefined) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `Config value for ${key} is not set`,
        field: 'ConfigValue',
      });
    }
    return value;
  }

  private isCodeValid(entity: {
    isConfirmed: boolean;
    expirationDate: Date;
  }): boolean {
    const now = new Date();
    return !entity.isConfirmed && entity.expirationDate > now;
  }

  /////////

  async validateUser(dto: LoginInputDto): Promise<UserContextDto> {
    const user = await this.usersRepository.findByLoginOrEmail({
      loginOrEmail: dto.loginOrEmail,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
        field: 'loginOrEmail',
      });
    }

    const isPasswordValid = await this.bcryptService.compare({
      password: dto.password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
        field: 'Password',
      });
    }

    return { id: user._id.toString() };
  }

  login(userId: UserContextDto): { accessToken: string } {
    const accessToken = this.jwtService.sign(userId);
    return { accessToken };
  }

  async registerUser(dto: CreateUserInputDto): Promise<void> {
    const createdUser = await this.userFactory.create(dto);

    const expiration = this.getExpiration('EMAIL_CONFIRMATION_EXPIRATION');
    createdUser.resetEmailConfirmation(expiration);

    await this.usersRepository.save(createdUser);

    if (!createdUser.emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'emailConfirmation is not set',
        field: 'email',
      });
    }

    this.emailService
      .sendConfirmationEmail(
        createdUser.email,
        createdUser.emailConfirmation.confirmationCode,
      )
      .catch(() => {
        console.error('Email sending failed');
      });
  }

  async passwordRecovery(dto: PasswordRecoveryInputDto): Promise<void> {
    const user = await this.usersRepository.findByEmail({ email: dto.email });
    if (user) {
      const expiration = this.getExpiration('PASSWORD_RECOVERY_EXPIRATION');
      user.resetPasswordRecovery(expiration);
      await this.usersRepository.save(user);
      await this.emailService.sendRecoveryEmail(
        user.email,
        user.passwordRecovery!.recoveryCode,
      );
    }
    return;
  }

  async newPassword(dto: NewPasswordInputDto): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCode({
      recoveryCode: dto.recoveryCode,
    });
    if (!user?.passwordRecovery || !this.isCodeValid(user.passwordRecovery)) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Recovery code is not valid',
        field: 'recoveryCode',
      });
    }
    user.passwordHash = await this.bcryptService.generateHash({
      password: dto.newPassword,
    });
    user.passwordRecovery.isConfirmed = true;
    await this.usersRepository.save(user);
    return;
  }

  async registrationConfirmation(
    dto: RegistrationConfirmationInputDto,
  ): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode({
      confirmationCode: dto.code,
    });

    // Проверяем, что пользователь и emailConfirmation существуют
    if (!user?.emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Проверяем, что пользователь уже подтвержден
    if (user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Проверяем, что код уже подтвержден
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Проверяем, что код не истек
    if (user.emailConfirmation.expirationDate <= new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    user.isEmailConfirmed = true;
    user.emailConfirmation.isConfirmed = true;
    await this.usersRepository.save(user);
    return;
  }

  async registrationEmailResending(
    dto: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    const user = await this.usersRepository.findByEmail({ email: dto.email });
    if (!user || user.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.AlreadyConfirmed,
        message: 'Email already confirmed',
        field: 'email',
      });
    }
    const expiration = this.getExpiration('EMAIL_CONFIRMATION_EXPIRATION');
    user.resetEmailConfirmation(expiration);
    await this.usersRepository.save(user);
    await this.emailService.sendConfirmationEmail(
      user.email,
      user.emailConfirmation!.confirmationCode,
    );
    return;
  }
}
