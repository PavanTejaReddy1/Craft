import nodemailer from 'nodemailer';

/**
 * Email provider abstraction.
 * Swap the transporter configuration to use any provider (SendGrid, SES, Postmark, etc.)
 * without changing the rest of the codebase.
 */

const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, log emails to console instead of sending
    return {
      sendMail: async (options) => {
        console.log('\n📧 [DEV EMAIL]');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('---');
        console.log(options.text || options.html);
        console.log('---\n');
        return { messageId: 'dev-' + Date.now() };
      },
    };
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'CRAFT <noreply@craft.dev>',
      to,
      subject,
      html,
      text,
    });
    return result;
  } catch (error) {
    console.error('Email send failed:', error.message);
    throw new Error('Failed to send email');
  }
};

// ─── Email Templates ─────────────────────────────────────────────────────────

export const sendVerificationEmail = async (user, verificationToken) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your CRAFT account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">Welcome to CRAFT, ${user.name}!</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
    text: `Welcome to CRAFT, ${user.name}!\n\nVerify your email: ${url}\n\nExpires in 24 hours.`,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your CRAFT password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">Password Reset</h2>
        <p>Hi ${user.name}, you requested a password reset.</p>
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
    text: `Reset your CRAFT password: ${url}\n\nExpires in 1 hour.`,
  });
};

export const sendOfferNotificationEmail = async (client, offer, project) => {
  await sendEmail({
    to: client.email,
    subject: `New offer on "${project.title}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">You have a new offer!</h2>
        <p>A developer submitted an offer of ₹${offer.proposedPrice} for your project <strong>${project.title}</strong>.</p>
        <a href="${process.env.CLIENT_URL}/projects/${project._id}/offers" 
           style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          View Offer
        </a>
      </div>
    `,
    text: `New offer of ₹${offer.proposedPrice} on "${project.title}". View at ${process.env.CLIENT_URL}/projects/${project._id}/offers`,
  });
};

export const sendOfferAcceptedEmail = async (developer, project) => {
  await sendEmail({
    to: developer.email,
    subject: `Your offer was accepted — "${project.title}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">Congratulations! Your offer was accepted.</h2>
        <p>The client accepted your offer for <strong>${project.title}</strong>. Head to your workspace to get started.</p>
        <a href="${process.env.CLIENT_URL}/workspace/${project._id}"
           style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Open Workspace
        </a>
      </div>
    `,
    text: `Your offer for "${project.title}" was accepted! Open workspace: ${process.env.CLIENT_URL}/workspace/${project._id}`,
  });
};

export default { sendVerificationEmail, sendPasswordResetEmail, sendOfferNotificationEmail, sendOfferAcceptedEmail };
