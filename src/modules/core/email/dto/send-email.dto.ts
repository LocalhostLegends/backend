export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface InviteEmailData {
  to: string;
  role: string;
  companyName: string;
  invitedByName: string;
  inviteLink: string;
}

export interface WelcomeEmailData {
  to: string;
  firstName: string;
  loginLink: string;
}