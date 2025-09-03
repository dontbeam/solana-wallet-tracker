# 🚀 Deploy Solana Wallet Tracker

## ✅ Your App is Ready for Production!

**Helius API Key Configured**: `ac2d6fe3-159f-4300-a3a2-d98ce9da79d6`

## Quick Deploy Options

### Option 1: Vercel (Recommended - Free)

1. **Visit**: https://vercel.com
2. **Sign Up** with GitHub/Google/Email
3. **Click "New Project"**
4. **Import** your project folder
5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=ac2d6fe3-159f-4300-a3a2-d98ce9da79d6
   ```
6. **Deploy** - Takes ~2 minutes

### Option 2: Netlify

1. **Visit**: https://netlify.com
2. **Drag & Drop** your project folder
3. **Configure build settings**:
   - Build command: `pnpm build`
   - Publish directory: `.next`

### Option 3: Railway

1. **Visit**: https://railway.app
2. **Connect GitHub** and import repository
3. **Add environment variables**
4. **Deploy**

## 🗄️ Database Options for Production

### Option A: Vercel Postgres (Recommended)
- Free tier: 256MB storage
- Automatic backups
- Easy integration

### Option B: Supabase
- Free tier: 500MB storage
- Real-time features
- PostgreSQL compatible

### Option C: PlanetScale
- Free tier: 1GB storage
- Serverless MySQL
- Branch-based development

## 🔧 Environment Variables for Production

```env
# Required
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=ac2d6fe3-159f-4300-a3a2-d98ce9da79d6

# Database (choose one)
DATABASE_URL=postgresql://user:pass@host:port/db  # PostgreSQL
DATABASE_URL=mysql://user:pass@host:port/db       # MySQL

# Optional
NEXT_PUBLIC_APP_NAME=Solana Wallet Tracker
```

## 🎯 Features Enabled

- ✅ Live Solana wallet tracking
- ✅ Real-time transaction fetching
- ✅ Smart alerts with notifications
- ✅ CSV export functionality
- ✅ Analytics and charts
- ✅ Wallet management
- ✅ 10,000 requests/day (Helius free tier)

## 📱 One-Click Deploy Buttons

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/solana-wallet-tracker&env=NEXT_PUBLIC_SOLANA_RPC_ENDPOINT,DATABASE_URL)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/solana-wallet-tracker)

## 🧪 Test Locally First

```bash
# Update environment with your API key
echo 'NEXT_PUBLIC_SOLANA_RPC_ENDPOINT="https://mainnet.helius-rpc.com/?api-key=ac2d6fe3-159f-4300-a3a2-d98ce9da79d6"' > .env.local

# Start development server
pnpm dev

# Test with real Solana wallets!
```

## 🔗 After Deployment

1. **Test wallet sync** with real addresses
2. **Set up alerts** for monitoring
3. **Configure notifications** in browser
4. **Share your deployed URL**

Your app will be live at: `https://your-app-name.vercel.app`
