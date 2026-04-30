import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class SmtpDebugService implements OnModuleInit {
  private readonly logger = new Logger('SMTP_DEBUG');

  onModuleInit() {
    // ждём пока приложение полностью поднимется
    setTimeout(() => {
      this.testConnection('smtp.gmail.com', 587);
      this.testConnection('smtp.resend.com', 587);
    }, 5000);
  }

  private testConnection(host: string, port: number) {
    this.logger.log(`Testing TCP connection to ${host}:${port}...`);

    const socket = net.createConnection(port, host);

    socket.setTimeout(10000);

    socket.on('connect', () => {
      this.logger.log(`✅ CONNECT OK → ${host}:${port}`);
      socket.destroy();
    });

    socket.on('timeout', () => {
      this.logger.error(`❌ TIMEOUT → ${host}:${port}`);
      socket.destroy();
    });

    socket.on('error', (err) => {
      this.logger.error(`❌ ERROR → ${host}:${port} | ${err.message}`);
    });
  }
}
