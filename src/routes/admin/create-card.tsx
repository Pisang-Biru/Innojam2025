import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { nfcApi, type WriteHexResponse } from '@/lib/nfc-api'
import { ethers } from 'ethers'

export const Route = createFileRoute('/admin/create-card')({
  component: RouteComponent,
})

interface PrivateKeyCardResults {
  private_key: string;
  public_key: string;
  address: string;
  uid?: string;
  message: string;
}

function RouteComponent() {
  // State management
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PrivateKeyCardResults | null>(null)
  const [error, setError] = useState<string>('')
  const [privateKeyInput, setPrivateKeyInput] = useState<string>('')

  const clearResults = () => {
    setResults(null)
    setError('')
  }

  // Validate private key format
  const validatePrivateKey = (privateKey: string): boolean => {
    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey
    // Check if it's a valid 64-character hex string
    return /^[0-9a-fA-F]{64}$/.test(cleanKey)
  }

  // Handle create private key card
  const handleCreatePkCard = async () => {
    if (!privateKeyInput.trim()) {
      setError('Please enter a private key')
      return
    }

    if (!validatePrivateKey(privateKeyInput.trim())) {
      setError('Invalid private key format. Please enter a valid 64-character hexadecimal private key.')
      return
    }

    setLoading(true)
    clearResults()

    try {
      // Clean the private key input
      const cleanPrivateKey = privateKeyInput.trim()
      const privateKeyWithPrefix = cleanPrivateKey.startsWith('0x') ? cleanPrivateKey : `0x${cleanPrivateKey}`
      
      // Create wallet from the provided private key to get public key and address
      const wallet = new ethers.Wallet(privateKeyWithPrefix)
      
      // Get the private key without the '0x' prefix for NFC writing
      const privateKeyHex = privateKeyWithPrefix.slice(2)
      
      // Ensure we only have the 64-character private key hex
      const cleanPrivateKeyHex = privateKeyHex.substring(0, 64)
      
      console.log('Private key hex to write:', cleanPrivateKeyHex)
      console.log('Length:', cleanPrivateKeyHex.length)
      
      // Write the private key to NFC card
      const writeResult: WriteHexResponse = await nfcApi.writeHexToNFC(cleanPrivateKeyHex)
      
      // Create the results object
      const results: PrivateKeyCardResults = {
        private_key: privateKeyWithPrefix,
        public_key: wallet.signingKey.publicKey,
        address: wallet.address,
        uid: writeResult.uid,
        message: 'Private key successfully written to NFC card'
      }
      
      setResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write private key to card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Create PK Card Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Write Private Key to NFC Card</CardTitle>
          <CardDescription>
            Enter a private key to write to an NFC card. 
            Make sure you have an NFC card ready to write to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Private Key Input */}
          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key</Label>
            <Input
              id="privateKey"
              type="password"
              placeholder="Enter private key (with or without 0x prefix)"
              value={privateKeyInput}
              onChange={(e) => setPrivateKeyInput(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid 64-character hexadecimal private key. The 0x prefix is optional.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The process will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Validate the private key format</li>
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
                  Writing Private Key to Card...
                </div>
              ) : (
                'Write Private Key to Card'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <strong>⚠️ Security Notice:</strong> Make sure you're in a secure environment. 
            The private key will be written to the NFC card and should be kept safe. Never share your private key with anyone.
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
            <CardTitle className="text-green-600">Private Key Written Successfully!</CardTitle>
            <CardDescription>Your private key has been written to the NFC card</CardDescription>
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
          <CardDescription>NFC Private Key Writing Service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Connected to https://nfc.hrzhkm.xyz/write-pk</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure the Raspberry Pi NFC server is running and an NFC card is ready
          </p>
        </CardContent>
      </Card>
    </div>
  )
}