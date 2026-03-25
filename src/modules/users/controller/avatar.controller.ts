import { Controller, Post, Delete, UseInterceptors, UploadedFile, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudflareService } from '@/modules/cloudflare/cloudflare.service';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('users/me/avatar')
@UseGuards(JwtAuthGuard)
export class AvatarController {
  constructor(
    private readonly cloudflare: CloudflareService,
    private readonly users: UsersService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.users.findById(req.user.id);
    const { url } = await this.cloudflare.uploadAvatar(file, req.user.email, user.avatar);
    await this.users.update(req.user.id, { avatar: url }, req.user);

    return { avatar: url };
  }

  @Delete()
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