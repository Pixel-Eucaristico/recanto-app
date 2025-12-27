import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminEmailConfigService } from '@/services/firebase/FormSubmissionService';
import { firestore } from '@/domains/auth/services/firebaseAdmin';

/**
 * POST /api/contact/send
 * Sends an email using the connected Gmail account
 */
import nodemailer from 'nodemailer';

/**
 * POST /api/contact/send
 * Sends an email using the connected Gmail account or SMTP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, phone, type = 'contact' } = body;

    // 1. Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 2. Get Admin Config
    const adminConfig = await adminEmailConfigService.getConfig();
    const recipientEmail = adminConfig?.email;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email not configured', code: 'CONFIG_MISSING' },
        { status: 503 }
      );
    }

    // HTML Content Construction
    const htmlContent = [
      `<h3>Novo contato recebido pelo site</h3>`,
      `<p><strong>Nome:</strong> ${name}</p>`,
      `<p><strong>Email:</strong> ${email}</p>`,
      phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : '',
      `<p><strong>Mensagem:</strong></p>`,
      `<p style="white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${message}</p>`,
      `<hr/>`,
      `<small>Este email foi enviado automaticamente pelo sistema do site.</small>`
    ].join('\n');

    const emailSubject = type === 'vocational' 
      ? `[Vocacional] Novo contato de ${name}`
      : `[Site] ${subject || `Novo contato de ${name}`}`;


    // === SMTP PROVIDER ===
    if (adminConfig?.provider === 'smtp') {
        const { smtp } = adminConfig;
        if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
            return NextResponse.json(
                { error: 'SMTP configuration incomplete', code: 'SMTP_CONFIG_MISSING' },
                { status: 503 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port || 587,
            secure: smtp.secure !== undefined ? smtp.secure : false, // true for 465, false for other ports
            auth: {
                user: smtp.user,
                pass: smtp.pass,
            },
        });

        await transporter.sendMail({
            from: `"${adminConfig.name || 'Site Recanto'}" <${smtp.user}>`, // Sender address
            to: recipientEmail, // List of receivers
            replyTo: email, // Reply to the user
            subject: emailSubject,
            html: htmlContent,
        });

        return NextResponse.json({ success: true, provider: 'smtp' });
    }

    // === GMAIL API PROVIDER (DEFAULT) ===
    
    // 3. Get Gmail Auth Tokens
    const configRef = firestore.collection('config').doc('gmail_oauth');
    const configSnap = await configRef.get();

    if (!configSnap.exists) {
      return NextResponse.json(
        { error: 'Gmail account not connected', code: 'GMAIL_NOT_CONNECTED' },
        { status: 503 }
      );
    }

    const authConfig = configSnap.data() || {};
    let accessToken = authConfig.access_token;
    const refreshToken = authConfig.refresh_token;
    const expiresAt = new Date(authConfig.expires_at);

    // 4. Refresh Token if needed
    if (expiresAt < new Date()) {
      if (!refreshToken) {
        return NextResponse.json(
          { error: 'Gmail session expired and no refresh token', code: 'TOKEN_EXPIRED' },
          { status: 401 }
        );
      }

      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        const oauth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret
        );

        oauth2Client.setCredentials({
          refresh_token: refreshToken
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token;

        // Update Firestore
        await configRef.set({
            access_token: accessToken,
            refresh_token: refreshToken, // Keep original refresh token
            expires_at: new Date(Date.now() + (credentials.expiry_date || 3600 * 1000)).toISOString(),
            updated_at: new Date().toISOString(),
        }, { merge: true });

      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return NextResponse.json(
          { error: 'Failed to refresh Gmail session', code: 'REFRESH_FAILED' },
          { status: 401 }
        );
      }
    }

    // 5. Send Email
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Construct Email
    // UTF-8 encoding for subject and body
    const emailBody = [
      `From: "Site Recanto" <${recipientEmail}>`, 
      `To: ${recipientEmail}`,
      `Reply-To: ${email}`, 
      `Subject: =?utf-8?B?${Buffer.from(emailSubject).toString('base64')}?=`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      htmlContent
    ].join('\n');

    const encodedMessage = Buffer.from(emailBody)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({ success: true, provider: 'gmail' });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error processing email', details: (error as Error).message },
      { status: 500 }
    );
  }
}
