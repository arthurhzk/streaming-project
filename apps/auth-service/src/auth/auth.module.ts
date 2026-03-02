import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '@auth-service/prisma/prisma.module';
import { AuthController } from '@auth-service/auth/auth.controller';
import { AuthService } from '@auth-service/auth/auth.service';
import { RabbitmqService } from '@auth-service/events/rabbitmq/rabbitmq.service';
import { TokenService } from '@auth-service/auth/token.service';
import { JwtStrategy } from '@auth-service/auth/strategies/jwt.strategy';
import env from '@auth-service/config/env';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN as unknown as number },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy, RabbitmqService],
  exports: [AuthService],
})
export class AuthModule {}
