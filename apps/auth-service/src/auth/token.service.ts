import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '@auth-service/prisma/prisma.service';
import env from '@auth-service/config/env';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  generateAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId }, {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    } as JwtSignOptions);
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign({ sub: userId, type: 'refresh' }, {
      secret: env.JWT_SECRET,
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    } as JwtSignOptions);

    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async generateTokenPair(userId: string): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.generateAccessToken(userId)),
      this.generateRefreshToken(userId),
    ]);
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(token: string): Promise<{ userId: string } | null> {
    try {
      const payload = this.jwtService.verify<{ sub: string; type?: string }>(token, {
        secret: env.JWT_SECRET,
      });

      const stored = await this.prisma.refreshToken.findUnique({
        where: { token },
      });

      if (!stored || stored.expiresAt < new Date()) {
        return null;
      }

      return { userId: payload.sub };
    } catch {
      return null;
    }
  }

  async rotateRefreshToken(
    oldToken: string,
  ): Promise<{ userId: string; refreshToken: string } | null> {
    const validated = await this.validateRefreshToken(oldToken);
    if (!validated) {
      return null;
    }

    await this.prisma.refreshToken.deleteMany({
      where: { token: oldToken },
    });

    const refreshToken = await this.generateRefreshToken(validated.userId);
    return { userId: validated.userId, refreshToken };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }
}
