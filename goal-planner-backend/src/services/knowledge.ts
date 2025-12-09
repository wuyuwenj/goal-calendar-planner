import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { generateWithRetry } from '../lib/gemini';
import { searchAndScrapeForKnowledge } from './webScraper';

interface Resource {
  type: string;
  name: string;
  url?: string;
  usage?: string;
  chapters?: string[];
}

interface SourceReference {
  url: string;
  domain: string;
  title: string;
}

interface PeriodizationPhase {
  phase: string;
  weeks: string; // e.g., "1-4" or "1-25%"
  focus: string;
  intensity: string;
  examples: string[];
}

interface Periodization {
  type: string; // e.g., "linear", "undulating", "block", "taper"
  totalPhases: number;
  hasTaper: boolean; // whether to reduce volume before goal completion
  taperWeeks?: number; // how many weeks to taper
  phases: PeriodizationPhase[];
  notes?: string;
}

interface LevelKnowledge {
  program?: string;
  approach?: string;
  frequency?: string;
  resources: Resource[];
  weekly_structure?: Record<string, string> | Array<{ day: string; exercises: string[] }>;
  sample_tasks: string[];
  milestones?: string[];
  progression?: string;
  periodization?: Periodization; // NEW: how to structure the plan over time
  sources?: SourceReference[];
}

interface KnowledgeBase {
  category: string;
  keywords: string[];
  levels: {
    complete_beginner?: LevelKnowledge;
    some_experience?: LevelKnowledge;
    intermediate?: LevelKnowledge;
    advanced?: LevelKnowledge;
  };
  source?: 'curated' | 'web_search';
  lastUpdated?: string;
}

// Cache loaded knowledge bases
let knowledgeCache: KnowledgeBase[] | null = null;

const KNOWLEDGE_DIR = join(__dirname, '../knowledge');

/**
 * Load all knowledge base files
 */
async function loadKnowledgeBases(): Promise<KnowledgeBase[]> {
  if (knowledgeCache) return knowledgeCache;

  try {
    await mkdir(KNOWLEDGE_DIR, { recursive: true });
    const files = await readdir(KNOWLEDGE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const bases: KnowledgeBase[] = [];
    for (const file of jsonFiles) {
      try {
        const content = await readFile(join(KNOWLEDGE_DIR, file), 'utf-8');
        bases.push(JSON.parse(content));
      } catch (e) {
        console.warn(`Failed to load knowledge file ${file}:`, e);
      }
    }

    knowledgeCache = bases;
    return bases;
  } catch (error) {
    console.warn('Failed to load knowledge bases:', error);
    return [];
  }
}

/**
 * Calculate keyword match score
 */
function calculateMatchScore(goalText: string, keywords: string[]): number {
  const lowerGoal = goalText.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (lowerGoal.includes(keyword.toLowerCase())) {
      score += keyword.length;
    }
  }

  return score;
}

/**
 * Map user level to knowledge base level key
 */
function mapLevel(userLevel: string): keyof KnowledgeBase['levels'] {
  const levelMap: Record<string, keyof KnowledgeBase['levels']> = {
    'complete_beginner': 'complete_beginner',
    'some_experience': 'some_experience',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
  };
  return levelMap[userLevel] || 'complete_beginner';
}

export interface RetrievedContext {
  found: boolean;
  source?: 'local' | 'web_search';
  category?: string;
  levelKnowledge?: LevelKnowledge;
  formattedContext?: string;
}

/**
 * Search the web for expert information about a goal
 * First tries actual web scraping, then falls back to Gemini's knowledge
 */
