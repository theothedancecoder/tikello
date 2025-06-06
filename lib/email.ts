import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface TicketEmailData {
  userEmail: string;
  userName: string;
  eventName: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string;
  ticketId: string;
  amount: number;
  currency: string;
}

export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: 'Tikello <onboarding@resend.dev>', // Using Resend's default domain for testing
      to: [data.userEmail],
      subject: `Your ticket for ${data.eventName} is confirmed!`,
      html: generateTicketEmailHTML(data),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', emailResult);
    return { success: true, data: emailResult };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

function generateTicketEmailHTML(data: TicketEmailData): string {
  const formattedAmount = new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount / 100); // Convert from cents

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket Confirmation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 8px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background: #10b981;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .ticket-details {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        .detail-value {
          color: #6b7280;
          text-align: right;
        }
        .ticket-id {
          background: #dbeafe;
          color: #1e40af;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 24px 0;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .important-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        .important-note h4 {
          color: #92400e;
          margin: 0 0 8px 0;
          font-size: 16px;
        }
        .important-note p {
          color: #92400e;
          margin: 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎫 Tikello</div>
          <div class="success-icon">✓</div>
          <h1 class="title">Ticket Confirmed!</h1>
          <p class="subtitle">Your ticket for ${data.eventName} has been successfully purchased</p>
        </div>

        <div class="ticket-details">
          <div class="detail-row">
            <span class="detail-label">Event</span>
            <span class="detail-value">${data.eventName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${data.eventDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value">${data.eventLocation}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid</span>
            <span class="detail-value">${formattedAmount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ticket ID</span>
            <span class="detail-value">
              <div class="ticket-id">${data.ticketId}</div>
            </span>
          </div>
        </div>

        <div class="important-note">
          <h4>📱 Important Information</h4>
          <p>Please save this email and bring your ticket ID to the event. You can also access your ticket anytime through your Tikello account.</p>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tikello.com'}/tickets/${data.ticketId}" class="cta-button">
            View Your Ticket
          </a>
        </div>

        <div class="footer">
          <p>Thank you for using Tikello!</p>
          <p>If you have any questions, please contact our support team.</p>
          <p style="margin-top: 16px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tikello.com'}" style="color: #2563eb;">Visit Tikello</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Fallback email service for development/testing
export async function sendTicketConfirmationEmailFallback(data: TicketEmailData) {
  console.log('📧 EMAIL NOTIFICATION (Development Mode)');
  console.log('=====================================');
  console.log(`To: ${data.userEmail}`);
  console.log(`Subject: Your ticket for ${data.eventName} is confirmed!`);
  console.log('');
  console.log('Ticket Details:');
  console.log(`- Event: ${data.eventName}`);
  console.log(`- Date: ${data.eventDate}`);
  console.log(`- Location: ${data.eventLocation}`);
  console.log(`- Amount: ${data.amount / 100} ${data.currency}`);
  console.log(`- Ticket ID: ${data.ticketId}`);
  console.log('=====================================');
  
  return { success: true, data: { id: 'dev-email-' + Date.now() } };
}
