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
 * Check if an error is a transient network error that should be retried
 */
function isTransientError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';

  // Network errors
  if (message.includes('fetch failed')) return true;
  if (message.includes('network')) return true;
  if (message.includes('econnreset')) return true;
  if (message.includes('etimedout')) return true;
  if (message.includes('enotfound')) return true;
  if (message.includes('socket hang up')) return true;

  // Error codes
  if (code === 'econnreset') return true;
  if (code === 'etimedout') return true;
  if (code === 'enotfound') return true;

  // HTTP status codes that are retryable
  if (error.status === 429) return true; // Rate limit
  if (error.status === 500) return true; // Server error
  if (error.status === 502) return true; // Bad gateway
  if (error.status === 503) return true; // Service unavailable
  if (error.status === 504) return true; // Gateway timeout

  return false;
}

/**
 * Generate content with retry on rate limits and transient errors
 */
export async function generateWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<GenerateContentResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Gemini: Starting generation (prompt length: ${prompt.length} chars)${attempt > 0 ? ` [attempt ${attempt + 1}/${maxRetries}]` : ''}...`);
      const startTime = Date.now();

      const result = await gemini.generateContent(prompt);

      console.log(`Gemini: Generation completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini: Error on attempt ${attempt + 1}:`, error.message || error);

      // Check if it's a transient error we should retry
      if (isTransientError(error) && attempt < maxRetries - 1) {
        // Calculate retry delay with exponential backoff
        let retryDelay = Math.pow(2, attempt) * 5; // 5s, 10s, 20s...

        // For rate limits, use the suggested delay if available
        if (error.status === 429) {
          const retryMatch = error.message?.match(/retry in (\d+)/i);
          if (retryMatch) {
            retryDelay = parseInt(retryMatch[1]);
          }
        }

        console.log(`Gemini: Transient error, retrying in ${retryDelay}s...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
        continue;
      }

      // For non-transient errors or final attempt, throw
      throw error;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
