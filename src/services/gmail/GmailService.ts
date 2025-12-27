/**
 * Gmail Service for sending notification emails
 * Uses Gmail API with OAuth2 authentication
 */

import { ContactFormData, StoryFormData } from '@/types/form-submissions';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

class GmailService {
  private accessToken: string | null = null;

  /**
   * Set access token (obtained from OAuth2 flow)
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Send email using Gmail API
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Gmail access token not set');
    }

    const { to, subject, body, html } = options;

    // Create email message in RFC 2822 format
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html || body,
    ].join('\n');

    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to send email: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Send contact form notification
   */
  async sendContactFormNotification(adminEmail: string, formData: ContactFormData): Promise<void> {
    const subject = `[Recanto] Novo contato: ${formData.subject}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e40af; }
            .value { margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Novo Formulário de Contato</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nome:</div>
                <div class="value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${formData.email}</div>
              </div>
              ${formData.phone ? `
                <div class="field">
                  <div class="label">Telefone:</div>
                  <div class="value">${formData.phone}</div>
                </div>
              ` : ''}
              <div class="field">
                <div class="label">Assunto:</div>
                <div class="value">${formData.subject}</div>
              </div>
              <div class="field">
                <div class="label">Mensagem:</div>
                <div class="value">${formData.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Recebido em ${new Date().toLocaleString('pt-BR')}</p>
              <p>Acesse o painel administrativo para responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject,
      body: `Novo contato de ${formData.name}`,
      html,
    });
  }

  /**
   * Send story form notification
   */
  async sendStoryFormNotification(adminEmail: string, formData: StoryFormData): Promise<void> {
    const subject = `[Recanto] Nova história compartilhada por ${formData.name}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #7c3aed; }
            .value { margin-top: 5px; }
            .story { background-color: white; padding: 15px; border-left: 4px solid #7c3aed; margin-top: 10px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nova História Compartilhada</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nome:</div>
                <div class="value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${formData.email}</div>
              </div>
              ${formData.phone ? `
                <div class="field">
                  <div class="label">Telefone:</div>
                  <div class="value">${formData.phone}</div>
                </div>
              ` : ''}
              ${formData.age ? `
                <div class="field">
                  <div class="label">Idade:</div>
                  <div class="value">${formData.age} anos</div>
                </div>
              ` : ''}
              ${formData.city ? `
                <div class="field">
                  <div class="label">Cidade:</div>
                  <div class="value">${formData.city}</div>
                </div>
              ` : ''}
              <div class="field">
                <div class="label">História:</div>
                <div class="story">${formData.story.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="field">
                <div class="label">Consentimento para compartilhar:</div>
                <div class="value">${formData.consent ? '✅ Sim' : '❌ Não'}</div>
              </div>
            </div>
            <div class="footer">
              <p>Recebido em ${new Date().toLocaleString('pt-BR')}</p>
              <p>Acesse o painel administrativo para visualizar e responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject,
      body: `Nova história de ${formData.name}`,
      html,
    });
  }
}

export const gmailService = new GmailService();
export default gmailService;
