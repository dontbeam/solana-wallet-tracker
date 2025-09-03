const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.wallet.deleteMany()

  // Create example wallets
  const wallets = await Promise.all([
    prisma.wallet.create({
      data: {
        address: 'GJrMRM2BPrCPxDDaM5MhqMUiFg8MhTfFBNLbvhLWzWL8',
        name: 'DeFi Whale',
        tag: 'DeFi',
        priority: 2,
      },
    }),
    prisma.wallet.create({
      data: {
        address: 'CnXicErFtkKtLCnLv3r6MhNZnCcQJBHfPxHxYVfEL3mY',
        name: 'NFT Collector',
        tag: 'NFT',
        priority: 1,
      },
    }),
    prisma.wallet.create({
      data: {
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Trading Bot',
        tag: 'Bot',
        priority: 0,
      },
    }),
  ])

  console.log(`✅ Created ${wallets.length} example wallets`)

  // Create sample transactions
  const now = new Date()
  const transactions = []

  // DeFi Whale transactions
  for (let i = 0; i < 20; i++) {
    const blockTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
    transactions.push({
      signature: `defi_tx_${i}_${Date.now()}`,
      walletId: wallets[0].id,
      type: i % 4 === 0 ? 'program_interaction' : 'sol_transfer',
      status: 'success',
      blockTime,
      slot: 100000000 + i,
      from: i % 2 === 0 ? wallets[0].address : 'SomeOtherWallet1234567890abcdef',
      to: i % 2 === 0 ? 'SomeOtherWallet1234567890abcdef' : wallets[0].address,
      amount: (Math.random() * 100).toFixed(6),
      fee: '0.00005',
      rawData: JSON.stringify({ mock: true }),
    })
  }

  // NFT Collector transactions
  for (let i = 0; i < 15; i++) {
    const blockTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    transactions.push({
      signature: `nft_tx_${i}_${Date.now()}`,
      walletId: wallets[1].id,
      type: i % 3 === 0 ? 'nft_transfer' : 'spl_transfer',
      status: 'success',
      blockTime,
      slot: 100000100 + i,
      from: i % 2 === 0 ? wallets[1].address : 'NFTMarketplace123456789',
      to: i % 2 === 0 ? 'NFTMarketplace123456789' : wallets[1].address,
      amount: i % 3 === 0 ? '1' : (Math.random() * 50).toFixed(6),
      tokenMint: i % 3 === 0 ? 'NFTMint' + i : 'TokenMint' + i,
      tokenSymbol: i % 3 === 0 ? 'NFT' : 'USDC',
      tokenDecimals: 6,
      fee: '0.00005',
      rawData: JSON.stringify({ mock: true }),
    })
  }

  // Trading Bot transactions
  for (let i = 0; i < 50; i++) {
    const blockTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
    transactions.push({
      signature: `bot_tx_${i}_${Date.now()}`,
      walletId: wallets[2].id,
      type: 'sol_transfer',
      status: i % 20 === 0 ? 'failed' : 'success',
      blockTime,
      slot: 100000200 + i,
      from: i % 2 === 0 ? wallets[2].address : 'DEXProgram123456789',
      to: i % 2 === 0 ? 'DEXProgram123456789' : wallets[2].address,
      amount: (Math.random() * 10).toFixed(6),
      fee: '0.00005',
      rawData: JSON.stringify({ mock: true }),
    })
  }

  await prisma.transaction.createMany({
    data: transactions,
  })

  console.log(`✅ Created ${transactions.length} sample transactions`)

  // Create sample alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        name: 'Large SOL Transfer Alert',
        walletId: wallets[0].id,
        type: 'amount_threshold',
        condition: JSON.stringify({ operator: 'gt', value: 50 }),
      },
    }),
    prisma.alert.create({
      data: {
        name: 'Any NFT Activity',
        walletId: wallets[1].id,
        type: 'token_transfer',
        condition: JSON.stringify({}),
      },
    }),
    prisma.alert.create({
      data: {
        name: 'Global High Value Alert',
        type: 'amount_threshold',
        condition: JSON.stringify({ operator: 'gt', value: 100 }),
      },
    }),
    prisma.alert.create({
      data: {
        name: 'Bot Activity Monitor',
        walletId: wallets[2].id,
        type: 'any_activity',
        condition: JSON.stringify({}),
      },
    }),
  ])

  console.log(`✅ Created ${alerts.length} sample alerts`)

  // Create sample notifications
  const notifications = []
  
  // Create notifications for large transfers
  const largeTransfers = transactions.filter(tx => 
    tx.type === 'sol_transfer' && 
    parseFloat(tx.amount) > 50
  ).slice(0, 3)

  for (const tx of largeTransfers) {
    notifications.push({
      alertId: alerts[0].id,
      title: 'Large SOL Transfer',
      message: `${tx.amount} SOL transferred`,
      data: JSON.stringify({
        transactionSignature: tx.signature,
        amount: tx.amount,
      }),
      isRead: Math.random() > 0.5,
    })
  }

  // Create notifications for NFT activity
  const nftTransfers = transactions.filter(tx => 
    tx.type === 'nft_transfer' && 
    tx.walletId === wallets[1].id
  ).slice(0, 2)

  for (const tx of nftTransfers) {
    notifications.push({
      alertId: alerts[1].id,
      title: 'NFT Transfer Detected',
      message: `NFT transferred for wallet ${wallets[1].name}`,
      data: JSON.stringify({
        transactionSignature: tx.signature,
        tokenMint: tx.tokenMint,
      }),
      isRead: false,
    })
  }

  await prisma.notification.createMany({
    data: notifications,
  })

  console.log(`✅ Created ${notifications.length} sample notifications`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
