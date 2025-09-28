import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import OpenAI from 'openai'
import { z } from 'zod'

// Request schema for validation
const AIAnalysisRequestSchema = z.object({
  preferences: z.object({
    categories: z.array(z.string()),
    foodPreferences: z.array(z.string()),
    budgetLevel: z.string(),
    ambience: z.array(z.string()),
    maxDistance: z.string(),
    transport: z.string(),
    timePreferences: z.array(z.string()),
    specialNeeds: z.array(z.string()),
    mood: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      timestamp: z.string()
    })
  }),
  premiseData: z.array(z.object({
    premise_code: z.string(),
    premise: z.string(),
    address: z.string(),
    premise_type: z.string(),
    state: z.string(),
    district: z.string(),
    distance: z.number().optional()
  }))
})

type AIAnalysisRequest = z.infer<typeof AIAnalysisRequestSchema>

interface RecommendedSpot {
  premise_code: string
  premise: string
  address: string
  premise_type: string
  distance?: number
  aiScore: number
  aiReason: string
  personalizedNote: string
}

interface AIAnalysisResponse {
  success: boolean
  recommendations: RecommendedSpot[]
  totalAnalyzed: number
  analysisSummary: string
  error?: string
}

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({ apiKey })
}

// Server function to perform AI analysis
const performAIAnalysis = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    try {
      return AIAnalysisRequestSchema.parse(data)
    } catch (error) {
      console.error('Validation error:', error)
      throw new Error('Invalid request data')
    }
  })
  .handler(async ({ data }: { data: AIAnalysisRequest }) => {
    try {
      console.log('🤖 Starting AI analysis for user preferences...')
      console.log('📊 Analyzing', data.premiseData.length, 'premises')
      console.log('🎯 User categories:', data.preferences.categories)
      console.log('💰 Budget level:', data.preferences.budgetLevel)
      console.log('🚗 Transport:', data.preferences.transport)
      console.log('😊 Mood:', data.preferences.mood)

      const openai = getOpenAIClient()

      // Create a comprehensive prompt for the AI
      const systemPrompt = `You are an AI assistant specialized in personalized location recommendations for Cyberjaya, Malaysia. Your task is to analyze user preferences and recommend the best spots from the available premise data.

IMPORTANT GUIDELINES:
1. Consider ALL user preferences: categories, budget, ambience, transport, mood, special needs, and time preferences
2. Prioritize spots that match the user's selected categories (food, retail, services, lifestyle)
3. Consider distance and transport method - closer spots are better for walking, further spots are okay for car/e-scooter
4. Match budget level with appropriate premise types
5. Consider mood - productive mood might prefer coworking spaces, relaxed mood might prefer parks/cafes
6. Account for special needs like wheelchair accessibility, child-friendly, pet-friendly, parking
7. Consider time preferences for operating hours
8. For food preferences like Halal, Vegan, etc., only recommend appropriate restaurants
9. Provide personalized reasoning for each recommendation
10. Score each recommendation from 1-100 based on how well it matches user preferences

CATEGORY MAPPING:
- Food & Beverages: Restaurant, Cafe, Pasar Basah, Restoran
- Retail: Hypermarket, Pasar Raya / Supermarket, Pasar Mini, Kedai Runcit
- Services: Pharmacy, Gym, Salon, Clinic, Services
- Lifestyle: Coworking Space, Entertainment, Park

BUDGET MAPPING:
- Budget (Under RM20): Pasar Mini, Kedai Runcit, some Cafes
- Medium (RM20-50): Most Restaurants, Pasar Raya / Supermarket
- Premium (RM50+): High-end Restaurants, Hypermarket, Luxury services

Return your response as a JSON object with this exact structure:
{
  "recommendations": [
    {
      "premise_code": "string",
      "premise": "string", 
      "address": "string",
      "premise_type": "string",
      "distance": number,
      "aiScore": number,
      "aiReason": "string",
      "personalizedNote": "string"
    }
  ],
  "analysisSummary": "string"
}

Return the top 10 best matches, sorted by AI score (highest first).`

      const userPrompt = `USER PREFERENCES:
- Categories: ${data.preferences.categories.join(', ') || 'None selected'}
- Food Preferences: ${data.preferences.foodPreferences.join(', ') || 'None'}
- Budget Level: ${data.preferences.budgetLevel || 'Not specified'}
- Ambience: ${data.preferences.ambience.join(', ') || 'None'}
- Max Distance: ${data.preferences.maxDistance || 'Not specified'}
- Transport: ${data.preferences.transport || 'Not specified'}
- Time Preferences: ${data.preferences.timePreferences.join(', ') || 'None'}
- Special Needs: ${data.preferences.specialNeeds.join(', ') || 'None'}
- Current Mood: ${data.preferences.mood || 'Not specified'}
- Location: ${data.preferences.location.latitude}, ${data.preferences.location.longitude}

AVAILABLE PREMISES (${data.premiseData.length} total):
${data.premiseData.map(premise => 
  `- ${premise.premise} (${premise.premise_type}) - ${premise.address}${premise.distance ? ` - ${premise.distance.toFixed(1)}km away` : ''}`
).join('\n')}

Please analyze these premises and provide personalized recommendations based on the user's preferences.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })

      const aiResponse = completion.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('No response from OpenAI')
      }

      console.log('🤖 AI Response received:', aiResponse.substring(0, 200) + '...')

      // Parse the AI response
      let parsedResponse
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in AI response')
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        console.log('Raw AI response:', aiResponse)
        throw new Error('Failed to parse AI analysis response')
      }

      const recommendations: RecommendedSpot[] = parsedResponse.recommendations || []
      const analysisSummary: string = parsedResponse.analysisSummary || 'AI analysis completed'

      console.log(`✅ AI analysis completed: ${recommendations.length} recommendations generated`)

      return {
        success: true,
        recommendations,
        totalAnalyzed: data.premiseData.length,
        analysisSummary
      } as AIAnalysisResponse

    } catch (error) {
      console.error('❌ AI analysis failed:', error)
      
      // Return fallback recommendations based on simple filtering
      const fallbackRecommendations = getFallbackRecommendations(data.preferences, data.premiseData)
      
      return {
        success: false,
        recommendations: fallbackRecommendations,
        totalAnalyzed: data.premiseData.length,
        analysisSummary: 'AI analysis unavailable - showing basic recommendations',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as AIAnalysisResponse
    }
  })

// Fallback function for when AI analysis fails
const getFallbackRecommendations = (preferences: any, premiseData: any[]): RecommendedSpot[] => {
  console.log('🔄 Using fallback recommendations...')
  
  let filtered = [...premiseData]
  
  // Simple category filtering
  const categoryMapping: { [key: string]: string[] } = {
    'food': ['Restaurant', 'Cafe', 'Pasar Basah', 'Restoran'],
    'retail': ['Hypermarket', 'Pasar Raya / Supermarket', 'Pasar Mini', 'Kedai Runcit'],
    'services': ['Pharmacy', 'Gym', 'Salon', 'Clinic', 'Services'],
    'lifestyle': ['Coworking Space', 'Entertainment', 'Park']
  }

  if (preferences.categories.length > 0) {
    filtered = premiseData.filter(premise => {
      return preferences.categories.some((category: string) => {
        const mappedTypes = categoryMapping[category.toLowerCase()] || []
        return mappedTypes.some(type => 
          premise.premise_type.toLowerCase().includes(type.toLowerCase())
        )
      })
    })
  }

  // Sort by distance if available
  filtered.sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    return 0
  })

  // Take top 10 and add fallback scores
  return filtered.slice(0, 10).map((premise, index) => ({
    premise_code: premise.premise_code,
    premise: premise.premise,
    address: premise.address,
    premise_type: premise.premise_type,
    distance: premise.distance,
    aiScore: Math.max(60, 90 - (index * 3)), // Decreasing scores
    aiReason: `Matches your selected categories and is within your preferred distance`,
    personalizedNote: `This ${premise.premise_type.toLowerCase()} is a good match for your preferences.`
  }))
}

export const Route = createFileRoute('/api/ai-analysis')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">AI Analysis API</h1>
        <p className="text-muted-foreground">This endpoint provides AI-powered personalized recommendations</p>
      </div>
    </div>
  )
}

// Export the server function for use in other components
export { performAIAnalysis }