async function searchWebForExpertInfo(
  goalTitle: string,
  goalDescription: string | undefined,
  currentLevel: string
): Promise<KnowledgeBase | null> {
  console.log(`RAG: Searching web for expert info on "${goalTitle}"...`);

  const category = extractCategory(goalTitle);

  // Step 1: Try actual web scraping (if Brave Search API is configured or using curated sources)
  try {
    const scrapedKnowledge = await searchAndScrapeForKnowledge(
      goalTitle,
      goalDescription,
      currentLevel,
      category
    );

    if (scrapedKnowledge && scrapedKnowledge.sample_tasks?.length > 0) {
      console.log('RAG: Successfully extracted knowledge from web scraping');

      const levelKey = mapLevel(currentLevel);
      const knowledgeBase: KnowledgeBase = {
        category: scrapedKnowledge.category || category,
        keywords: scrapedKnowledge.keywords || extractKeywords(goalTitle, goalDescription),
        levels: {
          [levelKey]: {
            approach: scrapedKnowledge.approach,
            frequency: scrapedKnowledge.frequency,
            resources: scrapedKnowledge.resources || [],
            weekly_structure: scrapedKnowledge.weekly_structure,
            sample_tasks: scrapedKnowledge.sample_tasks || [],
            milestones: scrapedKnowledge.milestones || [],
            sources: scrapedKnowledge.sources || [],
          },
        },
        source: 'web_search',
        lastUpdated: new Date().toISOString(),
      };

      return knowledgeBase;
    }
  } catch (error) {
    console.warn('RAG: Web scraping failed, falling back to Gemini:', error);
  }

  // Step 2: Fall back to Gemini's training knowledge
  console.log('RAG: Falling back to Gemini knowledge generation...');

  const levelText = currentLevel.replace('_', ' ');
  const searchContext = `${goalTitle} ${goalDescription || ''}`;

  // Use Gemini to generate expert information from its training data
  const searchPrompt = `You are a research assistant. Compile expert information about learning/achieving this goal:

**Goal:** ${goalTitle}
${goalDescription ? `**Details:** ${goalDescription}` : ''}
**User Level:** ${levelText}

Research and provide:
1. The most recommended approach/program for ${levelText}s
2. Top 3-5 specific resources (books, apps, YouTube channels, courses) - use NAMES only, NO URLs
3. A typical weekly structure or practice routine
4. 5 example tasks that are VERY specific (include exact exercises, page numbers, lesson numbers, etc.)
5. Key milestones for the first 4-12 weeks
6. Important keywords related to this goal
7. **PERIODIZATION**: How should training/practice intensity change over time? Include:
   - Does this goal need a taper/rest period before completion? (e.g., marathon YES, language learning NO)
   - What are the distinct phases? (e.g., base building → development → peak → taper)
   - How should intensity/volume progress in each phase?

**CRITICAL: DO NOT INCLUDE ANY URLs. Only use resource names.**

Respond in this exact JSON format:
{
  "category": "short category name like 'fitness' or 'language' or 'music'",
  "keywords": ["keyword1", "keyword2", "keyword3", "at least 5-10 relevant keywords"],
  "approach": "recommended approach or program name",
  "frequency": "recommended practice frequency",
  "resources": [
    {"type": "book|app|youtube|course", "name": "exact name (NO URL)", "usage": "how to use it"}
  ],
  "weekly_structure": {
    "aspect1": "what to do",
    "aspect2": "what to do"
  },
  "sample_tasks": [
    "Very specific task with exact details - NO URLs, just describe what to search for",
    "Example: Search YouTube for 'beginner yoga flow 20 minutes' instead of a fake URL"
  ],
  "milestones": [
    "Week 4: expected achievement",
    "Week 8: expected achievement"
  ],
  "periodization": {
    "type": "linear|undulating|block|continuous",
    "hasTaper": true or false,
    "taperWeeks": 2,
    "notes": "Brief explanation of why this periodization works for this goal",
    "phases": [
      {
        "phase": "Phase name (e.g., Base Building, Peak, Taper)",
        "weeks": "1-25% or specific week range",
        "focus": "What to focus on in this phase",
        "intensity": "Low/Moderate/High/Reduced",
        "examples": ["Example task for this phase", "Another example"]
      }
    ]
  }
}

IMPORTANT:
- Only include REAL, well-known resources by NAME
- NEVER make up URLs - they will be hallucinated and broken
- For YouTube, say "Search YouTube for 'X'" or just mention the channel name
- For apps, just use the app name like "Duolingo" or "Headspace"
- For periodization: endurance events (marathon, triathlon) need taper; skill learning (language, music) usually don't`;

  try {
    const result = await generateWithRetry(searchPrompt);
    const text = result.response.text();

    if (!text) return null;

    // Extract JSON from response
    let jsonString = text;
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    const searchResult = JSON.parse(jsonString.trim());

    // Convert to KnowledgeBase format
    const levelKey = mapLevel(currentLevel);
    const knowledgeBase: KnowledgeBase = {
      category: searchResult.category || extractCategory(goalTitle),
      keywords: searchResult.keywords || extractKeywords(goalTitle, goalDescription),
      levels: {
        [levelKey]: {
          approach: searchResult.approach,
          frequency: searchResult.frequency,
          resources: searchResult.resources || [],
          weekly_structure: searchResult.weekly_structure,
          sample_tasks: searchResult.sample_tasks || [],
          milestones: searchResult.milestones || [],
          periodization: searchResult.periodization, // Include periodization
        },
      },
      source: 'web_search',
      lastUpdated: new Date().toISOString(),
    };

    return knowledgeBase;
  } catch (error) {
    console.error('Failed to search web for expert info:', error);
    return null;
  }
}

/**
 * Extract a category from the goal title
 */
