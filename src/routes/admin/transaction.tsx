import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ethers } from 'ethers'

export const Route = createFileRoute('/admin/transaction')({
  component: RouteComponent,
})

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasPrice: string
  gasUsed: string
  blockNumber: number
  timestamp: number
  status: number
}

function RouteComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  
  // Recipient address from the payment system
  const recipientAddress = '0x0Dc22cEe7d3Ae46d448afDB4a654946EaA20eB4D'

  // Initialize provider
  const provider = new ethers.JsonRpcProvider('https://sepolia-rpc.scroll.io/')

  // Fetch balance
  const fetchBalance = async () => {
    try {
      const balanceWei = await provider.getBalance(recipientAddress)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(balanceEth)
    } catch (err) {
      console.error('Error fetching balance:', err)
    }
  }

  // Fetch transactions using Scroll Sepolia API (if available) or provider
  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Get current block number
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 10000) // Last ~10k blocks
      
      // Since Scroll Sepolia might not have full API support, we'll simulate with recent blocks
      const txList: Transaction[] = []
      
      // Check recent blocks for transactions to our address
      for (let i = 0; i < 50 && (currentBlock - i) >= fromBlock; i++) {
        try {
          const blockNumber = currentBlock - i
          const block = await provider.getBlock(blockNumber, true)
          
          if (block && block.transactions) {
            for (const txHash of block.transactions) {
              if (typeof txHash === 'string') {
                // Get full transaction details
                const tx = await provider.getTransaction(txHash)
                if (tx && tx.to?.toLowerCase() === recipientAddress.toLowerCase()) {
                  // Get transaction receipt for gas used and status
                  const receipt = await provider.getTransactionReceipt(tx.hash)
                  
                  txList.push({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to || '',
                    value: ethers.formatEther(tx.value),
                    gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
                    gasUsed: receipt?.gasUsed.toString() || '0',
                    blockNumber: tx.blockNumber || 0,
                    timestamp: block.timestamp,
                    status: receipt?.status || 0
                  })
                }
              }
            }
          }
        } catch (blockError) {
          // Skip blocks that can't be fetched
          continue
        }
      }
      
      // Sort by block number (newest first)
      txList.sort((a, b) => b.blockNumber - a.blockNumber)
      setTransactions(txList)
      
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Format address (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Load data on component mount
  useEffect(() => {
    fetchBalance()
    fetchTransactions()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Balance Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Merchant Wallet Balance</CardTitle>
          <CardDescription>
            Current balance for address: {recipientAddress}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">{parseFloat(balance).toFixed(6)} ETH</p>
              <p className="text-sm text-muted-foreground">Scroll Sepolia Network</p>
            </div>
            <Button onClick={fetchBalance} variant="outline" size="sm">
              Refresh Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent transactions received by the merchant address
              </CardDescription>
            </div>
            <Button onClick={fetchTransactions} disabled={loading} variant="outline">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {transactions.length === 0 && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p>No transactions found</p>
              <p className="text-sm">Transactions will appear here after payments are made</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.hash} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tx.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">
                        {tx.status === 1 ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Transaction Hash</p>
                      <p className="font-mono break-all">{formatAddress(tx.hash)}</p>
                      <a 
                        href={`https://sepolia.scrollscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View on Explorer ↗
                      </a>
                    </div>

                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-mono">{formatAddress(tx.from)}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-green-600">{parseFloat(tx.value).toFixed(6)} ETH</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Block</p>
                      <p className="font-mono">#{tx.blockNumber}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span>Gas Price: {parseFloat(tx.gasPrice).toFixed(2)} Gwei</span>
                    </div>
                    <div>
                      <span>Gas Used: {tx.gasUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Network Information</CardTitle>
          <CardDescription>Scroll Sepolia Testnet Details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Network</p>
              <p className="font-medium">Scroll Sepolia Testnet</p>
            </div>
            <div>
              <p className="text-muted-foreground">RPC Endpoint</p>
              <p className="font-mono text-xs">https://sepolia-rpc.scroll.io/</p>
            </div>
            <div>
              <p className="text-muted-foreground">Merchant Address</p>
              <p className="font-mono text-xs break-all">{recipientAddress}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Explorer</p>
              <a 
                href={`https://sepolia.scrollscan.com/address/${recipientAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                View on Scroll Explorer ↗
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}