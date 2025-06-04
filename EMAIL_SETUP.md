# Email Notifications Setup

This application sends automatic email confirmations when customers purchase tickets. Here's how to set it up:

## 🚀 Quick Setup

### 1. Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Create a free account (100 emails/day free tier)
3. Verify your email address

### 2. Get your API Key
1. In your Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Copy the API key (starts with `re_`)

### 3. Add to Environment Variables
Add this to your `.env.local` file:
```bash
RESEND_API_KEY=re_your_api_key_here
```

### 4. Set up Domain (Production)
For production, you'll need to verify a domain:
1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records
4. Update the `from` field in `lib/email.ts`:
   ```typescript
   from: 'Tikello <noreply@yourdomain.com>'
   ```

## 📧 Email Features

### What customers receive:
- ✅ Instant confirmation email after purchase
- 🎫 Ticket details (event name, date, location)
- 💰 Payment confirmation with amount
- 🆔 Unique ticket ID for entry
- 🔗 Link to view ticket online

### Email includes:
- Professional HTML design
- Mobile-responsive layout
- Event details and ticket information
- Direct link to view ticket
- Important instructions for event entry

## 🛠️ Development Mode

In development, emails are logged to the console instead of being sent:

```bash
📧 EMAIL NOTIFICATION (Development Mode)
=====================================
To: customer@example.com
Subject: Your ticket for Concert is confirmed!

Ticket Details:
- Event: Summer Music Festival
- Date: Saturday, 15 July 2024 at 19:00
- Location: Oslo Concert Hall
- Amount: 500 NOK
- Ticket ID: abc123def456
=====================================
```

## 🔧 Customization

### Email Template
Edit `lib/email.ts` to customize:
- Email subject line
- HTML template design
- Company branding
- Contact information

### Email Content
The email automatically includes:
- User's name and email
- Event details from database
- Formatted date/time
- Payment amount in correct currency
- Unique ticket ID

## 🚨 Troubleshooting

### Email not sending?
1. Check your `RESEND_API_KEY` is correct
2. Verify domain is set up (production)
3. Check console logs for errors
4. Ensure user has valid email in database

### Testing emails
1. Use development mode to see email content
2. Test with a real email address
3. Check spam folder
4. Verify Resend dashboard for delivery status

## 📊 Monitoring

### Resend Dashboard
- View email delivery status
- Track open rates
- Monitor bounce rates
- Check API usage

### Application Logs
- Email sending attempts logged
- Error messages for failed sends
- Development mode email previews

## 💡 Best Practices

1. **Always test** email functionality before going live
2. **Monitor delivery rates** in Resend dashboard
3. **Keep templates simple** for better compatibility
4. **Include unsubscribe links** for marketing emails
5. **Use proper from addresses** (no-reply@yourdomain.com)

## 🔐 Security

- API keys are server-side only
- No sensitive data in email templates
- Secure webhook handling for payment confirmations
- User email addresses from authenticated sessions only
