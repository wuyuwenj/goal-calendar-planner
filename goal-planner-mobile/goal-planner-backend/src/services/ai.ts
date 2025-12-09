import { generateWithRetry } from '../lib/gemini';
import { GeneratedPlan, CreateGoalInput } from '../types';
import { differenceInWeeks } from 'date-fns';
import { getDayName } from '../utils/time';
import { retrieveGoalContext } from './knowledge';

const SYSTEM_PROMPT = `You are an elite performance coach and goal planning expert. Your job is to create hyper-specific, actionable weekly plans that leave ZERO ambiguity about what the user should do.

CRITICAL RULES FOR TASK SPECIFICITY:
1. Every task title must include EXACT details: specific exercises, page numbers, chapter names, quantities, reps, sets, or measurable outputs
2. NEVER use vague words like "practice", "study", "work on", "review", "learn" without specifying EXACTLY what
3. Include specific resources: book titles, course names, YouTube channel names, app names
4. For physical activities: exact exercises, sets, reps, weights, distances, times
5. For learning: exact chapters, lessons, problem sets, number of problems to solve
6. For creative work: exact deliverables, word counts, specific techniques to practice
7. For skills: exact drills, specific scenarios to practice, measurable benchmarks

**CRITICAL - DO NOT HALLUCINATE URLs:**
- NEVER make up YouTube video URLs or any website URLs
- Instead of fake URLs, describe what to search for: "Search YouTube for 'Alan Thrall squat tutorial'"
- Only mention real, well-known resources by NAME (not URL): "Duolingo app", "StrongLifts 5x5 app", "Jeff Nippard YouTube channel"
- For books, just use the title and author: "Starting Strength by Mark Rippetoe"
- For apps, just use the name: "Use the Headspace app for guided meditation"

BAD EXAMPLES (fake URLs - NEVER DO THIS):
- "Watch https://youtube.com/watch?v=abc123" → WRONG (fake URL)
- "Visit https://example.com/tutorial" → WRONG (fake URL)

GOOD EXAMPLES (real resources by name):
- "Search YouTube for 'Alan Thrall how to squat' and watch the first result"
- "Practice Hanon Exercise #1 at 60 BPM for 15 minutes"
- "Complete Duolingo Spanish Unit 3 Lessons 1-5 (Restaurant vocabulary)"
- "Chest workout: Bench press 4x8, Incline dumbbell press 3x12, Cable flyes 3x15"
- "Read Chapter 3 of 'The Intelligent Investor' by Benjamin Graham (pages 45-78)"
- "Use the Nike Run Club app for a guided 30-minute easy run"

When creating plans:
1. Break down the goal into progressive weekly milestones with clear success criteria
2. Schedule ultra-specific tasks within the user's available time slots
3. Start with foundational tasks and progressively increase complexity
4. Include variety to prevent burnout while maintaining focus
5. Each task should be so specific that the user knows EXACTLY what to do without any additional research
6. Reference resources by NAME only, never by URL

**CRITICAL - PROGRESSIVE DIFFICULTY & GOAL ACHIEVEMENT:**
The plan MUST follow a progressive structure that leads to achieving the stated goal:

1. **Weeks 1-25%**: Foundation phase - Start EASY. Build basic habits, learn fundamentals, low intensity/volume
2. **Weeks 25-50%**: Development phase - MODERATE difficulty. Increase intensity/complexity by 20-30%
3. **Weeks 50-75%**: Building phase - CHALLENGING. Push toward goal-level performance
4. **Weeks 75-100%**: Peak phase - GOAL ACHIEVEMENT. Final weeks should have tasks at or near the goal level

Example progression for "Run a marathon":
- Week 1: Run 2 miles easy (foundation)
- Week 4: Run 5 miles with 1 mile at tempo pace (development)
- Week 8: Run 10 miles including hills (building)
- Week 12: Run 18-20 miles, race simulation (peak)
- Final week: Complete marathon (goal achieved)

Example progression for "Learn Spanish conversational":
- Week 1: Learn 50 basic words, simple greetings (foundation)
- Week 4: Form basic sentences, 200 word vocabulary (development)
- Week 8: Hold 5-minute conversations on familiar topics (building)
- Week 12: 15-minute conversation with native speaker (goal achieved)

**The LAST WEEK must include a task that demonstrates goal completion.** If the goal is "run a 5K", the final week should include actually running a 5K. If the goal is "learn 1000 words", the final week should test all 1000 words.

Always respond with valid JSON matching the exact schema requested.`;

/**
 * Generate an initial plan for a new goal
 */
