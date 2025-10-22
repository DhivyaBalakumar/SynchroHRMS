# Email Configuration Guide for SynchroHR

This guide explains how to set up custom email sending with your own domain or Gmail address using Resend.

## Step 1: Verify Your Email in Resend

### Option A: Using Gmail (Quick Setup)
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain" or "Verify Email"
3. Enter your Gmail address: `dhivyabalakumar28@gmail.com`
4. Follow the verification instructions sent to your email
5. Once verified, you can use it as a sender

**Note:** Gmail addresses have sending limits. For production, use a custom domain.

### Option B: Using Custom Domain (Recommended for Production)
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend to your domain provider:
   - SPF Record
   - DKIM Record
   - DMARC Record (optional but recommended)
5. Wait for verification (usually 15 minutes to 24 hours)
6. Once verified, you can use `noreply@yourdomain.com` or any email from your domain

## Step 2: Get Your Resend API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name like "SynchroHR Production"
4. Copy the API key (you'll only see it once!)
5. Store it securely

## Step 3: Configure Environment Variables

### For Lovable Cloud (Development/Testing)
1. In Lovable, click "View Backend" button
2. Go to Edge Functions → Environment Variables
3. Add/Update these variables:
   - `RESEND_API_KEY`: Your Resend API key from Step 2
   - `MAIL_FROM`: Your verified email (e.g., `dhivyabalakumar28@gmail.com` or `SynchroHR <noreply@yourdomain.com>`)

### For Vercel Deployment (Production)
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   MAIL_FROM=dhivyabalakumar28@gmail.com
   ```
   Or with custom domain:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   MAIL_FROM=SynchroHR <noreply@yourdomain.com>
   ```
4. Redeploy your application

## Email Format Examples

### Simple Email Address
```
MAIL_FROM=dhivyabalakumar28@gmail.com
```

### Email with Display Name
```
MAIL_FROM=SynchroHR <noreply@yourdomain.com>
```

### Email with Custom Display Name
```
MAIL_FROM=SynchroHR Recruitment <dhivyabalakumar28@gmail.com>
```

## Updated Email Functions

All email-sending edge functions now use the `MAIL_FROM` environment variable:
- ✅ `send-verification-email`
- ✅ `send-password-reset`
- ✅ `send-interview-scheduled`
- ✅ `send-interview-completed`
- ✅ `send-selection-email`
- ✅ `send-rejection-email`

## Testing Your Email Setup

### Test in Development
1. Set the environment variables in Lovable Cloud
2. Trigger an email action (e.g., sign up a new user)
3. Check your inbox and spam folder

### Test in Production
1. Deploy to Vercel with environment variables set
2. Update Supabase auth redirect URLs to your Vercel domain
3. Perform a test signup/password reset
4. Verify emails are delivered

## Troubleshooting

### Emails Not Sending
- ✅ Verify your email/domain is verified in Resend
- ✅ Check the `RESEND_API_KEY` is correct
- ✅ Ensure `MAIL_FROM` matches a verified email/domain
- ✅ Check Resend logs at https://resend.com/emails
- ✅ Check edge function logs in Lovable Cloud backend

### Emails Going to Spam
- ✅ Use a custom domain instead of Gmail
- ✅ Add SPF, DKIM, and DMARC records
- ✅ Warm up your domain by sending gradually
- ✅ Avoid spam trigger words in subject lines

### Gmail Sending Limits
- Gmail has strict sending limits (500/day for free accounts)
- For production, always use a custom domain
- Consider upgrading to Resend's paid plan for higher limits

### Wrong Sender Address
- Check the `MAIL_FROM` environment variable is set correctly
- Redeploy after changing environment variables
- Clear cache if needed

## Email Deliverability Best Practices

1. **Use Custom Domain**: Gmail addresses have poor deliverability for automated emails
2. **Add DNS Records**: Properly configure SPF, DKIM, and DMARC
3. **Monitor Bounce Rates**: Check Resend dashboard regularly
4. **Include Unsubscribe Link**: For marketing emails (if applicable)
5. **Test Regularly**: Send test emails to multiple providers (Gmail, Outlook, Yahoo)

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **DNS Configuration Help**: Contact your domain provider
- **Lovable Cloud**: View Backend → Logs for debugging

## Next Steps

1. ✅ Verify your email in Resend
2. ✅ Set `MAIL_FROM` environment variable
3. ✅ Test email sending in development
4. ✅ Deploy to Vercel with environment variables
5. ✅ Monitor email deliverability in Resend dashboard
