const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const appName = process.env.APP_NAME || 'BusGo';
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || `"${appName}" <${process.env.EMAIL_USER}>`;

  if (!process.env.EMAIL_USER || !emailPass) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[sendEmail] Email config missing. Skipping email to ${String(to).trim()} in development.`);
      return { sent: false, skipped: true };
    }

    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS (or EMAIL_PASSWORD).');
  }

  const transporterConfig = process.env.EMAIL_SERVICE
    ? {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: emailPass,
        },
      }
    : {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: emailPass,
        },
      };

  const transporter = nodemailer.createTransport(transporterConfig);

  await transporter.verify();

  await transporter.sendMail({
    from: emailFrom,
    to: String(to).trim(),
    subject,
    html,
  });

  return { sent: true };
};

module.exports = sendEmail;