function extractCategory(goalTitle: string): string {
  const lower = goalTitle.toLowerCase();

  if (lower.match(/gym|workout|fitness|muscle|strength|weight|run|exercise/)) return 'fitness';
  if (lower.match(/spanish|french|german|japanese|chinese|korean|language|speak/)) return 'language';
  if (lower.match(/piano|guitar|music|instrument|sing/)) return 'music';
  if (lower.match(/code|programming|developer|software|web|app/)) return 'programming';
  if (lower.match(/cook|recipe|baking|culinary/)) return 'cooking';
  if (lower.match(/draw|paint|art|design|sketch/)) return 'art';
  if (lower.match(/write|writing|author|novel|blog/)) return 'writing';
  if (lower.match(/photo|camera|photography/)) return 'photography';

  return 'general';
}

/**
 * Extract keywords from goal
 */
function extractKeywords(goalTitle: string, goalDescription?: string): string[] {
  const text = `${goalTitle} ${goalDescription || ''}`.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 3);
  return [...new Set(words)].slice(0, 10);
}

/**
 * Generate a consistent filename from keywords
 */
function generateFilename(kb: KnowledgeBase): string {
  // Use first 2-3 distinctive keywords to create filename
  const keywords = kb.keywords
    .filter(k => k.length > 3)
    .slice(0, 3)
    .map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .join('-');

  return `${kb.category.toLowerCase()}-${keywords || 'general'}.json`;
}

/**
 * Check if a similar knowledge base already exists
 */
