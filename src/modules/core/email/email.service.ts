import { Injectable, Logger } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

import config from '@config/app.config';

import { getInviteEmailTemplate } from './templates/invite-email.template';
import { getWelcomeEmailTemplate } from './templates/welcome-email.template';

@Injectable()
export class EmailService {
  private readonly _logger = new Logger(EmailService.name);

  private _transporter: Transporter<SentMessageInfo>;

  constructor() {
    this._initializeTransporter();
  }

  private _initializeTransporter(): void {
    this._logger.log(`SMTP env check:
    host=${config.smtp.host}
    port=${config.smtp.port}
    secure=${config.smtp.secure}
    user=${config.smtp.user}
    passwordExists=${Boolean(config.smtp.password)}
    senderName=${config.smtp.sender.name}
    senderEmail=${config.smtp.sender.email}
    `);

    this._transporter = createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    this._logger.log(`Email service initialized with SMTP host: ${config.smtp.host}`);
  }

  async sendInviteEmail(
    to: string,
    role: string,
    companyName: string,
    invitedByName: string,
    inviteLink: string,
  ): Promise<void> {
    const html = getInviteEmailTemplate(role, companyName, invitedByName, inviteLink);

    await this._sendEmail({
      to,
      subject: `You're invited to join ${companyName}`,
      html,
    });
  }

  async sendWelcome(to: string, firstName: string, loginLink: string): Promise<void> {
    const html = getWelcomeEmailTemplate(firstName, loginLink);

    await this._sendEmail({
      to,
      subject: 'Welcome to our platform! 🎉',
      html,
    });
  }

  private async _sendEmail(dto: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this._transporter) {
      this._logger.warn(`Email not sent to ${dto.to}: SMTP not configured`);
      return;
    }

    try {
      const info = await this._transporter.sendMail({
        from: `"${config.smtp.sender.name}" <${config.smtp.sender.email}>`,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text || this._stripHtml(dto.html),
      });

      this._logger.log(`Email sent to ${dto.to}: ${info.messageId}`);
    } catch (error) {
      this._logger.error(`Failed to send email to ${dto.to}:`, error);
      throw error;
    }
  }

  private _stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async testConnection(): Promise<boolean> {
    if (!this._transporter) {
      return false;
    }

    try {
      await this._transporter.verify();
      this._logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this._logger.error('SMTP connection failed:', error);
      return false;
    }
  }
}
