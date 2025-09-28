import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { performAIAnalysis } from './ai-analysis'

// Test server function for AI analysis
const testAIAnalysis = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      console.log('🧪 Testing AI analysis functionality...')
      
      // Sample test data
      const testPreferences = {
        categories: ['food'],
        foodPreferences: ['Halal'],
        budgetLevel: 'medium',
        ambience: ['Casual'],
        maxDistance: '3km',
        transport: 'walking',
        timePreferences: ['afternoon'],
        specialNeeds: [],
        mood: 'relaxed',
        location: {
          latitude: 2.9213,
          longitude: 101.6559,
          timestamp: new Date().toISOString()
        }
      }

      const testPremiseData = [
        {
          premise_code: "25001.0",
          premise: "Starbucks Coffee Cyberjaya",
          address: "Ground Floor, Shaftsbury Square, Persiaran Multimedia, 63000 Cyberjaya",
          premise_type: "Restaurant",
          state: "Cyberjaya",
          district: "Cyberjaya",
          distance: 1.2
        },
        {
          premise_code: "25002.0", 
          premise: "The Coffee Bean & Tea Leaf",
          address: "Level 1, Dpulze Shopping Centre, Jalan Alamanda, 63000 Cyberjaya",
          premise_type: "Cafe",
          state: "Cyberjaya",
          district: "Cyberjaya",
          distance: 0.8
        },
        {
          premise_code: "25003.0",
          premise: "McDonald's Cyberjaya", 
          address: "Dpulze Shopping Centre, Jalan Alamanda, 63000 Cyberjaya",
          premise_type: "Restaurant",
          state: "Cyberjaya",
          district: "Cyberjaya",
          distance: 0.9
        }
      ]

      const response = await performAIAnalysis({
        data: {
          preferences: testPreferences,
          premiseData: testPremiseData
        }
      })

      console.log('✅ AI analysis test completed')
      console.log('Response:', {
        success: response.success,
        recommendationsCount: response.recommendations.length,
        analysisSummary: response.analysisSummary,
        error: response.error
      })

      return {
        success: true,
        message: 'AI analysis test completed successfully',
        testResults: response
      }

    } catch (error) {
      console.error('❌ AI analysis test failed:', error)
      return {
        success: false,
        message: 'AI analysis test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

export const Route = createFileRoute('/api/test-ai')({
  component: RouteComponent,
})

function RouteComponent() {
  const handleTest = async () => {
    try {
      const response = await testAIAnalysis()
      alert(`Test ${response.success ? 'passed' : 'failed'}: ${response.message}`)
    } catch (error) {
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">AI Analysis Test</h1>
        <p className="text-muted-foreground mb-6">Test the AI analysis functionality</p>
        <button
          onClick={handleTest}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Run AI Analysis Test
        </button>
        <div className="mt-6 text-sm text-muted-foreground max-w-md">
          <p>This test will:</p>
          <ul className="list-disc list-inside text-left mt-2 space-y-1">
            <li>Use sample user preferences (food, Halal, medium budget, relaxed mood)</li>
            <li>Analyze sample premise data (Starbucks, Coffee Bean, McDonald's)</li>
            <li>Call the AI analysis API</li>
            <li>Return personalized recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export { testAIAnalysis }
