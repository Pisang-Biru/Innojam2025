# AI Analysis Setup Instructions

## Environment Configuration

To enable AI-powered personalized recommendations, you need to set up your OpenAI API key.

### 1. Create Environment File

Create a `.env` file in the project root (`Innojam2025/.env`) with the following content:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (if using Prisma)
DATABASE_URL=your_database_url_here

# Development Configuration
NODE_ENV=development
```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

### 3. Install Dependencies

Run the following command to install the OpenAI package:

```bash
yarn install
```

### 4. How It Works

The AI analysis system:

1. **Takes user preferences** from the preferences page (categories, budget, mood, etc.)
2. **Analyzes premise data** from the CSV file containing Cyberjaya locations
3. **Uses OpenAI GPT-4** to intelligently match user preferences with available premises
4. **Provides personalized recommendations** with AI-generated explanations
5. **Falls back gracefully** to basic filtering if AI analysis fails

### 5. Features

- **Intelligent Matching**: AI considers all user preferences including budget, mood, transport, and special needs
- **Personalized Explanations**: Each recommendation includes AI-generated reasoning
- **Fallback System**: If AI fails, the system uses basic category filtering
- **Toggle View**: Users can switch between AI recommendations and basic listings
- **Real-time Analysis**: AI analysis happens in real-time when user submits preferences

### 6. API Endpoint

The AI analysis is handled by the `/api/ai-analysis` endpoint which:
- Accepts user preferences and premise data
- Uses OpenAI's GPT-4 model for intelligent analysis
- Returns ranked recommendations with scores and explanations
- Handles errors gracefully with fallback recommendations

### 7. Cost Considerations

- Uses OpenAI's GPT-4o-mini model (cost-effective)
- Typical cost per analysis: ~$0.001-0.005
- Rate limited to prevent excessive usage
- Fallback system ensures service availability even if API fails

## Testing the AI Analysis

1. Set up your `.env` file with the OpenAI API key
2. Start the development server: `yarn dev`
3. Go to the preferences page and select your preferences
4. Submit to see AI-powered recommendations
5. Toggle between AI and basic recommendations to compare

The AI will analyze your preferences and provide personalized spot recommendations with detailed explanations for each choice.
