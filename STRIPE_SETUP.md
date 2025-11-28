# Stripe Payment Setup

This guide will help you set up Stripe payments for the "Buy In" feature (€100 fee).

## Quick Start (Test Mode)

**Yes, you can absolutely use Stripe test mode!** Test mode is perfect for development - it lets you test payments without charging real money.

### Quick Setup (5 minutes):

1. **Create a Stripe account** at [stripe.com](https://stripe.com/) (free)
2. **Get your test keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Make sure you're in **Test mode** (toggle in top right)
   - Copy your **Publishable key** (starts with `pk_test_...`)
   - Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_...`)
3. **Add to `.env.local`**:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
4. **Restart your dev server**: `npm run dev`
5. **Test with fake card**: Use `4242 4242 4242 4242` as card number

That's it! Test mode works exactly like live mode, but no real money is charged.

## Step 1: Create a Stripe Account

1. Go to [Stripe](https://stripe.com/)
2. Click "Sign up" and create an account (it's free!)
3. Complete the account setup process
4. **You'll automatically start in Test mode** - perfect for development!

## Step 2: Get Your Test Mode API Keys

1. Once logged in, go to the [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Make sure you're in Test mode** (toggle switch in the top right - should show "Test mode")
3. Click on **"Developers"** in the left sidebar
4. Click **"API keys"**
5. You'll see your test keys:
   - **Publishable key** (starts with `pk_test_...`) - Copy this
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key" to see it, then copy

**Important**: 
- ✅ **Use test mode for development** - No real charges, perfect for testing
- ✅ Test keys start with `pk_test_` and `sk_test_`
- ✅ Never share your secret key publicly
- ⚠️ Switch to live mode only when ready for real payments

## Step 3: Add Keys to Your Project

1. Open your `.env.local` file in the project root
2. Add the following lines:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace the values with your actual Stripe keys.

**Example `.env.local` file:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase config ...

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 4: Restart Your Development Server

After adding the API keys:

1. Stop your development server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

**Important**: Environment variables are only loaded when the server starts, so you must restart after adding/changing them.

## Step 5: Test the Payment Flow (Test Mode)

1. Go to your app
2. Click the **"Buy In"** button
3. You should be redirected to Stripe Checkout
4. **Use Stripe's test card numbers** (these work in test mode only):
   - **Card number**: `4242 4242 4242 4242` (Visa - always succeeds)
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

**Other test cards for different scenarios:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds
- `4000 0025 0000 3155` - Requires authentication (3D Secure)

**Important**: In test mode, no real money is charged! You can test as many times as you want.

## Step 6: Production Setup

When you're ready to go live:

1. Switch to **live mode** in Stripe Dashboard
2. Get your live mode keys
3. Update your environment variables:
   ```
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```
4. Redeploy your application

## Troubleshooting

### "Stripe is not configured..."
- ✅ Make sure you added both `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your `.env.local` file
- ✅ Make sure you restarted your development server after adding the keys (environment variables only load on startup)
- ✅ Check that the keys start with `pk_test_` and `sk_test_` (for test mode)
- ✅ Verify you copied the entire key (they're long strings)
- ✅ Make sure there are no extra spaces or quotes around the keys in `.env.local`

### "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- This usually means the API route is returning an error page instead of JSON
- Check that `STRIPE_SECRET_KEY` is set correctly
- Check the server console for error messages
- Make sure the Stripe package is installed: `npm install stripe`

### Payment not processing
- Make sure you're using test mode keys in development
- Check Stripe Dashboard → Payments to see if the payment attempt was logged
- Verify your webhook endpoints are configured (if using webhooks)

## Pricing

The "Buy In" fee is set to **€100** (€100.00 EUR). This can be changed in `app/api/create-checkout-session/route.ts` by modifying the `unit_amount` value (currently `10000` cents = €100).

## Need Help?

- Check [Stripe Documentation](https://stripe.com/docs)
- Check Stripe Dashboard → Logs for API errors
- Verify all environment variables are set correctly
- Make sure you're using the correct keys for your environment (test vs live)


