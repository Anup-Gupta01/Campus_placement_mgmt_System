/**
 * lib/emailTemplates.ts
 * 
 * Formal, professional, and attractive email templates for Campus Placement System.
 * We use inline CSS and structured tables to ensure maximum email client compatibility (like Outlook & Gmail).
 */

const baseStyles = `
  body {
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f7f6;
    margin: 0;
    padding: 0;
    color: #333333;
  }
  .email-wrapper {
    width: 100%;
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    overflow: hidden;
  }
  .header {
    background-color: #1e3a8a; /* Deep Blue */
    color: #ffffff;
    padding: 30px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
    letter-spacing: 1px;
    font-weight: 600;
  }
  .content {
    padding: 40px 30px;
    line-height: 1.6;
    font-size: 16px;
    color: #4a5568;
  }
  .cta-container {
    text-align: center;
    margin: 30px 0;
  }
  .cta-button {
    display: inline-block;
    padding: 14px 28px;
    background-color: #2563eb;
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    border-radius: 6px;
    transition: background-color 0.3s;
  }
  .otp-box {
    display: inline-block;
    padding: 15px 30px;
    background-color: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    font-size: 32px;
    font-weight: bold;
    color: #0f172a;
    letter-spacing: 4px;
    margin: 20px 0;
  }
  .footer {
    background-color: #f8fafc;
    padding: 20px 30px;
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
  }
`;

/**
 * OTP Email Template
 */
export const getOtpEmailTemplate = (otpCode: string, userName: string = "User"): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Security Code</title>
        <style>
          ${baseStyles}
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>Campus Placement Portal</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>We received a request indicating you forgot your password, or you are trying to verify your account. Please use the following One-Time Password (OTP) to proceed.</p>
            
            <div class="cta-container">
              <div class="otp-box">${otpCode}</div>
            </div>
            
            <p style="font-size: 14px; color: #64748b;">
              <strong>Security Protocol:</strong> For your protection, this code will expire in 15 minutes. 
              Do not share this code with anyone, including university staff or administrators.
            </p>
            <p>If you did not initiate this request, you may safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Campus Placement System. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Forgot Password Email Template (Keeping just in case, even though we use OTP now)
 */
export const getResetPasswordTemplate = (resetLink: string, userName: string = "User"): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          ${baseStyles}
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>Campus Placement Portal</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>We received a request to reset the password associated with your account. If you made this request, please click the secure button below to choose a new password.</p>
            
            <div class="cta-container">
              <a href="${resetLink}" class="cta-button">Reset My Password</a>
            </div>
            
            <p style="font-size: 14px; color: #64748b;">
              This link is valid for 1 hour. If the button above does not work, carefully copy and paste the following link into your web browser:
              <br><br>
              <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
            </p>
            <p>If you did not request a password reset, no further action is required and your password will remain secure.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Campus Placement System. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
