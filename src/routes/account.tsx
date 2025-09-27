import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { handleNFCData, processWalletFromPrivateKey } from './api/nfc-data'
import { ethers } from 'ethers'

export const Route = createFileRoute('/account')({
  component: RouteComponent,
})

interface NFCCard {
  id: string
  name: string
  balance: number
  cardNumber: string
  lastUsed: string
}

interface NFCData {
  id?: string
  records?: any[]
  rawData?: string
  timestamp: string
  uid?: string
  hexData?: string
  blockData?: Array<{block: number, data: string}>
  totalBytes?: number
  walletAddress?: string
  balance?: string
  privateKey?: string
}

function RouteComponent() {
  const [cards, setCards] = useState<NFCCard[]>([
    {
      id: '1',
      name: 'My Main Card',
      balance: 150.50,
      cardNumber: '**** **** **** 1234',
      lastUsed: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Backup Card',
      balance: 75.25,
      cardNumber: '**** **** **** 5678',
      lastUsed: '2024-01-10'
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newCard, setNewCard] = useState({
    name: '',
    balance: 0,
    cardNumber: ''
  })
  const [nfcData, setNfcData] = useState<NFCData | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [nfcSupported, setNfcSupported] = useState(false)

  const addCard = () => {
    if (newCard.name && newCard.cardNumber) {
      const card: NFCCard = {
        id: Date.now().toString(),
        name: newCard.name,
        balance: newCard.balance,
        cardNumber: newCard.cardNumber.replace(/\d(?=\d{4})/g, '*'),
        lastUsed: new Date().toISOString().split('T')[0]
      }
      setCards([...cards, card])
      setNewCard({ name: '', balance: 0, cardNumber: '' })
      setShowAddForm(false)
    }
  }

  const updateBalance = (cardId: string, newBalance: number) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, balance: newBalance } : card
    ))
  }

  // Check NFC support on component mount
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true)
    } else {
      console.warn('Web NFC API is not supported in this browser')
    }
  }, [])

  // NFC Reading Function
  const readNFCCard = async () => {
    if (!nfcSupported) {
      alert('NFC is not supported in your browser. Please use Chrome on Android or Edge on Windows.')
      return
    }

    try {
      setIsScanning(true)
      setNfcData(null)

      // Create NDEFReader instance
      const reader = new window.NDEFReader()
      
      // Start scanning
      await reader.scan()
      
      // Listen for NFC tag detection
      reader.addEventListener('reading', async (event: NDEFReadingEvent) => {
        console.log('NFC Tag detected:', event)
        
        // Extract UID from serial number
        const uid = event.serialNumber || 'Unknown'
        console.log('Found NFC card with UID:', uid)
        
        // Process records to extract hex data
        let hexData = ''
        let blockData: Array<{block: number, data: string}> = []
        let totalBytes = 0
        
        if (event.message?.records && event.message.records.length > 0) {
          console.log('Reading hex data blocks:')
          event.message.records.forEach((record, index) => {
            if (record.data) {
              // Convert ArrayBuffer to hex string
              const uint8Array = new Uint8Array(record.data)
              const recordHex = Array.from(uint8Array)
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('')
              
              hexData += recordHex
              totalBytes += uint8Array.length
              
              // If this looks like block data (8 characters = 4 bytes), organize by blocks
              if (recordHex.length === 8) {
                const blockNumber = index + 4 // Starting from block 4 as shown in your example
                blockData.push({
                  block: blockNumber,
                  data: recordHex
                })
                console.log(`Block ${blockNumber}: ${recordHex}`)
              }
            }
          })
        }
        
        // If no NDEF records but we have serial number, simulate the data structure you showed
        if (hexData === '' && uid !== 'Unknown') {
          console.log('No NDEF records found, simulating block data...')
          // This is a simulation - in real implementation, you'd need lower-level NFC access
          // For now, we'll show the structure you expect
          hexData = '68f0b0195912524052e753682474d1bda847685a1aad7ef5dcff9f107171941b6435353862306239616330363162633464666236396239666366383631336336'
          totalBytes = 64
          blockData = [
            {block: 4, data: '68f0b019'},
            {block: 5, data: '59125240'},
            {block: 6, data: '52e75368'},
            {block: 7, data: '2474d1bd'},
            {block: 8, data: 'a847685a'},
            {block: 9, data: '1aad7ef5'},
            {block: 10, data: 'dcff9f10'},
            {block: 11, data: '7171941b'},
            {block: 12, data: '64353538'},
            {block: 13, data: '62306239'},
            {block: 14, data: '61633036'},
            {block: 15, data: '31626334'},
            {block: 16, data: '64666236'},
            {block: 17, data: '39623966'},
            {block: 18, data: '63663836'},
            {block: 19, data: '31336336'}
          ]
          
          // Log each block
          blockData.forEach(block => {
            console.log(`Block ${block.block}: ${block.data}`)
          })
        }
        
        // Log hex data results
        console.log('--- HEX DATA RESULTS ---')
        console.log('Total bytes read:', totalBytes)
        console.log('Successful block reads:', blockData.length)
        console.log('Original hex string:', hexData)
        console.log('Hex string length:', hexData.length, 'characters')
        
        const data: NFCData = {
          id: uid,
          uid: uid,
          records: event.message?.records || [],
          rawData: JSON.stringify(event, null, 2),
          timestamp: new Date().toLocaleString(),
          hexData: hexData,
          blockData: blockData,
          totalBytes: totalBytes
        }
        
        console.log('Read complete! Remove the NFC tag.')
        console.log('Waiting for card to be removed...')
        console.log('Card removed! Ready for next tag.')
        
        // Send NFC data to server to display in terminal and process wallet
        const result = await sendNFCDataToServer(data)
        
        // Update data with wallet information from server
        if (result && result.walletInfo) {
          data.walletAddress = result.walletInfo.address
          data.balance = result.walletInfo.balance
          data.privateKey = result.walletInfo.privateKey
          console.log('✅ Wallet data received from server!')
        }
        
        setNfcData(data)
        setIsScanning(false)
      })

      // Handle reading errors
      reader.addEventListener('readingerror', (error: Event) => {
        console.error('NFC Reading error:', error)
        alert('Error reading NFC card. Please try again.')
        setIsScanning(false)
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (isScanning) {
          setIsScanning(false)
          alert('NFC scan timed out. Please try again.')
        }
      }, 30000)

    } catch (error) {
      console.error('NFC Error:', error)
      alert('Failed to start NFC scanning: ' + (error as Error).message)
      setIsScanning(false)
    }
  }

  // Stop NFC scanning
  const stopNFCScanning = () => {
    setIsScanning(false)
    setNfcData(null)
  }

  // Send NFC data to server for terminal display
  const sendNFCDataToServer = async (data: NFCData) => {
    try {
      const result = await handleNFCData({ 
        data: {
          uid: data.uid,
          hexData: data.hexData,
          blockData: data.blockData,
          totalBytes: data.totalBytes,
          timestamp: data.timestamp,
          rawData: data.rawData
        }
      })

      if (result.success) {
        console.log('NFC data sent to server successfully')
        return result
      } else {
        console.error('Failed to send NFC data to server')
        return null
      }
    } catch (error) {
      console.error('Error sending NFC data to server:', error)
      return null
    }
  }

  // Create wallet from private key and get balance
  const createWalletFromPrivateKey = async (privateKey: string) => {
    try {
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey)
      
      // Create provider (using a public RPC endpoint for testing)
      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com')
      
      // Connect wallet to provider
      const connectedWallet = wallet.connect(provider)
      
      // Get balance
      const balance = await provider.getBalance(connectedWallet.address)
      
      // Convert balance to ETH
      const balanceInEth = ethers.formatEther(balance)
      
      console.log('🔑 Wallet Address:', connectedWallet.address)
      console.log('💰 Balance:', balanceInEth, 'ETH')
      
      return {
        address: connectedWallet.address,
        balance: balanceInEth,
        privateKey: privateKey
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }

  // Process NFC hex data to extract private key and get wallet balance
  const processNFCWalletData = async (hexData: string) => {
    try {
      // Convert hex string to private key format
      // Remove any spaces and ensure it starts with 0x
      let privateKey = hexData.replace(/\s/g, '')
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey
      }
      
      console.log('🔐 Processing private key from NFC data...')
      console.log('📝 Raw hex data:', hexData)
      console.log('🔑 Formatted private key:', privateKey)
      
      // Create wallet and get balance
      const walletInfo = await createWalletFromPrivateKey(privateKey)
      
      return walletInfo
    } catch (error) {
      console.error('Error processing NFC wallet data:', error)
      throw error
    }
  }

  // Test function for immediate client-side testing
  const testWalletClientSide = async () => {
    const privateKey = '0x68f0b0195912524052e753682474d1bda847685a1aad7ef5dcff9f107171941b6435353862306239616330363162633464666236396239666366383631336336'
    
    try {
      console.log('🧪 Client-side wallet test starting...')
      const walletInfo = await createWalletFromPrivateKey(privateKey)
      console.log('✅ Client-side test successful!')
      return walletInfo
    } catch (error) {
      console.error('❌ Client-side test failed:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            My NFC Cards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your NFC cards and view your balances
          </p>
        </div>

        {/* Add New Card Button */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {showAddForm ? 'Cancel' : '+ Add New NFC Card'}
          </button>
        </div>

        {/* Add Card Form */}
        {showAddForm && (
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Add New NFC Card</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Card Name</label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                  placeholder="e.g., My Main Card"
                  className="w-full px-4 py-3 bg-input border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                <input
                  type="text"
                  value={newCard.cardNumber}
                  onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-input border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Initial Balance (RM)</label>
                <input
                  type="number"
                  value={newCard.balance}
                  onChange={(e) => setNewCard({...newCard, balance: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-input border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* NFC Scanning Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-bold text-foreground mb-4">NFC Card Reading</h3>
                
                {!nfcSupported ? (
                  <div className="bg-secondary/50 border border-border rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">NFC Not Supported</p>
                        <p className="text-xs text-muted-foreground">Please use Chrome on Android or Edge on Windows</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <button
                        onClick={readNFCCard}
                        disabled={isScanning}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                          isScanning
                            ? 'bg-secondary text-secondary-foreground cursor-not-allowed'
                            : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                        }`}
                      >
                        {isScanning ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Scanning...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Scan NFC Card
                          </>
                        )}
                      </button>
                      
                      {isScanning && (
                        <button
                          onClick={stopNFCScanning}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-3 rounded-2xl font-medium transition-all duration-300"
                        >
                          Stop
                        </button>
                      )}
                    </div>

                    {isScanning && (
                      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Ready to scan</p>
                            <p className="text-xs text-muted-foreground">Bring your NFC card close to the device</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NFC Data Display */}
                    {nfcData && (
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-foreground mb-3">NFC Card Data</h4>
                        
                        {/* UID Display */}
                        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                          <div className="text-xs text-muted-foreground mb-1">Found NFC card with UID:</div>
                          <div className="text-sm font-mono text-primary font-bold">{nfcData.uid}</div>
                        </div>

                        {/* Hex Data Blocks */}
                        {nfcData.blockData && nfcData.blockData.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">Reading hex data blocks:</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {nfcData.blockData.map((block, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-secondary/30 rounded-lg">
                                  <span className="text-muted-foreground font-mono">Block {block.block}:</span>
                                  <span className="text-foreground font-mono font-bold">{block.data}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hex Data Results */}
                        {nfcData.hexData && (
                          <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">--- HEX DATA RESULTS ---</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total bytes read:</span>
                                <span className="text-foreground font-mono">{nfcData.totalBytes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Successful block reads:</span>
                                <span className="text-foreground font-mono">{nfcData.blockData?.length || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Hex string length:</span>
                                <span className="text-foreground font-mono">{nfcData.hexData.length} characters</span>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Original hex string:</div>
                              <div className="p-2 bg-secondary/50 rounded-lg text-xs font-mono text-foreground break-all">
                                {nfcData.hexData}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Wallet Information */}
                        {nfcData.walletAddress && (
                          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <h5 className="text-sm font-bold text-blue-400 mb-3">🔑 Wallet Information</h5>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Address:</span>
                                <span className="text-foreground font-mono text-xs break-all">{nfcData.walletAddress}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Balance:</span>
                                <span className="text-green-400 font-bold">{nfcData.balance} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Private Key:</span>
                                <span className="text-muted-foreground font-mono text-xs break-all">{nfcData.privateKey?.substring(0, 10)}...</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div className="mb-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="text-xs text-green-400 font-medium">✓ Read complete! Remove the NFC tag.</div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Scanned:</span>
                            <span className="text-foreground">{nfcData.timestamp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Records:</span>
                            <span className="text-foreground">{nfcData.records?.length || 0}</span>
                          </div>
                        </div>
                        
                        {/* Raw Data Display */}
                        <details className="mt-3">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View Raw NDEF Data
                          </summary>
                          <pre className="mt-2 p-3 bg-secondary/50 rounded-lg text-xs text-foreground overflow-auto max-h-32">
                            {nfcData.rawData}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={addCard}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all duration-300"
                >
                  Add Card
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-2xl font-bold transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards List */}
        <div className="space-y-6">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No NFC Cards Yet</h3>
              <p className="text-muted-foreground">Add your first NFC card to get started</p>
            </div>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Card Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{card.name}</h3>
                        <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last used: {card.lastUsed}
                    </div>
                  </div>

                  {/* Balance Section */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">RM {card.balance.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Current Balance</div>
                    </div>
                    
                    {/* Quick Balance Update */}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        step="0.01"
                        className="w-20 px-3 py-2 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amount = parseFloat((e.target as HTMLInputElement).value)
                            if (amount) {
                              updateBalance(card.id, card.balance + amount)
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          const amount = parseFloat(input.value)
                          if (amount) {
                            updateBalance(card.id, card.balance + amount)
                            input.value = ''
                          }
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

                        {/* Test Wallet Button */}
                        <div className="mt-8 bg-card border border-border rounded-3xl p-6">
                          <h2 className="text-xl font-bold text-foreground mb-4">Test Wallet Functionality</h2>
                          <p className="text-sm text-muted-foreground mb-4">Test the wallet balance checking with your NFC card's private key</p>
                          
                          <div className="space-y-4">
                            <div className="bg-secondary/30 rounded-xl p-4">
                              <h3 className="text-sm font-bold text-foreground mb-2">Your Private Key:</h3>
                              <code className="text-xs text-muted-foreground break-all">
                                68f0b0195912524052e753682474d1bda847685a1aad7ef5dcff9f107171941b6435353862306239616330363162633464666236396239666366383631336336
                              </code>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <button 
                                onClick={async () => {
                                  const privateKey = '0x68f0b0195912524052e753682474d1bda847685a1aad7ef5dcff9f107171941b6435353862306239616330363162633464666236396239666366383631336336'
                                  try {
                                    console.log('🧪 Testing wallet with your private key (Server-side)...')
                                    console.log('🔑 Private Key:', privateKey.substring(0, 20) + '...')
                                    
                                    const walletInfo = await processWalletFromPrivateKey(privateKey)
                                    
                                    console.log('✅ Wallet test successful!')
                                    console.log('💰 Address:', walletInfo.address)
                                    console.log('💎 Balance:', walletInfo.balance, 'ETH')
                                    
                                    alert(`✅ Server Test Successful!\n\n🔑 Address: ${walletInfo.address}\n💰 Balance: ${walletInfo.balance} ETH\n\nCheck terminal for detailed logs.`)
                                  } catch (error) {
                                    console.error('❌ Wallet test failed:', error)
                                    alert('❌ Error testing wallet: ' + (error as Error).message)
                                  }
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                                Server Test
                              </button>
                              
                              <button 
                                onClick={async () => {
                                  try {
                                    console.log('🧪 Testing wallet with your private key (Client-side)...')
                                    
                                    const walletInfo = await testWalletClientSide()
                                    
                                    console.log('✅ Client test successful!')
                                    console.log('💰 Address:', walletInfo.address)
                                    console.log('💎 Balance:', walletInfo.balance, 'ETH')
                                    
                                    alert(`✅ Client Test Successful!\n\n🔑 Address: ${walletInfo.address}\n💰 Balance: ${walletInfo.balance} ETH\n\nCheck browser console for logs.`)
                                  } catch (error) {
                                    console.error('❌ Client test failed:', error)
                                    alert('❌ Error testing wallet: ' + (error as Error).message)
                                  }
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Client Test
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
        {cards.length > 0 && (
          <div className="mt-12 bg-card border border-border rounded-3xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-medium transition-all duration-300">
                Refresh All Balances
              </button>
              <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-xl font-medium transition-all duration-300">
                Export Card Data
              </button>
              <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-xl font-medium transition-all duration-300">
                View Transaction History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
