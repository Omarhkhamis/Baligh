import nodemailer from 'nodemailer';

const INTERNAL_ALERT_EMAIL = 'contact@baligh.org';

function getSmtpConfig() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host) {
        return null;
    }

    return {
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: user && pass ? { user, pass } : undefined,
        from: process.env.SMTP_FROM?.trim() || INTERNAL_ALERT_EMAIL,
    };
}

export async function sendInternalAlertEmail(message: string) {
    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
        console.warn('SMTP is not configured. Skipping internal alert email.');
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth,
    });

    await transporter.sendMail({
        from: smtpConfig.from,
        to: INTERNAL_ALERT_EMAIL,
        subject: 'Baligh internal escalation alert',
        text: message,
    });

    return true;
}