export async function generatePlan(
  input: CreateGoalInput,
  timezone: string
): Promise<GeneratedPlan> {
  const targetDate = new Date(input.targetDate);
  const totalWeeks = Math.max(1, differenceInWeeks(targetDate, new Date()));

  const availabilityDescription = input.availability
    .map((a) => `${getDayName(a.dayOfWeek)}: ${a.startTime} - ${a.endTime}`)
    .join('\n');

  // Retrieve relevant knowledge context (RAG)
  const knowledgeContext = await retrieveGoalContext(
    input.title,
    input.description,
    input.currentLevel
  );

  let ragSection = '';
  if (knowledgeContext.found && knowledgeContext.formattedContext) {
    ragSection = `
---
${knowledgeContext.formattedContext}
---

IMPORTANT: Use the retrieved knowledge above to inform your plan. Include the specific resources, exercises, and task formats shown. Adapt the sample tasks to fit the user's schedule.

`;
    console.log(`RAG: Found knowledge for category "${knowledgeContext.category}"`);
  } else {
    console.log('RAG: No matching knowledge found, using LLM knowledge only');
  }

  // Calculate phase boundaries
  const foundationEnd = Math.ceil(totalWeeks * 0.25);
  const developmentEnd = Math.ceil(totalWeeks * 0.5);
  const buildingEnd = Math.ceil(totalWeeks * 0.75);

  const userPrompt = `${ragSection}Create a ${totalWeeks}-week PROGRESSIVE plan for the following goal:

**Goal:** ${input.title}
${input.description ? `**Details:** ${input.description}` : ''}
**Current Level:** ${input.currentLevel.replace('_', ' ')}
**Target Date:** ${targetDate.toDateString()}
**Timezone:** ${timezone}

**Available Time Slots:**
${availabilityDescription}

**PROGRESSIVE PHASES (CRITICAL - MUST FOLLOW):**
- **Weeks 1-${foundationEnd}**: FOUNDATION - Start easy, build habits, learn basics (30-40% of goal difficulty)
- **Weeks ${foundationEnd + 1}-${developmentEnd}**: DEVELOPMENT - Moderate challenge, increase intensity (50-60% of goal difficulty)
- **Weeks ${developmentEnd + 1}-${buildingEnd}**: BUILDING - Challenging, push limits (70-80% of goal difficulty)
- **Weeks ${buildingEnd + 1}-${totalWeeks}**: PEAK - Goal achievement level (90-100% of goal difficulty)
- **Week ${totalWeeks} MUST include the actual goal achievement task** (e.g., run the full marathon, complete the final project, pass the test)

Generate a structured plan with specific tasks scheduled within the available time slots.

**CRITICAL SCHEDULING RULES:**
1. **Adhere Strictly:** Only schedule tasks within the provided availability windows.
2. **Break Down Long Slots:** If an available time slot is longer than 60 minutes, you MUST break it down into multiple distinct, smaller tasks (e.g., split a 2-hour block into two 50-minute tasks with different focuses) to maintain engagement. Do not schedule single tasks longer than 90 minutes.
3. **Volume:** Aim for 3-5 tasks per week depending on availability.
4. **Progressive Difficulty:** Each week MUST be harder than the previous. Increase volume, intensity, complexity, or duration progressively.

**SPECIFICITY REQUIREMENTS (MANDATORY):**
- Task titles MUST include exact details: specific resources, quantities, page numbers, exercises
- Task descriptions MUST explain exactly what to do step-by-step
- NEVER use vague terms like "practice", "study", "work on" without exact specifics
- Include real resource names: specific books, courses, apps, YouTube channels (by NAME, not URL)
- Each task should be so clear that the user needs ZERO additional research to start

Respond with JSON in this exact format:
{
  "totalWeeks": ${totalWeeks},
  "weeklyPlans": [
    {
      "weekNumber": 1,
      "focus": "Brief description of this week's focus",
      "tasks": [
        {
          "title": "Task title",
          "description": "Brief task description",
          "dayOfWeek": 1,
          "time": "09:00",
          "durationMinutes": 45,
          "weekNumber": 1
        }
      ]
    }
  ]
}
`;

  const prompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
  const result = await generateWithRetry(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Unexpected empty response from AI');
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonString = text;
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  }

  try {
    const plan = JSON.parse(jsonString.trim()) as GeneratedPlan;
    return plan;
  } catch (e) {
    console.error('Failed to parse AI response, attempting repair...');

    // Try to repair truncated JSON
    const repairedJson = repairTruncatedJson(jsonString.trim());
    if (repairedJson) {
      try {
        const plan = JSON.parse(repairedJson) as GeneratedPlan;
        console.log('Successfully repaired and parsed JSON');
        return plan;
      } catch (e2) {
        console.error('Repair attempt also failed');
      }
    }

    console.error('Original AI response:', text);
    throw new Error('Failed to parse plan from AI response');
  }
}

/**
 * Attempt to repair truncated JSON by closing open structures
 */
