import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { nfcApi, type CreatePkRequest, type CreatePkResponse } from '@/lib/nfc-api'

export const Route = createFileRoute('/admin/create-card')({
  component: RouteComponent,
})

function RouteComponent() {
  // State management
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CreatePkResponse | null>(null)
  const [error, setError] = useState<string>('')

  // Form state (if needed for additional parameters)
  const [formData] = useState<CreatePkRequest>({})

  const clearResults = () => {
    setResults(null)
    setError('')
  }

  // Handle create private key card
  const handleCreatePkCard = async () => {
    setLoading(true)
    clearResults()

    try {
      const result: CreatePkResponse = await nfcApi.createPkCard(formData)
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create private key card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Private Key Card</h1>
        <p className="text-muted-foreground">
          Generate a new private key and store it on an NFC card
        </p>
      </div>

      {/* Create PK Card Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Private Key Card</CardTitle>
          <CardDescription>
            This will generate a new private key and write it to an NFC card. 
            Make sure you have an NFC card ready to write to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add any additional form fields if needed by your create-pk endpoint */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the button below to generate a new private key and write it to your NFC card.
              The process will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Generate a new cryptographic private key</li>
              <li>Derive the corresponding public key and address</li>
              <li>Write the private key data to the NFC card</li>
              <li>Return the key information for your records</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleCreatePkCard}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Private Key Card...
                </div>
              ) : (
                'Create Private Key Card'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <strong>⚠️ Security Notice:</strong> Make sure you're in a secure environment. 
            The private key will be written to the NFC card and should be kept safe.
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
            <CardTitle className="text-green-600">Private Key Card Created Successfully!</CardTitle>
            <CardDescription>Your private key has been generated and written to the NFC card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.message && (
                <p className="text-green-600 font-medium">{results.message}</p>
              )}

              {/* Display key information */}
              <div className="grid gap-4">
                {results.address && (
                  <div>
                    <Label className="text-sm font-semibold">Wallet Address</Label>
                    <div className="font-mono text-sm bg-muted p-3 rounded mt-1 break-all">
                      {results.address}
                    </div>
                  </div>
                )}

                {results.public_key && (
                  <div>
                    <Label className="text-sm font-semibold">Public Key</Label>
                    <div className="font-mono text-xs bg-muted p-3 rounded mt-1 break-all">
                      {results.public_key}
                    </div>
                  </div>
                )}

                {results.uid && (
                  <div>
                    <Label className="text-sm font-semibold">NFC Card UID</Label>
                    <div className="font-mono text-sm bg-muted p-3 rounded mt-1">
                      {results.uid}
                    </div>
                  </div>
                )}

                {results.private_key && (
                  <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                    <Label className="text-sm font-semibold text-red-700">⚠️ Private Key (Keep Secure!)</Label>
                    <div className="font-mono text-xs bg-red-100 p-3 rounded mt-2 break-all text-red-800">
                      {results.private_key}
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      This private key has been written to your NFC card. Store this information securely and never share it.
                    </p>
                  </div>
                )}
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
          <CardDescription>NFC Private Key Generation Service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Connected to http://192.168.0.171:8000/create-pk</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure the Raspberry Pi NFC server is running and an NFC card is ready
          </p>
        </CardContent>
      </Card>
    </div>
  )
}