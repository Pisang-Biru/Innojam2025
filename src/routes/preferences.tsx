import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/preferences')({
  component: PreferencesPage,
})

function PreferencesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [foodPreferences, setFoodPreferences] = useState<string[]>([])
  const [budgetLevel, setBudgetLevel] = useState<string>('')
  const [ambience, setAmbience] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState<string>('')
  const [transport, setTransport] = useState<string>('')
  const [timePreferences, setTimePreferences] = useState<string[]>([])
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([])
  const [mood, setMood] = useState<string>('')

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personalize Your Experience
          </h1>
          <p className="text-lg text-gray-600">
            Tell us your preferences to find the perfect spots for you
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Category of Store */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🏪 Category of Store</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'food', label: 'Food & Beverages', desc: 'Cafes, Restaurants, Street Food', icon: '🍽️' },
                { id: 'retail', label: 'Retail', desc: 'Clothes, Electronics, Bookstores', icon: '🛍️' },
                { id: 'services', label: 'Services', desc: 'Gyms, Salons, Clinics', icon: '💪' },
                { id: 'lifestyle', label: 'Lifestyle', desc: 'Coworking, Entertainment, Parks', icon: '🎯' }
              ].map(category => (
                <div
                  key={category.id}
                  onClick={() => toggleSelection(category.id, selectedCategories, setSelectedCategories)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{category.label}</h3>
                      <p className="text-sm text-gray-600">{category.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Food/Lifestyle Preferences */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🥗 Food & Lifestyle Preferences</h2>
            
            {/* Dietary Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-3">
                {['Halal', 'Vegan', 'Vegetarian', 'Gluten-Free'].map(pref => (
                  <button
                    key={pref}
                    onClick={() => toggleSelection(pref, foodPreferences, setFoodPreferences)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      foodPreferences.includes(pref)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Level */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Budget Level</h3>
              <div className="flex space-x-4">
                {[
                  { id: 'cheap', label: '💲 Cheap', desc: 'Under RM20' },
                  { id: 'medium', label: '💲💲 Medium', desc: 'RM20-50' },
                  { id: 'premium', label: '💲💲💲 Premium', desc: 'RM50+' }
                ].map(budget => (
                  <button
                    key={budget.id}
                    onClick={() => setBudgetLevel(budget.id)}
                    className={`p-4 rounded-lg border-2 flex-1 transition-all ${
                      budgetLevel === budget.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{budget.label}</div>
                      <div className="text-sm text-gray-600">{budget.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ambience */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Ambience</h3>
              <div className="flex flex-wrap gap-3">
                {['Quiet', 'Social', 'Luxury', 'Casual'].map(amb => (
                  <button
                    key={amb}
                    onClick={() => toggleSelection(amb, ambience, setAmbience)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      ambience.includes(amb)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {amb}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Location & Distance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📍 Location & Distance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Distance */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Max Travel Distance</h3>
                <div className="space-y-2">
                  {['1km', '3km', '5km'].map(distance => (
                    <button
                      key={distance}
                      onClick={() => setMaxDistance(distance)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        maxDistance === distance
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {distance}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport Type */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Transport Type</h3>
                <div className="space-y-2">
                  {[
                    { id: 'walking', label: '🚶 Walking' },
                    { id: 'car', label: '🚗 Car' },
                    { id: 'escooter', label: '🛴 E-Scooter' }
                  ].map(transportType => (
                    <button
                      key={transportType.id}
                      onClick={() => setTransport(transportType.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        transport === transportType.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {transportType.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Time Preferences */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">⏰ Time Preferences</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'morning', label: '🌅 Morning', desc: '6AM-12PM' },
                { id: 'afternoon', label: '☀️ Afternoon', desc: '12PM-6PM' },
                { id: 'evening', label: '🌆 Evening', desc: '6PM-10PM' },
                { id: 'latenight', label: '🌙 Late Night', desc: '10PM-6AM' }
              ].map(time => (
                <button
                  key={time.id}
                  onClick={() => toggleSelection(time.id, timePreferences, setTimePreferences)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    timePreferences.includes(time.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{time.label}</div>
                    <div className="text-xs text-gray-600">{time.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Special Needs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">♿ Special Needs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'wheelchair', label: '♿ Wheelchair Accessible', icon: '♿' },
                { id: 'childfriendly', label: '👶 Child-Friendly', icon: '👶' },
                { id: 'petfriendly', label: '🐕 Pet-Friendly', icon: '🐕' },
                { id: 'parking', label: '🅿️ Parking Available', icon: '🅿️' }
              ].map(need => (
                <button
                  key={need.id}
                  onClick={() => toggleSelection(need.id, specialNeeds, setSpecialNeeds)}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                    specialNeeds.includes(need.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{need.icon}</span>
                  <span className="font-medium">{need.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. User Mood */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎭 Current Mood</h2>
            <p className="text-gray-600 mb-4">How are you feeling today? Our AI will find places that match your vibe!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'productive', label: 'I feel productive', icon: '🧑‍💻', desc: 'Ready to work and focus' },
                { id: 'relaxed', label: 'I want to relax', icon: '🌿', desc: 'Need some chill time' },
                { id: 'social', label: 'I want to socialize', icon: '🎉', desc: 'Meet people and have fun' }
              ].map(moodOption => (
                <button
                  key={moodOption.id}
                  onClick={() => setMood(moodOption.id)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    mood === moodOption.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{moodOption.icon}</div>
                    <div className="font-semibold text-gray-800">{moodOption.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{moodOption.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              🎯 Find My Perfect Spots
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}