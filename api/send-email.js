export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, facility, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured. Please contact us directly.' });
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 30px;">
      <div style="background: #0f172a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">K&amp;P Wellness Partners</h1>
        <p style="color: #94a3b8; margin: 6px 0 0; font-size: 14px;">New Website Inquiry</p>
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">📋 Inquiry Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 130px; font-weight: bold;">Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Phone</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Facility Type</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${facility || 'Not selected'}</td>
          </tr>
        </table>
        <div style="margin-top: 24px;">
          <p style="color: #64748b; font-weight: bold; margin-bottom: 8px;">Message</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #1e293b; line-height: 1.6;">
            ${message ? message.replace(/\n/g, '<br>') : '<em style="color:#94a3b8">No message provided</em>'}
          </div>
        </div>
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <a href="mailto:${email}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reply to ${name}</a>
        </div>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
        Sent from www.knpwellnesspartners.ca
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'K&P Wellness Partners <onboarding@resend.dev>',
        to: ['drnicholaskim@gmail.com'],
        reply_to: email,
        subject: `[K&P Wellness Partners] New Inquiry from ${name}`,
        html: htmlBody,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
