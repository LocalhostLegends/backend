import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM')!;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }

    if (!this.fromEmail) {
      throw new Error('RESEND_FROM is not defined in environment variables');
    }

    this.resend = new Resend(apiKey);
  }

  async sendInvitation(
    to: string,
    name: string,
    activationLink: string,
    companyName: string,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: 'You are invited!',
      html: `
        <h1>Hello ${name}!</h1>
        <p>You have been invited to join ${companyName}.</p>
        <a href="${activationLink}">Activate your account</a>
        <p>This link expires in 48 hours.</p>
      `,
    });

    this.logger.log(`Invitation sent to ${to}`);
  }

  async sendWelcome(
    to: string,
    name: string,
    loginLink: string,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: 'Welcome!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Your account has been activated successfully.</p>
        <a href="${loginLink}">Login here</a>
      `,
    });

    this.logger.log(`Welcome email sent to ${to}`);
  }

  async sendPasswordReset(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject: 'Reset your password',
      html: `
        <h1>Hello ${name}!</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    this.logger.log(`Password reset email sent to ${to}`);
  }
}