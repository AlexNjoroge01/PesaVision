import { createGroq } from '@ai-sdk/groq'

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Model configurations
// Updated from deprecated llama3-70b-8192 to llama-3.3-70b-versatile
export const ANALYSIS_MODEL = 'llama-3.3-70b-versatile'
export const CHAT_MODEL = 'llama-3.1-8b-instant'

// Default max tokens for analysis
export const MAX_TOKENS = 8000
