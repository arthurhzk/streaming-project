import { BadRequestException, Controller, Delete, Get, Headers, Patch, Body } from '@nestjs/common';
import { ProfileService } from '@user-service/modules/profile/profile.service';
import { UpdateProfileDto } from '@user-service/modules/profile/dtos/update-profile.dto';

@Controller('users')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  private getUserId(header: string | undefined): string {
    if (!header || header.trim() === '') {
      throw new BadRequestException('X-User-Id header is required');
    }
    return header.trim();
  }

  @Get('me')
  async getMe(@Headers('x-user-id') userIdHeader: string | undefined) {
    const userId = this.getUserId(userIdHeader);
    return this.profileService.getByUserId(userId);
  }

  @Patch('me')
  async updateMe(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = this.getUserId(userIdHeader);
    return this.profileService.update(userId, dto);
  }

  @Delete('me')
  async deleteMe(@Headers('x-user-id') userIdHeader: string | undefined) {
    const userId = this.getUserId(userIdHeader);
    await this.profileService.softDelete(userId);
    return { success: true };
  }
}
