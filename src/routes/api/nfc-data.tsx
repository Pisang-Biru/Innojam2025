import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ethers } from 'ethers'

// Server function to process wallet from private key
const processWalletFromPrivateKey = async (privateKey: string) => {
  try {
    console.log('🔐 Processing wallet from private key on server...')
    console.log('🔑 Private key:', privateKey.substring(0, 20) + '...')
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey)
    
    // Create provider (using a public RPC endpoint)
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com')
    
    // Get balance
    const balance = await provider.getBalance(wallet.address)
    
    // Convert balance to ETH
    const balanceInEth = ethers.formatEther(balance)
    
    console.log('💰 Wallet Address:', wallet.address)
    console.log('💎 Balance:', balanceInEth, 'ETH')
    
    return {
      address: wallet.address,
      balance: balanceInEth,
      privateKey: privateKey
    }
  } catch (error) {
    console.error('❌ Error processing wallet on server:', error)
    throw error
  }
}

// Server function to handle NFC data and display in terminal
const handleNFCData = createServerFn({ method: 'POST' })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    // Display NFC data in terminal/server console
    console.log('\n🔍 === NFC CARD DATA RECEIVED ===')
    console.log(`📱 Found NFC card with UID: ${data.uid}`)
    console.log(`⏰ Timestamp: ${data.timestamp}`)
    
    if (data.blockData && data.blockData.length > 0) {
      console.log('\n📖 Reading hex data blocks:')
      data.blockData.forEach((block: any) => {
        console.log(`Block ${block.block}: ${block.data}`)
      })
    }
    
    console.log('\n📊 --- HEX DATA RESULTS ---')
    console.log(`Total bytes read: ${data.totalBytes}`)
    console.log(`Successful block reads: ${data.blockData?.length || 0}`)
    console.log(`Original hex string: ${data.hexData}`)
    console.log(`Hex string length: ${data.hexData?.length || 0} characters`)
    
    // Process wallet data if hex data is available
    if (data.hexData) {
      try {
        console.log('\n🔐 === PROCESSING WALLET DATA ===')
        
        // Convert hex string to private key format
        let privateKey = data.hexData.replace(/\s/g, '')
        if (!privateKey.startsWith('0x')) {
          privateKey = '0x' + privateKey
        }
        
        console.log('📝 Raw hex data:', data.hexData)
        console.log('🔑 Formatted private key:', privateKey.substring(0, 20) + '...')
        
        // Process wallet on server
        const walletInfo = await processWalletFromPrivateKey(privateKey)
        
        console.log('\n🔑 === WALLET INFORMATION ===')
        console.log(`💰 Wallet Address: ${walletInfo.address}`)
        console.log(`💎 Balance: ${walletInfo.balance} ETH`)
        console.log(`🔐 Private Key: ${walletInfo.privateKey.substring(0, 20)}...`)
        
        // Return wallet info to client
        return { 
          success: true, 
          message: 'NFC data received and wallet processed',
          walletInfo: walletInfo
        }
      } catch (error) {
        console.error('❌ Error processing wallet data:', error)
        return { 
          success: false, 
          message: 'NFC data received but wallet processing failed',
          error: (error as Error).message
        }
      }
    }
    
    console.log('\n✅ Read complete! Remove the NFC tag.')
    console.log('⏳ Waiting for card to be removed...')
    console.log('🗑️  Card removed! Ready for next tag.')
    console.log('='.repeat(50))
    
    return { success: true, message: 'NFC data received and displayed in terminal' }
  })

export const Route = createFileRoute('/api/nfc-data')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">NFC Data API</h1>
        <p className="text-muted-foreground">This endpoint receives NFC data from mobile devices</p>
      </div>
    </div>
  )
}

// Export the server function for use in other components
export { handleNFCData, processWalletFromPrivateKey }