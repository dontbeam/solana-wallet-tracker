import { 
  Connection, 
  PublicKey, 
  ParsedTransactionWithMeta,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://mainnet.helius-rpc.com/?api-key=ac2d6fe3-159f-4300-a3a2-d98ce9da79d6',
  'confirmed'
)

interface ParsedTransaction {
  signature: string
  type: string
  status: string
  blockTime: Date | null
  slot: number
  from: string
  to?: string
  amount?: string
  tokenMint?: string
  tokenSymbol?: string
  tokenDecimals?: number
  fee?: string
  programId?: string
  instructionData?: string
  rawData: string
}

export async function fetchWalletTransactions(
  walletAddress: string,
  limit: number = 100
): Promise<ParsedTransaction[]> {
  try {
    const pubkey = new PublicKey(walletAddress)
    
    // Get transaction signatures
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit,
    })
    
    // Fetch full transaction details
    const transactions: ParsedTransaction[] = []
    
    for (const sig of signatures) {
      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        })
        
        if (!tx) continue
        
        const parsed = parseTransaction(tx, walletAddress)
        if (parsed) {
          transactions.push({
            ...parsed,
            signature: sig.signature,
            blockTime: sig.blockTime ? new Date(sig.blockTime * 1000) : null,
            slot: sig.slot,
            status: sig.err ? 'failed' : 'success',
          })
        }
      } catch (error) {
        console.error('Error fetching transaction:', sig.signature, error)
      }
    }
    
    return transactions
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    throw error
  }
}

function parseTransaction(
  tx: ParsedTransactionWithMeta,
  walletAddress: string
): Omit<ParsedTransaction, 'signature' | 'blockTime' | 'slot' | 'status'> | null {
  try {
    const meta = tx.meta
    if (!meta) return null
    
    // Calculate fee
    const fee = meta.fee ? (meta.fee / LAMPORTS_PER_SOL).toString() : undefined
    
    // Parse instructions
    const instructions = tx.transaction.message.instructions
    
    // Check for SOL transfers
    for (const inst of instructions) {
      if ('parsed' in inst && inst.parsed?.type === 'transfer') {
        const info = inst.parsed.info
        return {
          type: 'sol_transfer',
          from: info.source,
          to: info.destination,
          amount: (info.lamports / LAMPORTS_PER_SOL).toString(),
          fee,
          rawData: JSON.stringify(tx),
        }
      }
    }
    
    // Check for SPL token transfers
    for (const inst of instructions) {
      if ('parsed' in inst && inst.program === 'spl-token') {
        const info = inst.parsed.info
        if (inst.parsed.type === 'transfer' || inst.parsed.type === 'transferChecked') {
          return {
            type: 'spl_transfer',
            from: info.source || info.authority,
            to: info.destination,
            amount: info.amount || info.tokenAmount?.amount,
            tokenMint: info.mint,
            tokenDecimals: info.tokenAmount?.decimals,
            fee,
            rawData: JSON.stringify(tx),
          }
        }
      }
    }
    
    // Check for NFT transfers (also SPL tokens but with amount = 1)
    for (const inst of instructions) {
      if ('parsed' in inst && inst.program === 'spl-token') {
        const info = inst.parsed.info
        if ((inst.parsed.type === 'transfer' || inst.parsed.type === 'transferChecked') && 
            info.amount === '1') {
          return {
            type: 'nft_transfer',
            from: info.source || info.authority,
            to: info.destination,
            amount: '1',
            tokenMint: info.mint,
            fee,
            rawData: JSON.stringify(tx),
          }
        }
      }
    }
    
    // Default to program interaction
    const programIds = instructions
      .map(inst => 'programId' in inst ? inst.programId.toString() : null)
      .filter(Boolean)
    
    return {
      type: 'program_interaction',
      from: walletAddress,
      fee,
      programId: programIds[0] || undefined,
      instructionData: JSON.stringify(instructions),
      rawData: JSON.stringify(tx),
    }
  } catch (error) {
    console.error('Error parsing transaction:', error)
    return null
  }
}

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const pubkey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(pubkey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return 0
  }
}
