import { Injectable, Logger } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { Resend } from 'resend';

import config from '@config/app.config';

import { getInviteEmailTemplate } from './templates/invite-email.template';
import { getWelcomeEmailTemplate } from './templates/welcome-email.template';
import { getPasswordResetEmailTemplate } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private readonly _logger = new Logger(EmailService.name);

  private _transporter?: Transporter<SentMessageInfo>;
  private _resend?: Resend;

  constructor() {
    this._initializeEmailProvider();
  }

  private _initializeEmailProvider(): void {
    if (config.email.provider === 'resend') {
      if (!config.email.resendApiKey) {
        this._logger.warn('Email API key is missing');
        return;
      }

      this._resend = new Resend(config.email.resendApiKey);
      this._logger.log('Email service initialized with API provider');
      return;
    }

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

    this._logger.log('Email service initialized with SMTP provider');
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

  async sendPasswordResetEmail(to: string, firstName: string, resetLink: string): Promise<void> {
    const html = getPasswordResetEmailTemplate(firstName, resetLink);

    await this._sendEmail({
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  private async _sendEmail(dto: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (config.email.provider === 'resend') {
      await this._sendEmailViaApi(dto);
      return;
    }

    await this._sendEmailViaSmtp(dto);
  }

  private async _sendEmailViaApi(dto: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this._resend) {
      this._logger.warn(`Email not sent to ${dto.to}: API provider is not configured`);
      return;
    }

    if (!config.email.from) {
      this._logger.warn(`Email not sent to ${dto.to}: EMAIL_FROM is not configured`);
      return;
    }

    try {
      const { error } = await this._resend.emails.send({
        from: config.email.from,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text || this._stripHtml(dto.html),
      });

      if (error) {
        this._logger.error(`Failed to send email to ${dto.to} via API: ${JSON.stringify(error)}`);
        throw new Error(error.message);
      }

      this._logger.log(`Email sent to ${dto.to} via API`);
    } catch (error) {
      this._logger.error(`Failed to send email to ${dto.to} via API:`, error);
      throw error;
    }
  }

  private async _sendEmailViaSmtp(dto: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this._transporter) {
      this._logger.warn(`Email not sent to ${dto.to}: SMTP provider is not configured`);
      return;
    }

    try {
      await this._transporter.sendMail({
        from: `"${config.smtp.sender.name}" <${config.smtp.sender.email}>`,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text || this._stripHtml(dto.html),
      });

      this._logger.log(`Email sent to ${dto.to} via SMTP`);
    } catch (error) {
      this._logger.error(`Failed to send email to ${dto.to} via SMTP:`, error);
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
    if (config.email.provider === 'resend') {
      const isConfigured = Boolean(this._resend && config.email.from);

      if (isConfigured) {
        this._logger.log('Email API provider configured');
      } else {
        this._logger.warn('Email API provider is not configured');
      }

      return isConfigured;
    }

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
