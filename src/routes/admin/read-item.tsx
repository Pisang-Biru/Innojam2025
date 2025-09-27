import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { nfcApi, type ItemResponse } from '@/lib/nfc-api'

export const Route = createFileRoute('/admin/read-item')({
  component: RouteComponent,
})

function RouteComponent() {
  // State management
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<ItemResponse | null>(null)
  const [error, setError] = useState<string>('')

  const clearResults = () => {
    setItem(null)
    setError('')
  }

  // Handle read item from NFC
  const handleReadItem = async () => {
    setLoading(true)
    clearResults()

    try {
      const result: ItemResponse = await nfcApi.readItemFromNFC()
      setItem(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read item from NFC card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">

      {/* Read Item Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scan NFC Card</CardTitle>
          <CardDescription>
            Place an NFC card near the reader to scan and display the item information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Click the button below and place your NFC card near the reader
              </p>
            </div>

            <Button 
              onClick={handleReadItem}
              disabled={loading}
              size="lg"
              className="w-full max-w-md"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Reading NFC Card...
                </div>
              ) : (
                'Read Item from NFC Card'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>📱 Instructions:</strong> Make sure your NFC card contains item data created with the Create Item page. 
            The card should be placed within 2-3cm of the NFC reader.
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Reading NFC Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>Common issues:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>No NFC card detected within timeout period</li>
                <li>Card doesn't contain valid item data</li>
                <li>Card was not created with the Create Item function</li>
                <li>NFC reader connection issues</li>
              </ul>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError('')}
              className="mt-3"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Item Display */}
      {item && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-green-600">Item Successfully Read!</CardTitle>
            <CardDescription>Here's the item information from the NFC card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Item Details */}
              <div className="grid gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">ID: {item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Price</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Item ID</Label>
                    <div className="font-mono text-sm bg-muted p-3 rounded mt-1 break-all">
                      {item.id}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Item Name</Label>
                    <div className="text-sm bg-muted p-3 rounded mt-1">
                      {item.name}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Price</Label>
                    <div className="text-sm bg-muted p-3 rounded mt-1 font-semibold">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setItem(null)}
                >
                  Clear Results
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReadItem}
                  disabled={loading}
                >
                  Read Another Card
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>NFC Reader Status</CardTitle>
          <CardDescription>Item Reading Service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Connected to http://192.168.0.171:8000/read-items</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure the Raspberry Pi NFC server is running and ready to read cards
          </p>
        </CardContent>
      </Card>
    </div>
  )
}