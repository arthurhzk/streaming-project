import { Injectable } from '@nestjs/common';
import { PrismaService } from '@user-service/prisma/prisma.service';
import { ProfileStatus } from '@user-service/generated/prisma/client';

export interface CreateProfileData {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  async create(data: CreateProfileData) {
    return this.prisma.profile.create({
      data: {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  async update(userId: string, data: { firstName?: string; lastName?: string; bio?: string }) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }

  async softDelete(userId: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { status: ProfileStatus.DELETED },
    });
  }
}
