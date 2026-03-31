import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StorageService } from '@/modules/storage/storage.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../../common/types/request-with-user';

import { UsersService } from '../users.service';
import { AvatarSwagger } from '../swagger/avatar.swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users/me/avatar')
@UseGuards(JwtAuthGuard)
export class AvatarController {
  constructor(
    private readonly storage: StorageService,
    private readonly users: UsersService,
  ) {}

  @Post()
  @AvatarSwagger.upload()
  @UseInterceptors(FileInterceptor('avatar'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const user = await this.users.findById(req.user.id);
    const { url } = await this.storage.uploadAvatar(
      file,
      req.user.email,
      user.avatar,
    );
    await this.users.update(req.user.id, { avatar: url }, req.user);

    return { avatar: url };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @AvatarSwagger.delete()
  async delete(@Req() req: RequestWithUser) {
    const user = await this.users.findById(req.user.id);

    if (user.avatar) {
      const key = this.storage.extractKeyFromUrl(user.avatar);
      if (key) {
        await this.storage.deleteFile(key);
      }
    }

    await this.users.update(req.user.id, { avatar: null }, req.user);
    return { message: 'Avatar deleted' };
  }
}
