// api/send-otp.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    await resend.emails.send({
      from: 'SPARK <no-reply@your-domain.com>',   // must be verified domain
      to: [email],
      subject: 'Your SPARK Verification Code',
      html: `
        <div style="font-family:sans-serif; max-width:500px; margin:auto; padding:2rem;">
          <h1 style="color:#4f46e5;">SPARK Verification</h1>
          <p>Use this code to verify your email:</p>
          <h2 style="letter-spacing:0.5em; font-size:2.5rem; color:#111;">${otp}</h2>
          <p style="color:#666; font-size:0.9rem;">
            Code expires in 10 minutes. Never share it.
          </p>
          <p style="margin-top:2rem; color:#888; font-size:0.8rem;">
            If you didn't request this — ignore this email.
          </p>
        </div>
      `,
    });

    // ← Here you would normally save OTP somewhere (Redis, DB, even localStorage for tiny projects)
    // For now we'll return it (demo only — in production NEVER return OTP!)
    res.status(200).json({ success: true, message: 'OTP sent' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
