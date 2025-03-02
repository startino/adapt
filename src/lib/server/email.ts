import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

// Create a test account if SMTP settings are not provided
let transporter: nodemailer.Transporter;

export async function initializeEmailService() {
  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
    // Use provided SMTP settings
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else if (env.NODE_ENV !== 'production') {
    // Create a test account for development
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Ethereal Email credentials:', {
      user: testAccount.user,
      pass: testAccount.pass,
      preview: 'https://ethereal.email'
    });
  } else {
    console.error('No email configuration provided for production environment');
  }
}

export async function sendVerificationEmail(email: string, token: string, origin: string) {
  if (!transporter) {
    await initializeEmailService();
  }
  
  // Create verification URL
  const verificationUrl = `${origin}/verify?token=${token}`;
  
  // Send email
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM || '"Your App" <no-reply@example.com>',
    to: email,
    subject: 'Verify your email address',
    text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
    html: `
      <div>
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; text-decoration: none;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
      </div>
    `,
  });
  
  if (env.NODE_ENV !== 'production' && info.messageId) {
    console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
} 

export async function sendOTPEmail(email: string, otp: string) {
  if (!transporter) {
    await initializeEmailService();
  }
  
  // Send email
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM || '"Your App" <no-reply@example.com>',
    to: email,
    subject: 'Your One-Time Password',
    text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `
      <div>
        <h1>Your Verification Code</h1>
        <p>Enter the following code to verify your email address:</p>
        <div style="padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; background-color: #f0f0f0; border-radius: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
  
  if (env.NODE_ENV !== 'production' && info.messageId) {
    console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
} 

export async function sendCombinedAuthEmail(email: string, token: string, otp: string, origin: string) {
  if (!transporter) {
    await initializeEmailService();
  }
  
  // Create verification URL
  const verificationUrl = `${origin}/verify?token=${token}`;
  const otpUrl = `${origin}/verify-otp?email=${encodeURIComponent(email)}`;
  
  // Send email with both authentication methods
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM || '"Your App" <no-reply@example.com>',
    to: email,
    subject: 'Sign in to your account',
    text: `
Sign in to Your Account

Method 1: Click the link below
${verificationUrl}

Method 2: Use this verification code: ${otp}
Go to ${otpUrl} and enter the code.

The verification code will expire in 10 minutes.
    `,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center; margin-bottom: 24px;">Sign in to Your Account</h1>
        
        <div style="margin-bottom: 32px;">
          <h2 style="color: #555;">Method 1: Click the button below</h2>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
              Sign In
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${verificationUrl}</p>
        </div>
        
        <div style="margin: 32px 0; border-top: 1px solid #eee; padding-top: 32px;">
          <h2 style="color: #555;">Method 2: Use this verification code</h2>
          <div style="padding: 16px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; background-color: #f0f0f0; border-radius: 4px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #666;">
            Then go to <a href="${otpUrl}" style="color: #4285f4;">${otpUrl}</a> and enter the code.
          </p>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 13px;">
          <p>If you didn't request this email, please ignore it.</p>
        </div>
      </div>
    `,
  });
  
  if (env.NODE_ENV !== 'production' && info.messageId) {
    console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
} 