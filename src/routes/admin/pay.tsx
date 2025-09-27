import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { nfcApi, type ItemResponse, type ReadHexResponse } from '@/lib/nfc-api'
import { ethers } from 'ethers'

export const Route = createFileRoute('/admin/pay')({
  component: RouteComponent,
})

interface CartItem extends ItemResponse {
  quantity: number
  scannedAt: Date
}

function RouteComponent() {
  // State management
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [error, setError] = useState<string>('')
  const [lastScannedItem, setLastScannedItem] = useState<ItemResponse | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<string>('')

  const clearError = () => setError('')

  // Calculate totals
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Handle scan item from NFC
  const handleScanItem = async () => {
    setLoading(true)
    clearError()

    try {
      const scannedItem: ItemResponse = await nfcApi.readItemFromNFC()
      setLastScannedItem(scannedItem)
      
      // Add to cart or increment quantity
      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(item => item.id === scannedItem.id)
        
        if (existingItemIndex >= 0) {
          // Item exists, increment quantity
          const updatedCart = [...prevCart]
          updatedCart[existingItemIndex].quantity += 1
          updatedCart[existingItemIndex].scannedAt = new Date()
          return updatedCart
        } else {
          // New item, add to cart
          return [...prevCart, {
            ...scannedItem,
            quantity: 1,
            scannedAt: new Date()
          }]
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan item from NFC card')
    } finally {
      setLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setLastScannedItem(null)
  }

  // Process payment with NFC card scan
  const processPayment = async () => {
    if (cart.length === 0) return

    setPaymentLoading(true)
    setError('')
    setPaymentSuccess('')

    try {
      // Step 1: Scan NFC card to get private key
      const nfcData: ReadHexResponse = await nfcApi.readHexFromNFC()
      
      if (!nfcData.hex_data) {
        throw new Error('No hex data found on NFC card')
      }

      // Step 2: Use hex data as private key
      const privateKey = nfcData.hex_data.startsWith('0x') ? nfcData.hex_data : `0x${nfcData.hex_data}`
      
      // Step 3: Create wallet from private key
      const provider = new ethers.JsonRpcProvider('https://sepolia-rpc.scroll.io/') // Using Scroll Sepolia testnet
      const wallet = new ethers.Wallet(privateKey, provider)

      // Step 4: Calculate payment amount in ETH (assuming 1 USD = 0.0003 ETH for demo)
      const totalPriceUSD = getTotalPrice()
      const ethAmount = (totalPriceUSD * 0.0003).toFixed(6) // Convert USD to ETH
      const amountInWei = ethers.parseEther(ethAmount)

      // Step 5: Prepare transaction
      const recipientAddress = '0x0Dc22cEe7d3Ae46d448afDB4a654946EaA20eB4D'
      
      const transaction = {
        to: recipientAddress,
        value: amountInWei,
        gasLimit: 21000,
      }

      // Step 6: Send transaction
      const txResponse = await wallet.sendTransaction(transaction)
      
      // Step 7: Wait for confirmation
      const receipt = await txResponse.wait()
      
      if (receipt && receipt.status === 1) {
        setPaymentSuccess(`Payment successful! Transaction hash: ${receipt.hash}`)
        clearCart()
      } else {
        throw new Error('Transaction failed')
      }

    } catch (err) {
      console.error('Payment error:', err)
      if (err instanceof Error) {
        setError(`Payment failed: ${err.message}`)
      } else {
        setError('Payment failed: Unknown error occurred')
      }
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Scanner */}
        <div className="space-y-6">
          {/* Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle>NFC Item Scanner</CardTitle>
              <CardDescription>
                Scan NFC cards to add items to your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="mb-4">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Place NFC card near reader to add to cart
                  </p>
                </div>

                <Button 
                  onClick={handleScanItem}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scanning...
                    </div>
                  ) : (
                    'Scan Item'
                  )}
                </Button>
              </div>

              {/* Last Scanned Item */}
              {lastScannedItem && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">Last Scanned</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{lastScannedItem.name}</p>
                      <p className="text-sm text-gray-600">{lastScannedItem.id}</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      ${lastScannedItem.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>💡 Tip:</strong> Scan the same item multiple times to increase quantity, 
                or use the quantity controls in the cart.
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Scan Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearError}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Cart */}
        <div className="space-y-6">
          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shopping Cart</CardTitle>
                  <CardDescription>
                    {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
                  </CardDescription>
                </div>
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    Clear Cart
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <p>Cart is empty</p>
                  <p className="text-sm">Scan items to add them to your cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 p-0 ml-2"
                        >
                          ×
                        </Button>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total & Checkout */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={processPayment}
                  disabled={paymentLoading}
                  className="w-full"
                  size="lg"
                >
                  {paymentLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay with NFC Card - $${getTotalPrice().toFixed(2)}`
                  )}
                </Button>
                
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                  <strong>💳 Payment Process:</strong> Click to scan your NFC card with private key. 
                  The system will automatically transfer ${(getTotalPrice() * 0.0003).toFixed(6)} ETH to the merchant on Scroll Sepolia network.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Success Message */}
      {paymentSuccess && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Payment Successful! 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-sm">{paymentSuccess}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPaymentSuccess('')}
              className="mt-3"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>NFC Scanner & Payment System</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">NFC Reader: Connected to http://192.168.0.171:8000/read-items</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Blockchain: Connected to Scroll Sepolia (https://sepolia-rpc.scroll.io/)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            NFC reader ready for item scanning and payment processing on Scroll network
          </p>
        </CardContent>
      </Card>
    </div>
  )
}