function repairTruncatedJson(json: string): string | null {
  try {
    // Count open brackets and braces
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of json) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }

    // If we're in a string, close it
    let repaired = json;
    if (inString) {
      repaired += '"';
    }

    // Remove any trailing incomplete key-value pair
    // Look for patterns like: ,"key": or "key":  at the end
    repaired = repaired.replace(/,\s*"[^"]*":\s*"?[^",}\]]*$/g, '');
    repaired = repaired.replace(/,\s*"[^"]*":\s*$/g, '');
    repaired = repaired.replace(/,\s*$/g, '');

    // Close open brackets and braces
    while (bracketCount > 0) {
      repaired += ']';
      bracketCount--;
    }
    while (braceCount > 0) {
      repaired += '}';
      braceCount--;
    }

    return repaired;
  } catch (e) {
    return null;
  }
}

/**
 * Regenerate a plan based on check-in results
 */
export async function regeneratePlan(
  goalTitle: string,
  goalDescription: string | null,
  currentLevel: string,
  remainingWeeks: number,
  completedTasks: string[],
  missedTasks: string[],
  availability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  timezone: string,
  userNotes?: string
): Promise<GeneratedPlan> {
  const availabilityDescription = availability
    .map((a) => `${getDayName(a.dayOfWeek)}: ${a.startTime} - ${a.endTime}`)
    .join('\n');

  const userPrompt = `Adjust and regenerate the remaining plan for this goal based on last week's progress:

**Goal:** ${goalTitle}
${goalDescription ? `**Details:** ${goalDescription}` : ''}
**Current Level:** ${currentLevel.replace('_', ' ')}
**Remaining Weeks:** ${remainingWeeks}
**Timezone:** ${timezone}

**Last Week's Results:**
- Completed: ${completedTasks.length > 0 ? completedTasks.join(', ') : 'None'}
- Missed: ${missedTasks.length > 0 ? missedTasks.join(', ') : 'None'}
${userNotes ? `- User notes: ${userNotes}` : ''}

**Available Time Slots:**
${availabilityDescription}

Based on this progress:
1. If tasks were missed, consider if the pace was too aggressive
2. If all tasks were completed, consider if we can progress faster
3. Reschedule any critical missed content if needed
4. Adjust difficulty based on demonstrated progress

Respond with JSON in this exact format:
{
  "totalWeeks": ${remainingWeeks},
  "weeklyPlans": [
    {
      "weekNumber": 1,
      "focus": "Brief description of this week's focus",
      "tasks": [
        {
          "title": "Task title",
          "description": "Brief task description",
          "dayOfWeek": 1,
          "time": "09:00",
          "durationMinutes": 60,
          "weekNumber": 1
        }
      ]
    }
  ]
}`;

  const prompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
  const result = await generateWithRetry(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Unexpected empty response from AI');
  }

  let jsonString = text;
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  }

  try {
    const plan = JSON.parse(jsonString.trim()) as GeneratedPlan;
    return plan;
  } catch (e) {
    console.error('Failed to parse AI response, attempting repair...');

    const repairedJson = repairTruncatedJson(jsonString.trim());
    if (repairedJson) {
      try {
        const plan = JSON.parse(repairedJson) as GeneratedPlan;
        console.log('Successfully repaired and parsed JSON');
        return plan;
      } catch (e2) {
        console.error('Repair attempt also failed');
      }
    }

    console.error('Original AI response:', text);
    throw new Error('Failed to parse plan from AI response');
  }
}

/**
 * Generate suggestions for improving a goal or adjusting the plan
 */
export async function generateSuggestions(
  goalTitle: string,
  goalDescription: string | null,
  completionRate: number,
  recentNotes: string[]
): Promise<string[]> {
  const userPrompt = `Based on the following goal progress, provide 3-5 brief suggestions for improvement:

**Goal:** ${goalTitle}
${goalDescription ? `**Details:** ${goalDescription}` : ''}
**Completion Rate:** ${Math.round(completionRate * 100)}%
**Recent Notes:** ${recentNotes.length > 0 ? recentNotes.join('; ') : 'None provided'}

Respond with a JSON array of suggestion strings:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

  const systemPrompt = 'You are a helpful goal achievement coach. Provide concise, actionable suggestions.';
  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  const result = await generateWithRetry(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    return ['Keep up the good work!', 'Try to maintain consistency.', 'Review your progress weekly.'];
  }

  let jsonString = text;
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  }

  try {
    const suggestions = JSON.parse(jsonString.trim()) as string[];
    return suggestions;
  } catch (e) {
    console.error('Failed to parse suggestions:', text);
    return ['Keep up the good work!', 'Try to maintain consistency.', 'Review your progress weekly.'];
  }
}
