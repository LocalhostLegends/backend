import { Controller, Post, Delete, UseInterceptors, UploadedFile, UseGuards, Req, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CloudflareService } from '@/modules/cloudflare/cloudflare.service';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { AvatarSwagger } from '../swagger/avatar.swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users/me/avatar')
@UseGuards(JwtAuthGuard)
export class AvatarController {
  constructor(
    private readonly cloudflare: CloudflareService,
    private readonly users: UsersService,
  ) { }

  @Post()
  @AvatarSwagger.upload()
  @UseInterceptors(FileInterceptor('avatar'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.users.findById(req.user.id);
    const { url } = await this.cloudflare.uploadAvatar(file, req.user.email, user.avatar);
    await this.users.update(req.user.id, { avatar: url }, req.user);

    return { avatar: url };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @AvatarSwagger.delete()
  async delete(@Req() req) {
    const user = await this.users.findById(req.user.id);

    if (user.avatar) {
      const key = this.cloudflare.extractKeyFromUrl(user.avatar);
      if (key) {
        await this.cloudflare.deleteFile(key);
      }
    }

    await this.users.update(req.user.id, { avatar: null }, req.user);
    return { message: 'Avatar deleted' };
  }
}