import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config, payload } = req.body;

  if (!config || !config.smtpHost || !config.smtpUser || !config.smtpPass) {
    return res.status(400).json({
      success: false,
      error: "SMTP server configuration is incomplete.",
    });
  }

  try {
    const isSecure = Number(config.smtpPort) === 465;
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 587,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Assemble content
    const mailOptions = {
      from: `"${config.senderName || "VSAPS 2026 BTC"}" <${config.senderEmail || config.smtpUser}>`,
      to: payload.to,
      subject: payload.subject || "Thư xác nhận VSAPS 2026",
      html: payload.body, // We pass email body as HTML content
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      messageId: info.messageId,
      response: info.response,
      server: config.smtpHost,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Lỗi khi gửi mail SMTP",
    });
  }
}
