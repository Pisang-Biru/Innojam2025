import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { nfcApi, type CreateItemRequest, type CreateItemResponse } from '@/lib/nfc-api'

export const Route = createFileRoute('/admin/create-item')({
  component: RouteComponent,
})

function RouteComponent() {
  // State management
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CreateItemResponse | null>(null)
  const [error, setError] = useState<string>('')

  // Form state
  const [itemForm, setItemForm] = useState<CreateItemRequest>({
    name: '',
    price: 0,
    id: ''
  })

  const clearResults = () => {
    setResults(null)
    setError('')
  }

  // Handle create item
  const handleCreateItem = async () => {
    // Validation
    if (!itemForm.name.trim()) {
      setError('Item name is required')
      return
    }
    if (itemForm.price < 0) {
      setError('Price cannot be negative')
      return
    }

    setLoading(true)
    clearResults()

    try {
      const requestData: CreateItemRequest = {
        name: itemForm.name.trim(),
        price: itemForm.price,
        ...(itemForm.id?.trim() && { id: itemForm.id.trim() })
      }

      const result: CreateItemResponse = await nfcApi.createItem(requestData)
      setResults(result)
      
      // Reset form on success
      setItemForm({ name: '', price: 0, id: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  // Preview JSON that will be written to NFC
  const getPreviewJson = () => {
    if (!itemForm.name.trim()) return null
    
    const previewData = {
      id: itemForm.id?.trim() || '[auto-generated]',
      name: itemForm.name.trim(),
      price: itemForm.price
    }
    
    return JSON.stringify(previewData, null, 2)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Item</h1>
        <p className="text-muted-foreground">
          Create a new item and write it as JSON data to an NFC card
        </p>
      </div>

      {/* Create Item Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Enter the item information. The data will be converted to JSON and written to an NFC card.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="item-name">Item Name *</Label>
            <Input
              id="item-name"
              value={itemForm.name}
              onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name (e.g., Coffee Mug, T-Shirt)"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="item-price">Price *</Label>
            <Input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              value={itemForm.price}
              onChange={(e) => setItemForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the price in your local currency
            </p>
          </div>
          
          <div>
            <Label htmlFor="item-id">Custom ID (Optional)</Label>
            <Input
              id="item-id"
              value={itemForm.id}
              onChange={(e) => setItemForm(prev => ({ ...prev, id: e.target.value }))}
              placeholder="Leave empty for auto-generated UUID"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If provided, this ID must be unique. Otherwise, a UUID will be generated.
            </p>
          </div>

          {/* JSON Preview */}
          {itemForm.name.trim() && (
            <div>
              <Label>JSON Preview</Label>
              <div className="bg-muted p-3 rounded-lg mt-1">
                <pre className="text-xs font-mono overflow-auto">
                  {getPreviewJson()}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This JSON data will be written to the NFC card
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={handleCreateItem}
              disabled={loading || !itemForm.name.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Item & Writing to NFC...
                </div>
              ) : (
                'Create Item & Write to NFC Card'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <strong>📋 Process:</strong> The item will be created with JSON format, converted to hex, 
            and written to your NFC card. Make sure you have an NFC card ready.
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError('')}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {results && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-green-600">Item Created Successfully!</CardTitle>
            <CardDescription>Your item has been created and written to the NFC card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.message && (
                <p className="text-green-600 font-medium">{results.message}</p>
              )}

              {/* Display item information */}
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-semibold">Item ID</Label>
                  <div className="font-mono text-sm bg-muted p-3 rounded mt-1">
                    {results.id}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Item Name</Label>
                  <div className="text-sm bg-muted p-3 rounded mt-1">
                    {results.name}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Price</Label>
                  <div className="text-sm bg-muted p-3 rounded mt-1">
                    ${results.price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">JSON Data Written to NFC</Label>
                  <div className="bg-muted p-3 rounded mt-1">
                    <pre className="text-xs font-mono overflow-auto">
                      {JSON.stringify({
                        id: results.id,
                        name: results.name,
                        price: results.price
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Full response for debugging */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  View Full Response (Debug)
                </summary>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setResults(null)}
              className="mt-4"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Connection</CardTitle>
          <CardDescription>Item Creation & NFC Writing Service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Connected to http://192.168.0.171:8000/create-item</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure the Raspberry Pi NFC server is running and an NFC card is ready
          </p>
        </CardContent>
      </Card>
    </div>
  )
}