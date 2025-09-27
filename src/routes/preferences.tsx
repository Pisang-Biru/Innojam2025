import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/preferences')({
  component: PreferencesPage,
})

function PreferencesPage() {
  const navigate = useNavigate()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [foodPreferences, setFoodPreferences] = useState<string[]>([])
  const [budgetLevel, setBudgetLevel] = useState<string>('')
  const [ambience, setAmbience] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState<string>('')
  const [transport, setTransport] = useState<string>('')
  const [timePreferences, setTimePreferences] = useState<string[]>([])
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([])
  const [mood, setMood] = useState<string>('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleFindSpots = async () => {
    setIsDetectingLocation(true)

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.')
        setIsDetectingLocation(false)
        return
      }

      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      })

      const { latitude, longitude } = position.coords

      // Prepare user preferences data
      const userPreferences = {
        categories: selectedCategories,
        foodPreferences,
        budgetLevel,
        ambience,
        maxDistance,
        transport,
        timePreferences,
        specialNeeds,
        mood,
        location: {
          latitude,
          longitude,
          timestamp: new Date().toISOString()
        }
      }

      // Navigate to results page with preferences and location data
      navigate({
        to: '/results',
        search: {
          preferences: JSON.stringify(userPreferences)
        }
      })

    } catch (error) {
      console.error('Error getting location:', error)
      
      // Handle different types of location errors
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please enable location permissions and try again.')
            break
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable. Please check your GPS settings.')
            break
          case error.TIMEOUT:
            alert('Location request timed out. Please try again.')
            break
          default:
            alert('An unknown error occurred while getting your location.')
            break
        }
      } else {
        alert('Unable to detect your location. Please try again.')
      }
      
      setIsDetectingLocation(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Personalize Your Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us your preferences to find the perfect spots for you in Cyberjaya
          </p>
        </div>

        {/* Combined Preferences Section */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Tell Us Your Preferences</h2>
          
          <div className="space-y-8">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'food', label: 'Food & Beverages' },
                  { id: 'retail', label: 'Retail' },
                  { id: 'services', label: 'Services' },
                  { id: 'lifestyle', label: 'Lifestyle' }
                ].map(category => (
                  <button
                    key={category.id}
                    onClick={() => toggleSelection(category.id, selectedCategories, setSelectedCategories)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {['Halal', 'Vegan', 'Vegetarian', 'Gluten-Free'].map(pref => (
                  <button
                    key={pref}
                    onClick={() => toggleSelection(pref, foodPreferences, setFoodPreferences)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      foodPreferences.includes(pref)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Level */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Budget Level</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'cheap', label: 'Budget (Under RM20)' },
                  { id: 'medium', label: 'Medium (RM20-50)' },
                  { id: 'premium', label: 'Premium (RM50+)' }
                ].map(budget => (
                  <button
                    key={budget.id}
                    onClick={() => setBudgetLevel(budget.id)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      budgetLevel === budget.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {budget.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambience */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Ambience</h3>
              <div className="flex flex-wrap gap-2">
                {['Quiet', 'Social', 'Luxury', 'Casual'].map(amb => (
                  <button
                    key={amb}
                    onClick={() => toggleSelection(amb, ambience, setAmbience)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      ambience.includes(amb)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {amb}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance & Transport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-card-foreground mb-4">Max Distance</h3>
                <div className="flex flex-wrap gap-2">
                  {['1km', '3km', '5km'].map(distance => (
                    <button
                      key={distance}
                      onClick={() => setMaxDistance(distance)}
                      className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                        maxDistance === distance
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {distance}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-card-foreground mb-4">Transport</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'walking', label: 'Walking' },
                    { id: 'car', label: 'Car' },
                    { id: 'escooter', label: 'E-Scooter' }
                  ].map(transportType => (
                    <button
                      key={transportType.id}
                      onClick={() => setTransport(transportType.id)}
                      className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                        transport === transportType.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {transportType.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Preferences */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Time Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'morning', label: 'Morning (6AM-12PM)' },
                  { id: 'afternoon', label: 'Afternoon (12PM-6PM)' },
                  { id: 'evening', label: 'Evening (6PM-10PM)' },
                  { id: 'latenight', label: 'Late Night (10PM-6AM)' }
                ].map(time => (
                  <button
                    key={time.id}
                    onClick={() => toggleSelection(time.id, timePreferences, setTimePreferences)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      timePreferences.includes(time.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Needs */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Special Needs</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'wheelchair', label: 'Wheelchair Accessible' },
                  { id: 'childfriendly', label: 'Child-Friendly' },
                  { id: 'petfriendly', label: 'Pet-Friendly' },
                  { id: 'parking', label: 'Parking Available' }
                ].map(need => (
                  <button
                    key={need.id}
                    onClick={() => toggleSelection(need.id, specialNeeds, setSpecialNeeds)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      specialNeeds.includes(need.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {need.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Mood */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4">Current Mood</h3>
              <p className="text-muted-foreground mb-4 text-sm">How are you feeling today?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'productive', label: 'Productive' },
                  { id: 'relaxed', label: 'Relaxed' },
                  { id: 'social', label: 'Social' }
                ].map(moodOption => (
                  <button
                    key={moodOption.id}
                    onClick={() => setMood(moodOption.id)}
                    className={`px-4 py-2 text-sm rounded-full border font-medium transition-all ${
                      mood === moodOption.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {moodOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

         {/* Submit Button */}
         <div className="text-center pt-6">
           <button 
             onClick={handleFindSpots}
             disabled={isDetectingLocation}
             className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground px-8 py-3 md:px-12 md:py-4 rounded-full text-base md:text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
           >
             {isDetectingLocation ? (
               <>
                 <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Detecting Location...
               </>
             ) : (
               <>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 Find My Perfect Spots
               </>
             )}
           </button>
         </div>
      </div>
    </div>
  )
}