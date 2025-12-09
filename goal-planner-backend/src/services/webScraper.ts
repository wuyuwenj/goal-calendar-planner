import * as cheerio from 'cheerio';
import { generateWithRetry } from '../lib/gemini';

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  domain: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Trusted domains for different categories
const TRUSTED_DOMAINS: Record<string, string[]> = {
  fitness: [
    'reddit.com/r/fitness',
    'reddit.com/r/running',
    'runnersworld.com',
    'bodybuilding.com',
    'stronglifts.com',
    'nerdfitness.com',
  ],
  language: [
    'reddit.com/r/languagelearning',
    'fluentin3months.com',
    'refold.la',
    'tofugu.com',
  ],
  music: [
    'reddit.com/r/piano',
    'reddit.com/r/guitar',
    'musictheory.net',
    'justinguitar.com',
  ],
  programming: [
    'reddit.com/r/learnprogramming',
    'freecodecamp.org',
    'theodinproject.com',
  ],
  general: [
    'reddit.com',
    'wikihow.com',
  ],
};

/**
 * Search for relevant URLs using Brave Search API (if configured)
 * Falls back to curated sources if no API key
 */
export async function searchForUrls(
  query: string,
  category: string,
  limit: number = 3
): Promise<SearchResult[]> {
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (braveApiKey) {
    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`,
        {
          headers: {
            'X-Subscription-Token': braveApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json() as { web?: { results?: Array<{ title: string; url: string; description: string }> } };
        return (data.web?.results || []).map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.description,
        }));
      }
    } catch (error) {
      console.warn('Brave Search API failed:', error);
    }
  }

  // Fallback: Use curated domains to construct search-like results
  const domains = TRUSTED_DOMAINS[category] || TRUSTED_DOMAINS.general;
  return domains.slice(0, limit).map((domain) => ({
    title: `${query} guide`,
    url: `https://www.google.com/search?q=site:${domain}+${encodeURIComponent(query)}`,
    snippet: `Search ${domain} for ${query}`,
  }));
}

/**
 * Fetch and parse content from a URL
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoalPlannerBot/1.0; +https://github.com/goal-planner)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer, ads
    $('script, style, nav, footer, aside, .ad, .advertisement, .sidebar').remove();

    // Extract title
    const title = $('title').text().trim() ||
                  $('h1').first().text().trim() ||
                  'Untitled';

    // Extract main content (try common selectors)
    let content = '';
    const contentSelectors = [
      'article',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '#content',
      '.content',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback to body text
    if (!content) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').substring(0, 15000);

    const domain = new URL(url).hostname;

    return {
      url,
      title,
      content,
      domain,
    };
  } catch (error) {
    console.warn(`Failed to scrape ${url}:`, error);
    return null;
  }
}

/**
 * Extract structured knowledge from scraped content using AI
 */
export async function extractKnowledgeFromContent(
  scrapedContent: ScrapedContent[],
  goalTitle: string,
  currentLevel: string
): Promise<any | null> {
  if (scrapedContent.length === 0) {
    return null;
  }

  const contentSummary = scrapedContent
    .map((c) => `--- From ${c.domain} (${c.title}) ---\n${c.content.substring(0, 5000)}`)
    .join('\n\n');

  const prompt = `You are analyzing web content to extract expert knowledge about achieving a goal.

**Goal:** ${goalTitle}
**User Level:** ${currentLevel.replace('_', ' ')}

**Scraped Web Content:**
${contentSummary}

Based on this real web content, extract structured knowledge in this JSON format:
{
  "category": "short category name",
  "keywords": ["keyword1", "keyword2", "at least 5-10 relevant keywords"],
  "approach": "recommended approach or program mentioned in the content",
  "frequency": "recommended practice frequency mentioned",
  "resources": [
    {"type": "book|app|youtube|course|website", "name": "exact name from content", "usage": "how to use it"}
  ],
  "weekly_structure": {
    "aspect1": "what to do",
    "aspect2": "what to do"
  },
  "sample_tasks": [
    "Very specific task with exact details mentioned in the content",
    "Another specific task"
  ],
  "milestones": [
    "Week 4: expected achievement",
    "Week 8: expected achievement"
  ],
  "sources": [
    {"url": "original URL", "domain": "domain name", "title": "page title"}
  ]
}

IMPORTANT:
- Only include information that is actually in the scraped content
- Include the source URLs in the "sources" field
- Be specific - use exact names, numbers, and details from the content
- If the content doesn't have enough relevant info, return null`;

  try {
    const result = await generateWithRetry(prompt);
    const text = result.response.text();

    if (!text) return null;

    let jsonString = text;
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error('Failed to extract knowledge from content:', error);
    return null;
  }
}

/**
 * Main function: Search, scrape, and extract knowledge
 */
export async function searchAndScrapeForKnowledge(
  goalTitle: string,
  goalDescription: string | undefined,
  currentLevel: string,
  category: string
): Promise<any | null> {
  console.log(`WebScraper: Searching for "${goalTitle}"...`);

  // Build search query
  const levelText = currentLevel.replace('_', ' ');
  const searchQuery = `${goalTitle} ${levelText} beginner guide training plan`;

  // Search for URLs
  const searchResults = await searchForUrls(searchQuery, category, 3);
  console.log(`WebScraper: Found ${searchResults.length} search results`);

  if (searchResults.length === 0) {
    return null;
  }

  // Scrape content from URLs
  const scrapedContent: ScrapedContent[] = [];

  for (const result of searchResults) {
    // Skip Google search redirects
    if (result.url.includes('google.com/search')) {
      continue;
    }

    const content = await scrapeUrl(result.url);
    if (content && content.content.length > 500) {
      scrapedContent.push(content);
      console.log(`WebScraper: Scraped ${content.domain} (${content.content.length} chars)`);
    }

    // Limit to 2 successful scrapes to avoid rate limits
    if (scrapedContent.length >= 2) break;
  }

  if (scrapedContent.length === 0) {
    console.log('WebScraper: No content could be scraped');
    return null;
  }

  // Extract structured knowledge
  const knowledge = await extractKnowledgeFromContent(
    scrapedContent,
    goalTitle,
    currentLevel
  );

  if (knowledge) {
    console.log(`WebScraper: Extracted knowledge with ${knowledge.sample_tasks?.length || 0} sample tasks`);
  }

  return knowledge;
}
