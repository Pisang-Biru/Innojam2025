import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Hero Content */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Perfect Spot in 
              <span className="text-blue-600 block mt-2">Cyberjaya</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover amazing places that match your preferences, mood, and lifestyle in Malaysia's tech hub.
            </p>
            
            {/* Search/Discover Button */}
            <Link 
              to="/preferences"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🔍 Discover Your Spot
            </Link>
          </div>

          {/* Quick Demo Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Trending in Cyberjaya</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Restaurant Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🍽️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Restaurants</h3>
                <p className="text-gray-600 text-sm">From local delights to international cuisine</p>
              </div>

              {/* Gym Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">💪</div>
                <h3 className="font-semibold text-gray-800 mb-2">Fitness Centers</h3>
                <p className="text-gray-600 text-sm">Stay fit with modern gym facilities</p>
              </div>

              {/* Cafe Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">☕</div>
                <h3 className="font-semibold text-gray-800 mb-2">Cafes</h3>
                <p className="text-gray-600 text-sm">Perfect spots for work and relaxation</p>
              </div>

              {/* Coworking Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">🧑‍💻</div>
                <h3 className="font-semibold text-gray-800 mb-2">Coworking</h3>
                <p className="text-gray-600 text-sm">Productive spaces for remote work</p>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Personalized</h3>
                <p className="text-gray-600">Recommendations based on your preferences and mood</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="font-semibold text-gray-800 mb-2">Location-Smart</h3>
                <p className="text-gray-600">Find places within your preferred distance and transport</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
                <p className="text-gray-600">Smart suggestions that understand your current mood</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
