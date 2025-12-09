import { GoogleGenerativeAI, GenerateContentResult, GenerativeModel } from '@google/generative-ai';

// Collect all API keys from environment variables
const apiKeys: string[] = [];
for (let i = 1; i <= 10; i++) {
  const key = process.env[`GEMINI_API_KEY_${i}`];
  if (key && key.trim()) {
    apiKeys.push(key.trim());
  }
}

// Fallback to single GEMINI_API_KEY for backward compatibility
if (apiKeys.length === 0 && process.env.GEMINI_API_KEY) {
  apiKeys.push(process.env.GEMINI_API_KEY.trim());
}

if (apiKeys.length === 0) {
  throw new Error('Missing GEMINI_API_KEY_1 or GEMINI_API_KEY environment variable');
}

console.log(`Gemini: Loaded ${apiKeys.length} API key(s)`);

// Track rate-limited keys and when they can be used again
const rateLimitedKeys: Map<number, number> = new Map();

// Create a model instance for each key
const models: GenerativeModel[] = apiKeys.map(key => {
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      maxOutputTokens: 32768,
      temperature: 0.7,
    },
  });
});

// Current key index for round-robin
let currentKeyIndex = 0;

/**
 * Get the next available model (skips rate-limited keys)
 */
function getNextAvailableModel(): { model: GenerativeModel; keyIndex: number } | null {
  const now = Date.now();
  const startIndex = currentKeyIndex;

  do {
    const rateLimitExpiry = rateLimitedKeys.get(currentKeyIndex);

    // Check if this key is available (not rate-limited or limit expired)
    if (!rateLimitExpiry || now >= rateLimitExpiry) {
      rateLimitedKeys.delete(currentKeyIndex);
      const model = models[currentKeyIndex];
      const keyIndex = currentKeyIndex;

      // Move to next key for next request (round-robin)
      currentKeyIndex = (currentKeyIndex + 1) % models.length;

      return { model, keyIndex };
    }

    // Try next key
    currentKeyIndex = (currentKeyIndex + 1) % models.length;
  } while (currentKeyIndex !== startIndex);

  // All keys are rate-limited, return the one that expires soonest
  let soonestExpiry = Infinity;
  let soonestIndex = 0;

  rateLimitedKeys.forEach((expiry, index) => {
    if (expiry < soonestExpiry) {
      soonestExpiry = expiry;
      soonestIndex = index;
    }
  });

  return { model: models[soonestIndex], keyIndex: soonestIndex };
}

/**
 * Mark a key as rate-limited
 */
function markKeyRateLimited(keyIndex: number, retryAfterSeconds: number) {
  const expiryTime = Date.now() + (retryAfterSeconds * 1000);
  rateLimitedKeys.set(keyIndex, expiryTime);
  console.log(`Key ${keyIndex + 1}/${models.length} rate-limited for ${retryAfterSeconds}s`);
}

// Export the first model for backward compatibility
export const gemini = models[0];

/**
 * Generate content with automatic key rotation and retry on rate limits
 */
export async function generateWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<GenerateContentResult> {
  let lastError: Error | null = null;
  const totalAttempts = maxRetries * models.length; // Try each key up to maxRetries times

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const available = getNextAvailableModel();
    if (!available) {
      throw new Error('No API keys available');
    }

    const { model, keyIndex } = available;

    try {
      console.log(`Using API key ${keyIndex + 1}/${models.length}`);
      return await model.generateContent(prompt);
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      if (error.status === 429) {
        // Extract retry delay from error if available
        const retryMatch = error.message?.match(/retry in (\d+)/i);
        const retryDelay = retryMatch ? parseInt(retryMatch[1]) : 60;

        // Mark this key as rate-limited
        markKeyRateLimited(keyIndex, retryDelay);

        // If we have more keys, try immediately with next key
        if (models.length > 1) {
          const availableKeys = models.length - rateLimitedKeys.size;
          if (availableKeys > 0) {
            console.log(`Rotating to next key (${availableKeys} keys available)...`);
            continue;
          }
        }

        // All keys rate-limited, wait for the shortest delay
        const minWait = Math.min(...Array.from(rateLimitedKeys.values())) - Date.now();
        if (minWait > 0) {
          console.log(`All keys rate-limited. Waiting ${Math.ceil(minWait / 1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, minWait));
        }
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
