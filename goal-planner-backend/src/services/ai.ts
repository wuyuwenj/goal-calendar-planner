import { generateWithRetry } from '../lib/gemini';
import { GeneratedPlan, CreateGoalInput } from '../types';
import { differenceInWeeks } from 'date-fns';
import { getDayName } from '../utils/time';
import { retrieveGoalContext } from './knowledge';

const SYSTEM_PROMPT = `You are an elite performance coach and goal planning expert. Your job is to create hyper-specific, actionable weekly plans that leave ZERO ambiguity about what the user should do.

**CRITICAL - TASK VARIETY (MOST IMPORTANT):**
You MUST create DIVERSE tasks each week. NEVER repeat the same task type multiple times in a row.

For RUNNING/MARATHON goals, rotate through these workout types:
- Easy runs (conversational pace)
- Long runs (progressively longer each week)
- Tempo runs (comfortably hard pace for 20-40 min)
- Interval training (e.g., 6x800m at 5K pace with 400m recovery)
- Fartlek runs (speed play with varied pace)
- Hill repeats (e.g., 8x30 sec hill sprints)
- Recovery runs (very slow, active recovery)
- Cross-training (swimming, cycling, strength training)
- Rest/stretching/yoga days

For FITNESS goals, rotate through:
- Different muscle groups (push/pull/legs)
- Different rep schemes (strength 5x5, hypertrophy 3x12, endurance 2x20)
- Cardio variations (HIIT, steady-state, intervals)
- Flexibility/mobility work
- Active recovery

For LEARNING goals, rotate through:
- Active recall practice (flashcards, quizzes)
- Input (reading, watching, listening)
- Output (writing, speaking, creating)
- Review/spaced repetition
- Application (projects, real-world use)

**ANTI-REPETITION RULES:**
1. NEVER use the same task title twice in the entire plan
2. NEVER use the same description twice - each must be unique
3. Each week must have at least 2-3 DIFFERENT types of workouts/activities
4. If the previous task was an "easy run", the next running task MUST be different (tempo, intervals, etc.)

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
- For apps, just use the name: "Use the Headspace app for a guided 30-minute easy run"

BAD EXAMPLES (NEVER DO THIS):
- "Run 30 minutes at easy pace" on Monday, then "Run 35 minutes at easy pace" on Wednesday → WRONG (same type)
- Same description used twice → WRONG
- "Watch https://youtube.com/watch?v=abc123" → WRONG (fake URL)

GOOD EXAMPLES (varied training):
- Monday: "Easy run: 3 miles at conversational pace (Zone 2 heart rate)"
- Wednesday: "Interval workout: 6x400m at 5K pace with 200m walking recovery"
- Friday: "Tempo run: 2 mile warm-up, 20 min at half-marathon pace, 1 mile cool-down"
- Saturday: "Long run: 8 miles easy with last 2 miles at marathon pace"
- Sunday: "Cross-training: 30 min swimming or cycling + 15 min yoga for runners"

When creating plans:
1. Break down the goal into progressive weekly milestones with clear success criteria
2. Schedule ultra-specific tasks within the user's available time slots
3. Start with foundational tasks and progressively increase complexity
4. Include VARIETY in every single week - mix workout types, activities, and approaches
5. Each task should be so specific that the user knows EXACTLY what to do without any additional research
6. Reference resources by NAME only, never by URL

**CRITICAL - PROGRESSIVE DIFFICULTY & GOAL ACHIEVEMENT:**
The plan MUST follow a progressive structure that leads to achieving the stated goal.

**USE THE PERIODIZATION FROM RETRIEVED KNOWLEDGE:**
If the retrieved knowledge above includes a PERIODIZATION section, you MUST follow it exactly:
- Apply each phase to the corresponding weeks of the plan
- If "hasTaper: YES", reduce volume in the final weeks as specified
- If "hasTaper: NO", maintain or increase intensity all the way to the goal
- Use the example tasks from each phase as templates

**DEFAULT PERIODIZATION (if none provided):**
1. **Weeks 1-25%**: Foundation phase - Start EASY. Build basic habits, learn fundamentals
2. **Weeks 25-50%**: Development phase - MODERATE difficulty. Increase by 20-30%
3. **Weeks 50-75%**: Building phase - CHALLENGING. Push toward goal-level performance
4. **Weeks 75-100%**: Peak/Completion phase - Tasks at or near the goal level

**CRITICAL RULES:**
- Intensity must NEVER randomly drop and then peak again - that's backwards training
- If a goal requires taper (like marathon), only reduce volume in the FINAL 2-3 weeks, not months before
- If a goal doesn't need taper (like language learning), keep building intensity until the end
- **The LAST WEEK must include a task that demonstrates goal completion.** Marathon = run the marathon. Language = conversation test. Skill = perform/demonstrate the skill.

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
3. **Volume:** Create 1-2 tasks per available day. Match the number of tasks to the user's availability schedule.
4. **Progressive Difficulty:** Each week MUST be harder than the previous. Increase volume, intensity, complexity, or duration progressively.

**SPECIFICITY REQUIREMENTS (MANDATORY):**
- Task titles MUST include exact details: specific resources, quantities, page numbers, exercises
- Task descriptions should be 1-2 sentences max (KEEP IT CONCISE to avoid truncation)
- NEVER use vague terms like "practice", "study", "work on" without exact specifics
- Include real resource names: specific books, courses, apps, YouTube channels (by NAME, not URL)
- Focus on ACTIONABLE details, not explanations

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
  console.log(`AI: Got response (${text?.length || 0} chars)`);

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
    console.log('AI: Parsing JSON...');
    const plan = JSON.parse(jsonString.trim()) as GeneratedPlan;
    console.log(`AI: Parsed plan with ${plan.weeklyPlans?.length || 0} weeks`);
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
 * Attempt to repair truncated JSON by finding last complete week
 */
function repairTruncatedJson(json: string): string | null {
  try {
    // Find all complete week objects (they end with ] } pattern for tasks array + week object)
    // Look for pattern: "tasks": [...] }
    const weekEndPattern = /\]\s*\}/g;
    let lastValidEnd = -1;
    let match;

    while ((match = weekEndPattern.exec(json)) !== null) {
      // Verify this looks like end of a week by checking what comes before
      const beforeMatch = json.substring(Math.max(0, match.index - 50), match.index);
      if (beforeMatch.includes('"weekNumber"') || beforeMatch.includes('"durationMinutes"')) {
        lastValidEnd = match.index + match[0].length;
      }
    }

    if (lastValidEnd === -1) {
      console.log('JSON repair: Could not find any complete weeks');
      return null;
    }

    // Truncate at the last valid week end
    let repaired = json.substring(0, lastValidEnd);
    console.log(`JSON repair: Truncated at position ${lastValidEnd}, keeping ${repaired.length} chars`);

    // Now close the remaining open structures
    // We need to close: ] for weeklyPlans array, } for root object

    // Count remaining open brackets
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of repaired) {
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

    // Close remaining structures
    while (bracketCount > 0) {
      repaired += ']';
      bracketCount--;
    }
    while (braceCount > 0) {
      repaired += '}';
      braceCount--;
    }

    console.log(`JSON repair: Added ${repaired.length - lastValidEnd} closing chars`);
    return repaired;
  } catch (e) {
    console.error('JSON repair error:', e);
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