async function findExistingKnowledgeFile(kb: KnowledgeBase): Promise<string | null> {
  try {
    const files = await readdir(KNOWLEDGE_DIR);

    // Check for exact filename match
    const expectedFilename = generateFilename(kb);
    if (files.includes(expectedFilename)) {
      return expectedFilename;
    }

    // Check for same category with significant keyword overlap
    for (const file of files.filter(f => f.endsWith('.json'))) {
      if (file.startsWith(kb.category.toLowerCase())) {
        try {
          const content = await readFile(join(KNOWLEDGE_DIR, file), 'utf-8');
          const existing = JSON.parse(content) as KnowledgeBase;

          // Check keyword overlap
          const existingKeywords = new Set(existing.keywords.map(k => k.toLowerCase()));
          const newKeywords = kb.keywords.map(k => k.toLowerCase());
          const overlap = newKeywords.filter(k => existingKeywords.has(k)).length;

          // If more than 50% overlap, consider it a match
          if (overlap >= Math.min(3, newKeywords.length * 0.5)) {
            return file;
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Save a knowledge base to file for future use
 * Avoids duplicates by checking for existing similar knowledge
 */
async function saveKnowledgeBase(kb: KnowledgeBase): Promise<void> {
  try {
    await mkdir(KNOWLEDGE_DIR, { recursive: true });

    // Check if similar knowledge already exists
    const existingFile = await findExistingKnowledgeFile(kb);
    if (existingFile) {
      console.log(`RAG: Similar knowledge already exists in ${existingFile}, skipping save`);
      return;
    }

    const filename = generateFilename(kb);
    const filepath = join(KNOWLEDGE_DIR, filename);

    await writeFile(filepath, JSON.stringify(kb, null, 2));
    console.log(`RAG: Saved new knowledge base to ${filename}`);

    // Clear cache so it reloads with new file
    knowledgeCache = null;
  } catch (error) {
    console.error('Failed to save knowledge base:', error);
  }
}

/**
 * Retrieve relevant knowledge for a goal
 * First checks local knowledge base, then falls back to web search
 */
export async function retrieveGoalContext(
  goalTitle: string,
  goalDescription: string | undefined,
  currentLevel: string
): Promise<RetrievedContext> {
  const bases = await loadKnowledgeBases();
  const searchText = `${goalTitle} ${goalDescription || ''}`;

  // Step 1: Try to find in local knowledge base
  let bestMatch: KnowledgeBase | null = null;
  let bestScore = 0;

  for (const base of bases) {
    const score = calculateMatchScore(searchText, base.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = base;
    }
  }

  // If we have a good local match, use it
  const MIN_MATCH_SCORE = 5;
  if (bestMatch && bestScore >= MIN_MATCH_SCORE) {
    const levelKey = mapLevel(currentLevel);
    const levelKnowledge = bestMatch.levels[levelKey] || bestMatch.levels.complete_beginner;

    if (levelKnowledge) {
      console.log(`RAG: Found local knowledge for "${bestMatch.category}" (score: ${bestScore})`);
      return {
        found: true,
        source: 'local',
        category: bestMatch.category,
        levelKnowledge,
        formattedContext: formatContextForLLM(bestMatch.category, levelKnowledge),
      };
    }
  }

  // Step 2: No good local match - search the web
  console.log(`RAG: No local match (best score: ${bestScore}), searching web...`);
  const webKnowledge = await searchWebForExpertInfo(goalTitle, goalDescription, currentLevel);

  if (webKnowledge) {
    const levelKey = mapLevel(currentLevel);
    const levelKnowledge = webKnowledge.levels[levelKey];

    if (levelKnowledge) {
      // Save for future use (async, don't wait)
      saveKnowledgeBase(webKnowledge).catch(console.error);

      console.log(`RAG: Found web knowledge for "${webKnowledge.category}"`);
      return {
        found: true,
        source: 'web_search',
        category: webKnowledge.category,
        levelKnowledge,
        formattedContext: formatContextForLLM(webKnowledge.category, levelKnowledge),
      };
    }
  }

  console.log('RAG: No knowledge found from any source');
  return { found: false };
}

/**
 * Format retrieved knowledge into a context string for the LLM
 */
function formatContextForLLM(category: string, knowledge: LevelKnowledge): string {
  const sections: string[] = [];

  sections.push(`**Expert Knowledge Retrieved for ${category.toUpperCase()} goals:**`);

  if (knowledge.program || knowledge.approach) {
    sections.push(`\n**Recommended Approach:** ${knowledge.program || knowledge.approach}`);
  }

  if (knowledge.frequency) {
    sections.push(`**Recommended Frequency:** ${knowledge.frequency}`);
  }

  if (knowledge.resources && knowledge.resources.length > 0) {
    sections.push('\n**Verified Resources (USE THESE):**');
    for (const resource of knowledge.resources) {
      let resourceStr = `- ${resource.type.toUpperCase()}: "${resource.name}"`;
      if (resource.url) resourceStr += ` (${resource.url})`;
      if (resource.usage) resourceStr += ` - ${resource.usage}`;
      if (resource.chapters) resourceStr += ` - Focus on: ${resource.chapters.join(', ')}`;
      sections.push(resourceStr);
    }
  }

  if (knowledge.weekly_structure) {
    sections.push('\n**Weekly Structure:**');
    if (Array.isArray(knowledge.weekly_structure)) {
      for (const day of knowledge.weekly_structure) {
        sections.push(`- ${day.day}: ${day.exercises.join(', ')}`);
      }
    } else {
      for (const [key, value] of Object.entries(knowledge.weekly_structure)) {
        sections.push(`- ${key}: ${value}`);
      }
    }
  }

  if (knowledge.sample_tasks && knowledge.sample_tasks.length > 0) {
    sections.push('\n**Example Tasks (use as templates for specificity):**');
    for (const task of knowledge.sample_tasks.slice(0, 5)) {
      sections.push(`- "${task}"`);
    }
  }

  if (knowledge.milestones && knowledge.milestones.length > 0) {
    sections.push('\n**Expected Milestones:**');
    for (const milestone of knowledge.milestones) {
      sections.push(`- ${milestone}`);
    }
  }

  if (knowledge.progression) {
    sections.push(`\n**Progression:** ${knowledge.progression}`);
  }

  // Add periodization info - this is critical for proper plan structure
  if (knowledge.periodization) {
    const p = knowledge.periodization;
    sections.push('\n**PERIODIZATION (MUST FOLLOW THIS STRUCTURE):**');
    sections.push(`- Type: ${p.type}`);
    sections.push(`- Needs taper before goal completion: ${p.hasTaper ? 'YES' : 'NO'}`);
    if (p.hasTaper && p.taperWeeks) {
      sections.push(`- Taper duration: ${p.taperWeeks} weeks before goal date`);
    }
    if (p.notes) {
      sections.push(`- Note: ${p.notes}`);
    }

    if (p.phases && p.phases.length > 0) {
      sections.push('\n**PHASES (apply these to the plan):**');
      for (const phase of p.phases) {
        sections.push(`\n${phase.phase} (Weeks ${phase.weeks}):`);
        sections.push(`  - Focus: ${phase.focus}`);
        sections.push(`  - Intensity: ${phase.intensity}`);
        if (phase.examples && phase.examples.length > 0) {
          sections.push(`  - Example tasks: ${phase.examples.join('; ')}`);
        }
      }
    }
  }

  if (knowledge.sources && knowledge.sources.length > 0) {
    sections.push('\n**Source References (for verification):**');
    for (const source of knowledge.sources) {
      sections.push(`- ${source.title} (${source.domain}): ${source.url}`);
    }
  }

  return sections.join('\n');
}

/**
 * Clear the knowledge cache
 */
export function clearKnowledgeCache(): void {
  knowledgeCache = null;
}
