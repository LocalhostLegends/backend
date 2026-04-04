export const getInviteEmailTemplate = (
  role: string,
  companyName: string,
  invitedByName: string,
  inviteLink: string,
): string => {
  const roleLabel = role === 'hr' ? 'HR Manager' : role === 'admin' ? 'Administrator' : 'Employee';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're invited to join ${companyName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${companyName}</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${invitedByName}</strong> has invited you to join <strong>${companyName}</strong> as a <strong>${roleLabel}</strong>.</p>
          <p>Click the button below to set up your account:</p>
          <p style="text-align: center;">
            <a href="${inviteLink}" class="button">Accept Invitation</a>
          </p>
          <p>Or copy this link to your browser:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">${inviteLink}</p>
          <p>This link will expire in 48 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't expect this invitation, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};