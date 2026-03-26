import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudflareService } from './cloudflare.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule { }