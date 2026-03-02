import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@auth-service/prisma/prisma.service';
import { TokenService } from '@auth-service/auth/token.service';
import { RabbitmqService } from '@auth-service/events/rabbitmq/rabbitmq.service';
import type { RegisterDto } from '@auth-service/auth/dtos/register.dto';
import type { LoginDto } from '@auth-service/auth/dtos/login.dto';
import { createLogger } from '@repo/logger';
import { EVENTS_EXCHANGES, ROUTING_KEYS } from '@auth-service/events/events.constants';

const SALT_ROUNDS = 12;
const logger = createLogger('auth-service');

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rabbitmq: RabbitmqService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
      },
    });

    await this.rabbitmq.publishMessage(EVENTS_EXCHANGES, ROUTING_KEYS.USER_CREATED, user);

    await this.rabbitmq.publishMessage(EVENTS_EXCHANGES, ROUTING_KEYS.WELCOME_EMAIL, {
      ...user,
      template: 'verifyEmail',
    });

    logger.info({ userId: user.id }, 'User registered');

    return this.tokenService.generateTokenPair(user.id);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const isValid = user && (await bcrypt.compare(dto.password, user.password));

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.tokenService.generateTokenPair(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const result = await this.tokenService.rotateRefreshToken(refreshToken);

    if (!result) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const accessToken = this.tokenService.generateAccessToken(result.userId);

    return {
      accessToken,
      refreshToken: result.refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }
}
