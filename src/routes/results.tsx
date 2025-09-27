import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/results')({
  component: ResultsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      preferences: (search.preferences as string) || ''
    }
  }
})

interface UserPreferences {
  categories: string[]
  foodPreferences: string[]
  budgetLevel: string
  ambience: string[]
  maxDistance: string
  transport: string
  timePreferences: string[]
  specialNeeds: string[]
  mood: string
  location: {
    latitude: number
    longitude: number
    timestamp: string
  }
}

interface LocationInfo {
  address: string
  city: string
  country: string
  state: string
  loading: boolean
}

interface PremiseData {
  premise_code: string
  premise: string
  address: string
  premise_type: string
  state: string
  district: string
}

function ResultsPage() {
  const search = useSearch({ from: '/results' })
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    address: '',
    city: '',
    country: '',
    state: '',
    loading: true
  })
  const [premiseData, setPremiseData] = useState<PremiseData[]>([])
  const [premiseLoading, setPremiseLoading] = useState(false)
  const [premiseError, setPremiseError] = useState<string | null>(null)

  useEffect(() => {
    if (search.preferences) {
      try {
        const parsedPreferences = JSON.parse(search.preferences) as UserPreferences
        setPreferences(parsedPreferences)
        
        // Reverse geocode the location to get address
        reverseGeocode(parsedPreferences.location.latitude, parsedPreferences.location.longitude)
      } catch (error) {
        console.error('Error parsing preferences:', error)
      }
    }
  }, [search.preferences])

  // Fetch premise data from local CSV file
  const fetchPremiseData = async () => {
    if (!locationInfo.state) return

    setPremiseLoading(true)
    setPremiseError(null)
    
    try {
      console.log('Loading premise data for state:', locationInfo.state)
      
      // Fetch from local CSV file in public folder
      const response = await fetch('/excel/lookup_premise.csv')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const csvText = await response.text()
      const parsedData = parseCSV(csvText)
      
      // Filter data by user's detected state
      const filteredData = parsedData.filter(premise => 
        premise.state.toLowerCase().includes(locationInfo.state.toLowerCase()) ||
        locationInfo.state.toLowerCase().includes(premise.state.toLowerCase())
      )
      
      setPremiseData(filteredData)
      console.log(`Found ${filteredData.length} premises in ${locationInfo.state}`)
      
    } catch (error) {
      console.error('Error loading premise data:', error)
      setPremiseError('Unable to load premise data from CSV file.')
      setPremiseData([])
      
    } finally {
      setPremiseLoading(false)
    }
  }

  // Parse CSV data into structured format
  const parseCSV = (csvText: string): PremiseData[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',')
    const data: PremiseData[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      
      // Skip invalid rows
      if (values.length < 6 || !values[1] || !values[4]) continue
      
      const premise: PremiseData = {
        premise_code: values[0] || '',
        premise: values[1] || '',
        address: values[2] || '',
        premise_type: values[3] || '',
        state: values[4] || '',
        district: values[5] || ''
      }
      
      data.push(premise)
    }
    
    return data
  }

  // Parse CSV line handling quoted values with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }


  // Trigger premise data fetch when location state is available
  useEffect(() => {
    if (locationInfo.state && !locationInfo.loading) {
      fetchPremiseData()
    }
  }, [locationInfo.state, locationInfo.loading])

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      // Using Nominatim OpenStreetMap API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CyberjayaSpotFinder/1.0'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.display_name) {
          const address = data.address || {}
          
          // Build a more readable address
          const addressParts = []
          if (address.house_number && address.road) {
            addressParts.push(`${address.house_number} ${address.road}`)
          } else if (address.road) {
            addressParts.push(address.road)
          }
          
          if (address.suburb || address.neighbourhood) {
            addressParts.push(address.suburb || address.neighbourhood)
          }
          
          if (address.city || address.town || address.village) {
            addressParts.push(address.city || address.town || address.village)
          }
          
          if (address.state) {
            addressParts.push(address.state)
          }
          
          const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name
          
          setLocationInfo({
            address: formattedAddress,
            city: address.city || address.town || address.village || 'Unknown City',
            country: address.country || 'Unknown Country',
            state: address.state || address.province || 'Unknown State',
            loading: false
          })
        } else {
          throw new Error('No address data received')
        }
      } else {
        throw new Error('Geocoding API failed')
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      
      // Try alternative free geocoding service
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data && (data.locality || data.city || data.principalSubdivision)) {
            const addressParts = []
            
            if (data.locality) addressParts.push(data.locality)
            if (data.city && data.city !== data.locality) addressParts.push(data.city)
            if (data.principalSubdivision) addressParts.push(data.principalSubdivision)
            
            setLocationInfo({
              address: addressParts.join(', ') || data.localityInfo?.administrative?.[0]?.name || 'Location detected',
              city: data.city || data.locality || 'Unknown City',
              country: data.countryName || 'Unknown Country',
              state: data.principalSubdivision || 'Unknown State',
              loading: false
            })
            return
          }
        }
      } catch (secondError) {
        console.error('Second geocoding attempt failed:', secondError)
      }
      
      // Final fallback - show coordinates with attempt to identify if in Malaysia
      const isInMalaysia = lat >= 1.0 && lat <= 7.5 && lon >= 99.0 && lon <= 120.0
      setLocationInfo({
        address: `Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        city: isInMalaysia ? 'Malaysia' : 'Unknown Location',
        country: isInMalaysia ? 'Malaysia' : 'Unknown Country',
        state: isInMalaysia ? 'Selangor' : 'Unknown State', // Default to Selangor for Malaysia
        loading: false
      })
    }
  }

  // Convert premise data to display format and filter by preferences
  const getFilteredPremiseData = () => {
    if (!premiseData || premiseData.length === 0) return []

    // Map premise types to preference categories
    const categoryMapping: { [key: string]: string[] } = {
      'food': ['Restaurant', 'Cafe', 'Pasar Basah'],
      'retail': ['Hypermarket', 'Pasar Raya / Supermarket', 'Pasar Mini', 'Kedai Runcit'],
      'services': ['Pharmacy', 'Gym', 'Salon', 'Clinic', 'Services'],
      'lifestyle': ['Coworking Space', 'Entertainment', 'Park']
    }

    let filteredData = premiseData

    // Filter by user preferences if any are selected
    if (preferences && preferences.categories.length > 0) {
      filteredData = premiseData.filter(premise => {
        return preferences.categories.some(userCategory => {
          const mappedTypes = categoryMapping[userCategory.toLowerCase()] || []
          return mappedTypes.some(type => 
            premise.premise_type.toLowerCase().includes(type.toLowerCase()) ||
            type.toLowerCase().includes(premise.premise_type.toLowerCase())
          )
        })
      })
    }

    return filteredData.map(premise => ({
      id: premise.premise_code,
      name: premise.premise,
      type: premise.premise_type,
      address: premise.address,
      premiseCode: premise.premise_code,
      state: premise.state,
      district: premise.district
    }))
  }

  const filteredPremises = getFilteredPremiseData()

  if (!preferences) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No preferences found</h1>
          <Link to="/preferences" className="text-primary hover:underline">
            Go back to preferences
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/preferences" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Preferences
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perfect Spots Found! 🎯
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your location and preferences
          </p>
        </div>

        {/* Location Information */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-6 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1">📍 Your Current Location</h2>
              <p className="text-muted-foreground text-sm">Real-time location detected from your device</p>
            </div>
          </div>
          
          {locationInfo.loading ? (
            <div className="bg-card/50 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">Getting your exact address...</span>
              </div>
            </div>
          ) : (
            <div className="bg-card/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">🏠</span>
                <div>
                  <p className="text-foreground font-bold text-lg leading-tight">{locationInfo.address}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {locationInfo.city}, {locationInfo.state}, {locationInfo.country}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <span className="text-sm">🗺️</span>
                <p className="text-muted-foreground text-xs">
                  Coordinates: {preferences.location.latitude.toFixed(6)}, {preferences.location.longitude.toFixed(6)}
                </p>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps?q=${preferences.location.latitude},${preferences.location.longitude}`, '_blank')}
                  className="ml-auto text-primary text-xs hover:underline font-medium"
                >
                  View on Maps →
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Detected at {new Date(preferences.location.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* User Preferences Summary */}
        <div className="bg-card border border-border rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {preferences.categories.length > 0 && (
              <div>
                <span className="font-medium text-foreground">Categories: </span>
                <span className="text-muted-foreground">{preferences.categories.join(', ')}</span>
              </div>
            )}
            {preferences.budgetLevel && (
              <div>
                <span className="font-medium text-foreground">Budget: </span>
                <span className="text-muted-foreground">{preferences.budgetLevel}</span>
              </div>
            )}
            {preferences.maxDistance && (
              <div>
                <span className="font-medium text-foreground">Max Distance: </span>
                <span className="text-muted-foreground">{preferences.maxDistance}</span>
              </div>
            )}
            {preferences.transport && (
              <div>
                <span className="font-medium text-foreground">Transport: </span>
                <span className="text-muted-foreground">{preferences.transport}</span>
              </div>
            )}
            {preferences.mood && (
              <div>
                <span className="font-medium text-foreground">Mood: </span>
                <span className="text-muted-foreground">{preferences.mood}</span>
              </div>
            )}
          </div>
        </div>

        {/* Premise Data Status */}
        {premiseLoading && (
          <div className="bg-card border border-border rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-foreground font-medium">Loading premises data for {locationInfo.state}...</span>
            </div>
          </div>
        )}

        {premiseError && (
          <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-orange-500">⚠️</span>
              <span className="text-orange-700 font-medium">{premiseError}</span>
            </div>
          </div>
        )}

        {/* Premises List */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Premises in {locationInfo.state} ({filteredPremises.length})
            </h2>
            {premiseData.length > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Government Data
              </span>
            )}
          </div>
          
          {filteredPremises.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {premiseLoading 
                  ? "Loading premise data..." 
                  : "No premises found for your location. Please ensure backend is set up to process the parquet data."
                }
              </p>
              <Link 
                to="/preferences" 
                className="text-primary hover:underline font-medium"
              >
                Try again with different location
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPremises.map((premise) => (
                <div key={premise.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">🏢</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{premise.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-muted-foreground text-sm">{premise.type}</p>
                            <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded text-xs font-mono">
                              {premise.premiseCode}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col gap-1">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {premise.state}
                            </span>
                            {premise.district && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                {premise.district}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-muted-foreground">📍</span>
                        <p className="text-muted-foreground">{premise.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}