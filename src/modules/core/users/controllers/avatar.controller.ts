import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { AvatarDeleteResponseDto } from '@modules/core/users/dto/avatar-delete-response.dto';
import { AvatarUploadResponseDto } from '@modules/core/users/dto/avatar-upload-response.dto';
import { UsersService } from '@modules/core/users/users.service';
import type { AuthorizedUser } from '@/modules/core/users/users.types';

import { StorageService } from '@/modules/storage/storage.service';
import { swagger } from '../swagger';

@swagger.ApiTags()
@Controller('users/me/avatar')
@UseGuards(JwtAuthGuard)
export class AvatarController {
  constructor(
    private readonly _storageService: StorageService,
    private readonly _usersService: UsersService,
  ) {}

  @Post()
  @swagger.ApiUploadAvatar()
  @UseInterceptors(FileInterceptor('avatar'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<AvatarUploadResponseDto> {
    const user = await this._usersService.findById(currentUser.id);

    const { url } = await this._storageService.uploadAvatar(
      file,
      currentUser.companyId,
      currentUser.email,
      user.avatar,
    );

    await this._usersService.update(user.id, { avatar: url }, currentUser);

    return {
      success: true,
      avatar: url,
      message: 'Avatar uploaded successfully',
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @swagger.ApiDeleteAvatar()
  async delete(@CurrentUser() currentUser: AuthorizedUser): Promise<AvatarDeleteResponseDto> {
    const user = await this._usersService.findById(currentUser.id);

    if (user.avatar) {
      const key = this._storageService.extractKeyFromUrl(user.avatar);
      if (key) {
        await this._storageService.deleteFile(key);
      }
    }

    await this._usersService.update(user.id, { avatar: null }, currentUser);

    return {
      success: true,
      message: 'Avatar deleted successfully',
    };
  }
}
