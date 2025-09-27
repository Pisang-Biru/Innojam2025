import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

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
