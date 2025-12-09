import { GoogleGenerativeAI, GenerateContentResult, GenerativeModel } from '@google/generative-ai';

// Use single API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

console.log(`Gemini: Using API key (${apiKey.substring(0, 10)}...)`);

// Create single model instance
const genAI = new GoogleGenerativeAI(apiKey);
export const gemini = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    maxOutputTokens: 32768,
    temperature: 0.7,
  },
});

/**
 * Generate content with retry on rate limits
 */
export async function generateWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<GenerateContentResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Gemini: Starting generation (prompt length: ${prompt.length} chars)...`);
      const startTime = Date.now();

      const result = await gemini.generateContent(prompt);

      console.log(`Gemini: Generation completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      if (error.status === 429) {
        const retryMatch = error.message?.match(/retry in (\d+)/i);
        const retryDelay = retryMatch ? parseInt(retryMatch[1]) : 60;

        console.log(`Rate limited. Waiting ${retryDelay}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
