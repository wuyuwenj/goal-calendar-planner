import { GoogleGenerativeAI, GenerateContentResult, GenerativeModel } from '@google/generative-ai';

// Use single API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

console.log(`Gemini: Using API key (${apiKey.substring(0, 10)}...)`);

// Model rotation configuration
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

// Track current model index for round-robin rotation
let currentModelIndex = 0;

const genAI = new GoogleGenerativeAI(apiKey);

// Create model instances for each model
const modelInstances: Map<string, GenerativeModel> = new Map();
MODELS.forEach((modelName) => {
  modelInstances.set(
    modelName,
    genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 32768,
        temperature: 0.7,
      },
    })
  );
});

/**
 * Get the next model in rotation
 */
function getNextModel(): { model: GenerativeModel; name: string } {
  const modelName = MODELS[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % MODELS.length;
  return {
    model: modelInstances.get(modelName)!,
    name: modelName,
  };
}

/**
 * Get a specific model by index offset from current
 */
function getModelByOffset(offset: number): { model: GenerativeModel; name: string } {
  const index = (currentModelIndex + offset) % MODELS.length;
  const modelName = MODELS[index];
  return {
    model: modelInstances.get(modelName)!,
    name: modelName,
  };
}

// Export default model for backward compatibility
export const gemini = modelInstances.get(MODELS[0])!;

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
 * Check if error is a rate limit error
 */
function isRateLimitError(error: any): boolean {
  if (error.status === 429) return true;
  const message = error.message?.toLowerCase() || '';
  return message.includes('rate') || message.includes('quota') || message.includes('resource exhausted');
}

/**
 * Generate content with model rotation and retry on rate limits
 * - Uses round-robin rotation across models
 * - Falls back to next model on rate limit
 * - Retries transient errors with exponential backoff
 */
export async function generateWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<GenerateContentResult> {
  let lastError: Error | null = null;
  const modelsTriedThisRequest = new Set<string>();

  // Get starting model (round-robin)
  let { model: currentModel, name: currentModelName } = getNextModel();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Gemini [${currentModelName}]: Starting generation (prompt: ${prompt.length} chars)${attempt > 0 ? ` [attempt ${attempt + 1}/${maxRetries}]` : ''}...`);
      const startTime = Date.now();

      const result = await currentModel.generateContent(prompt);

      console.log(`Gemini [${currentModelName}]: Completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini [${currentModelName}]: Error on attempt ${attempt + 1}:`, error.message || error);

      modelsTriedThisRequest.add(currentModelName);

      // On rate limit, try the next model if available
      if (isRateLimitError(error)) {
        // Find a model we haven't tried yet
        let foundNewModel = false;
        for (let i = 0; i < MODELS.length; i++) {
          const { model, name } = getModelByOffset(i);
          if (!modelsTriedThisRequest.has(name)) {
            console.log(`Gemini: Rate limited on ${currentModelName}, switching to ${name}...`);
            currentModel = model;
            currentModelName = name;
            foundNewModel = true;
            break;
          }
        }

        if (foundNewModel) {
          // Small delay before trying next model
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // All models rate limited - wait and retry with first model
        console.log(`Gemini: All models rate limited, waiting before retry...`);
        const retryDelay = Math.pow(2, attempt) * 10; // 10s, 20s, 40s...
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
        modelsTriedThisRequest.clear();
        const next = getNextModel();
        currentModel = next.model;
        currentModelName = next.name;
        continue;
      }

      // Check if it's a transient error we should retry
      if (isTransientError(error) && attempt < maxRetries - 1) {
        const retryDelay = Math.pow(2, attempt) * 5; // 5s, 10s, 20s...
        console.log(`Gemini [${currentModelName}]: Transient error, retrying in ${retryDelay}s...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
        continue;
      }

      // For non-transient errors or final attempt, throw
      throw error;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
