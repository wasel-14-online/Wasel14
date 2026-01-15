# 🚀 Supabase Edge Functions Deployment Guide

## Overview

This guide covers deploying all backend API functions for Wassel to Supabase Edge Functions.

---

## 📋 Available Functions

### Payment Functions
1. **payment-create-intent** - Create Stripe payment intent
2. **payment-confirm** - Confirm payment and update database

### Communication Functions
3. **sms-send** - Send SMS via Twilio
4. **email-send** - Send emails via SendGrid

### Admin Functions
5. **admin-suspend-user** - Suspend/unsuspend users

---

## 🔧 Prerequisites

### 1. Install Supabase CLI

**Windows:**
```powershell
scoop install supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link Your Project
```bash
cd "C:\Users\user\OneDrive\Desktop\Wasel 14 new"
supabase link --project-ref djcmatubybyudeosrngt
```

---

## 🔑 Environment Variables Setup

### 1. Set Up Secrets in Supabase

```bash
# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here

# Twilio
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890

# SendGrid
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key

# Supabase (auto-configured)
# SUPABASE_URL - Already available
# SUPABASE_ANON_KEY - Already available
# SUPABASE_SERVICE_ROLE_KEY - Already available
```

### 2. List All Secrets (Verify)
```bash
supabase secrets list
```

---

## 📦 Deploy Functions

### Deploy All Functions at Once
```bash
# Deploy all functions
supabase functions deploy
```

### Deploy Individual Functions
```bash
# Payment functions
supabase functions deploy payment-create-intent
supabase functions deploy payment-confirm

# Communication functions
supabase functions deploy sms-send
supabase functions deploy email-send

# Admin functions
supabase functions deploy admin-suspend-user
```

---

## 🧪 Testing Functions

### 1. Test Locally

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve payment-create-intent --env-file ./supabase/.env.local

# Test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/payment-create-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount":100,"currency":"usd"}'
```

### 2. Test Production

```bash
# Test payment intent creation
curl -i --location --request POST \
  'https://djcmatubybyudeosrngt.supabase.co/functions/v1/payment-create-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount":100,"currency":"usd","metadata":{"tripId":"123"}}'

# Test SMS sending
curl -i --location --request POST \
  'https://djcmatubybyudeosrngt.supabase.co/functions/v1/sms-send' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"+1234567890","message":"Test message"}'

# Test email sending
curl -i --location --request POST \
  'https://djcmatubybyudeosrngt.supabase.co/functions/v1/email-send' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","subject":"Test","html":"<h1>Test</h1>"}'
```

---

## 🔗 Integration with Frontend

### Update Your Frontend Code

```typescript
// src/services/backendApi.ts

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Payment functions
export async function createPaymentIntent(data: {
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/payment-create-intent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment intent creation failed');
  }

  return response.json();
}

export async function confirmPayment(data: {
  paymentIntentId: string;
  tripId: string;
}) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/payment-confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment confirmation failed');
  }

  return response.json();
}

// SMS function
export async function sendSMS(data: {
  to: string;
  message: string;
  type?: string;
}) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/sms-send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'SMS sending failed');
  }

  return response.json();
}

// Email function
export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/email-send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Email sending failed');
  }

  return response.json();
}

// Admin function
export async function suspendUser(data: {
  userId: string;
  suspend: boolean;
  reason?: string;
}) {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-suspend-user`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'User suspension failed');
  }

  return response.json();
}
```

---

## 📊 Monitoring & Logs

### View Function Logs

```bash
# View logs for specific function
supabase functions logs payment-create-intent

# Follow logs in real-time
supabase functions logs payment-create-intent --follow

# View all function logs
supabase functions logs
```

### Monitor in Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Edge Functions**
4. Click on function name
5. View **Logs** and **Metrics**

---

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)

Ensure RLS is enabled on all tables accessed by functions.

### 2. API Key Rotation

Rotate all API keys regularly:
- Stripe keys
- Twilio credentials
- SendGrid API key

### 3. Rate Limiting

Implement rate limiting in functions:

```typescript
// Example rate limiting
const RATE_LIMIT = 100; // requests per minute
const rateLimitKey = `rate_limit:${userId}`;

// Check rate limit
const count = await redis.incr(rateLimitKey);
if (count === 1) {
  await redis.expire(rateLimitKey, 60);
}

if (count > RATE_LIMIT) {
  throw new Error('Rate limit exceeded');
}
```

### 4. Input Validation

Always validate input data:

```typescript
// Example validation
function validatePaymentData(data: any) {
  if (!data.amount || typeof data.amount !== 'number') {
    throw new Error('Invalid amount');
  }
  
  if (data.amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (data.amount > 1000000) {
    throw new Error('Amount exceeds maximum');
  }
}
```

---

## 🐛 Troubleshooting

### Function Not Deploying

```bash
# Check function syntax
deno check supabase/functions/payment-create-intent/index.ts

# Redeploy with verbose output
supabase functions deploy payment-create-intent --debug
```

### CORS Errors

Ensure CORS headers are included in all responses:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Environment Variables Not Working

```bash
# List all secrets
supabase secrets list

# Re-set missing secrets
supabase secrets set VARIABLE_NAME=value
```

### 401 Unauthorized Errors

- Verify `Authorization` header is included
- Check anon key is correct
- Ensure RLS policies allow access

---

## ✅ Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Logged into Supabase
- [ ] Project linked
- [ ] All secrets configured
- [ ] Functions deployed successfully
- [ ] Functions tested locally
- [ ] Functions tested in production
- [ ] Frontend integration updated
- [ ] Monitoring configured
- [ ] Security reviewed
- [ ] Documentation updated

---

## 📚 Additional Resources

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Deno Deploy Docs**: https://deno.com/deploy/docs
- **Stripe API Docs**: https://stripe.com/docs/api
- **Twilio API Docs**: https://www.twilio.com/docs/sms
- **SendGrid API Docs**: https://docs.sendgrid.com/

---

## 🚀 Quick Deployment Commands

```bash
# Complete deployment (run all)
cd "C:\Users\user\OneDrive\Desktop\Wasel 14 new"

# 1. Login
supabase login

# 2. Link project
supabase link --project-ref djcmatubybyudeosrngt

# 3. Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set TWILIO_ACCOUNT_SID=...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set TWILIO_PHONE_NUMBER=+...
supabase secrets set SENDGRID_API_KEY=...

# 4. Deploy all functions
supabase functions deploy

# 5. Test
curl -i https://djcmatubybyudeosrngt.supabase.co/functions/v1/payment-create-intent \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"usd"}'
```

---

**Status:** Functions created, ready to deploy  
**Priority:** High  
**Time to Deploy:** 30-60 minutes  
**Impact:** Full backend functionality

---

Deploy these functions to enable real payments, SMS, emails, and admin actions! 🚀
