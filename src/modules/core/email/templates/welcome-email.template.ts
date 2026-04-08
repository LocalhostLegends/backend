export const getWelcomeEmailTemplate = (firstName: string, loginLink: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to our platform</title>
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
          <h1>Welcome, ${firstName}! 🎉</h1>
        </div>
        <div class="content">
          <p>Thank you for joining our platform!</p>
          <p>Your account has been successfully activated. You can now log in and start using all the features.</p>
          <p style="text-align: center;">
            <a href="${loginLink}" class="button">Log In Now</a>
          </p>
          <p>Or copy this link to your browser:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">${loginLink}</p>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
