import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

import { getInviteEmailTemplate } from './templates/invite-email.template';
import { getWelcomeEmailTemplate } from './templates/welcome-email.template';

@Injectable()
export class EmailService {
  private readonly _logger = new Logger(EmailService.name);

  private readonly _fromEmail: string;
  private readonly _fromName: string;

  private _transporter: Transporter<SentMessageInfo>;

  constructor(private readonly _configService: ConfigService) {
    this._fromEmail = this._configService.get<string>('smtp.fromEmail')!;
    this._fromName = this._configService.get<string>('smtp.fromName') || 'SaaS Platform';

    this._initializeTransporter();
  }

  private _initializeTransporter(): void {
    const host = this._configService.get<string>('smtp.host');
    const port = this._configService.get<string>('smtp.port');
    const user = this._configService.get<string>('smtp.user');
    const pass = this._configService.get<string>('smtp.pass');

    if (!host || !port || !user || !pass) {
      this._logger.warn('SMTP credentials not configured. Email service will be disabled.');
      return;
    }

    this._transporter = createTransport({
      host,
      port: parseInt(port) || 587,
      secure: this._configService.get('smtp.secure') === 'true',
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this._logger.log('Email service initialized with Gmail SMTP');
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
        from: `"${this._fromName}" <${this._fromEmail}>`,
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
