# Solana Wallet Tracker

A local dashboard for tracking Solana wallet activities with real-time alerts and analytics.

![Solana Wallet Tracker](https://img.shields.io/badge/Solana-Wallet%20Tracker-9945FF?style=for-the-badge&logo=solana)

## Features

- 🔍 **Wallet Management**: Add, remove, tag, and prioritize Solana wallets
- 📊 **Activity Monitoring**: Track SOL transfers, SPL tokens, NFTs, and program interactions
- 🔔 **Smart Alerts**: Create custom alert rules with browser notifications
- 📈 **Analytics**: Visualize wallet activity with charts and statistics
- 💾 **Export Data**: Download transaction history as CSV files
- 🌐 **Local First**: Runs entirely on your machine with SQLite database

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite
- **Blockchain**: Solana Web3.js
- **Charts**: Chart.js with React-Chart.js-2
- **State Management**: React Query (TanStack Query)

## Prerequisites

- Node.js 18+ and pnpm installed
- A Solana RPC endpoint (default uses public endpoint)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solana-wallet-tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and configure:
- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`: Solana RPC endpoint
- Optional: Add API keys for enhanced data fetching

4. Set up the database:
```bash
pnpm db:generate
pnpm db:migrate
```

5. (Optional) Seed with example data:
```bash
pnpm db:seed
```

## Running the Application

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Adding Wallets

1. Click "Add Wallet" in the Wallets view
2. Enter a valid Solana wallet address
3. Optionally add a name, tag, and priority level
4. Click "Add Wallet" to save

### Syncing Wallet Data

- Click the refresh icon on any wallet card to fetch latest transactions
- The app fetches the last 100 transactions by default
- Transaction data is stored locally for offline access

### Creating Alerts

1. Navigate to the Alerts tab
2. Click "Create Alert"
3. Choose alert type:
   - **Amount Threshold**: Triggers when transaction amount meets condition
   - **Token Transfer**: Monitors SPL token or NFT transfers
   - **Program Interaction**: Watches for specific program interactions
   - **Any Activity**: Alerts on any wallet activity
4. Set conditions and target wallet (or leave global)
5. Enable browser notifications when prompted

### Viewing Analytics

The Analytics tab provides:
- Transaction activity over time
- Transaction type distribution
- SOL inflow/outflow charts
- Summary statistics

### Exporting Data

1. Go to the Activity tab
2. Apply filters if needed
3. Click "Export CSV" to download transaction data

## API Endpoints

- `GET /api/wallets` - List all wallets
- `POST /api/wallets` - Add new wallet
- `GET /api/wallets/[id]` - Get wallet details
- `PATCH /api/wallets/[id]` - Update wallet
- `DELETE /api/wallets/[id]` - Remove wallet
- `POST /api/wallets/[id]/sync` - Sync wallet transactions
- `GET /api/transactions` - List transactions with filters
- `GET /api/transactions/export` - Export transactions as CSV
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/[id]` - Update alert
- `DELETE /api/alerts/[id]` - Delete alert
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications` - Mark notifications as read

## Database Management

View and manage the database:
```bash
pnpm db:studio
```

Run migrations:
```bash
pnpm db:migrate
```

## Configuration

### RPC Endpoints

For better performance, consider using a dedicated RPC provider:
- [Helius](https://helius.xyz/)
- [QuickNode](https://quicknode.com/)
- [Alchemy](https://alchemy.com/)

Add your RPC endpoint and API keys to `.env.local`.

### Alert Notifications

Browser notifications require user permission. The app will request permission when creating the first alert.

## Development

### Project Structure

```
solana-wallet-tracker/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utility functions
├── prisma/            # Database schema and migrations
├── public/            # Static assets
└── package.json       # Dependencies
```

### Adding New Features

1. **New Transaction Types**: Update `lib/solana.ts` parser
2. **Custom Alerts**: Extend alert types in schema and `lib/alerts.ts`
3. **Additional Charts**: Add to `components/charts.tsx`

## Troubleshooting

### Common Issues

1. **Database errors**: Run `pnpm db:migrate` to ensure schema is up to date
2. **RPC rate limits**: Use a dedicated RPC endpoint
3. **Transaction parsing**: Some complex transactions may not parse correctly

### Debug Mode

Set `NODE_ENV=development` for detailed logging.

## Security Considerations

- This app runs locally and doesn't transmit wallet data externally
- RPC requests are made directly to Solana network
- No private keys are required or stored
- All data is stored in local SQLite database

## Future Enhancements

- [ ] Support for more transaction types
- [ ] Historical price data integration
- [ ] Multi-chain support
- [ ] Advanced filtering and search
- [ ] Webhook support for alerts
- [ ] Mobile responsive improvements

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing issues for solutions

---

Built with ❤️ for the Solana community
