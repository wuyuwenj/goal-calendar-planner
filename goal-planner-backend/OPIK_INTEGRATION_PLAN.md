# Opik Integration Plan

## Overview

Integrate Opik observability into the goal-planner backend to track, evaluate, and improve LLM-powered goal generation.

---

## Prerequisites

- [ ] Create Comet account at https://www.comet.com
- [ ] Create Opik project named "goal-planner"
- [ ] Obtain API key from Settings → API Keys
- [ ] Note workspace name from dashboard URL

---

## Phase 1: SDK Installation & Configuration

### 1.1 Install Dependencies

```bash
npm install opik opik-gemini @google/genai
```

### 1.2 Environment Variables

Add to `.env`:

```bash
OPIK_API_KEY="your-opik-api-key"
OPIK_URL_OVERRIDE="https://www.comet.com/opik/api"
OPIK_PROJECT_NAME="goal-planner"
OPIK_WORKSPACE_NAME="your-workspace"
```

### 1.3 Decision: Gemini SDK Migration

**Current state:** Using `@google/generative-ai` (older SDK)
**Opik requires:** `@google/genai` (newer unified SDK)

**Options:**

| Option | Pros | Cons |
|--------|------|------|
| **A: Migrate to @google/genai** | Native Opik integration, cleaner code | Requires rewriting Gemini calls |
| **B: Manual tracing with base opik** | No SDK migration needed | More boilerplate, manual trace management |

**Recommendation:** Option A (migrate) for long-term maintainability

---

## Phase 2: Code Changes

### 2.1 If Option A (Migrate Gemini SDK)

#### Update `src/lib/gemini.ts`

```typescript
import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { Opik } from "opik";

const opikClient = new Opik({
  projectName: process.env.OPIK_PROJECT_NAME,
  workspaceName: process.env.OPIK_WORKSPACE_NAME,
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const trackedGenAI = trackGemini(genAI, {
  client: opikClient,
  traceMetadata: {
    tags: ["goal-generation"],
    environment: process.env.NODE_ENV || "development",
  },
  generationName: "GoalPlanGenerator",
});

export const flushOpik = async () => {
  await trackedGenAI.flush();
};
```

#### Update `src/services/ai.ts`

Replace `model.generateContent()` calls with:

```typescript
const response = await trackedGenAI.models.generateContent({
  model: "gemini-2.0-flash",
  contents: userPrompt,
  config: {
    systemInstruction: SYSTEM_PROMPT,
    temperature: 0.7,
    maxOutputTokens: 32768,
  },
});
```

### 2.2 If Option B (Manual Tracing)

#### Create `src/lib/opik.ts`

```typescript
import { Opik } from "opik";

export const opik = new Opik({
  projectName: process.env.OPIK_PROJECT_NAME,
  workspaceName: process.env.OPIK_WORKSPACE_NAME,
});
```

#### Wrap calls in `src/services/ai.ts`

```typescript
import { opik } from "../lib/opik";

export async function generatePlan(input: GeneratePlanInput) {
  const trace = opik.trace({
    name: "generate-goal-plan",
    input: {
      goal: input.title,
      description: input.description,
      level: input.currentLevel,
      targetDate: input.targetDate,
      availableSlots: input.availability.length,
    },
    metadata: {
      userId: input.profileId,
      timezone: input.timezone,
    },
  });

  try {
    // Existing Gemini call
    const result = await model.generateContent(...);

    trace.update({
      output: {
        totalWeeks: result.totalWeeks,
        taskCount: result.weeklyPlans.flatMap(w => w.tasks).length,
      },
    });

    return result;
  } catch (error) {
    trace.update({
      output: { error: error.message },
      metadata: { failed: true },
    });
    throw error;
  } finally {
    trace.end();
    await opik.flush();
  }
}
```

---

## Phase 3: Add Custom Metadata

Enhance traces with business context:

```typescript
const trace = opik.trace({
  name: "generate-goal-plan",
  input: { ... },
  metadata: {
    // User context
    userId: profileId,
    timezone: timezone,

    // Goal context
    goalCategory: detectCategory(title), // fitness, language, etc.
    experienceLevel: currentLevel,
    totalWeeks: calculateWeeks(targetDate),

    // Availability context
    totalAvailableHours: calculateTotalHours(availability),
    daysPerWeek: availability.length,
  },
  tags: [
    detectCategory(title),
    currentLevel,
    process.env.NODE_ENV,
  ],
});
```

---

## Phase 4: Track Regeneration & Check-ins

### 4.1 Track Plan Regeneration

In `regeneratePlan()`:

```typescript
const trace = opik.trace({
  name: "regenerate-plan",
  input: {
    goalId,
    weekNumber,
    completedTasks,
    missedTasks,
    userNotes,
  },
  tags: ["regeneration"],
});
```

### 4.2 Track Intensity Adjustments

In `adjustPlanIntensity()`:

```typescript
const trace = opik.trace({
  name: "adjust-intensity",
  input: {
    goalId,
    direction, // "increase" or "decrease"
    currentWeek,
  },
  tags: ["intensity-adjustment"],
});
```

---

## Phase 5: Flush on Shutdown

### Update `src/index.ts` (or main server file)

```typescript
import { flushOpik } from "./lib/opik";

// Graceful shutdown
const shutdown = async () => {
  console.log("Flushing Opik traces...");
  await flushOpik();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

---

## Phase 6: Dashboard Analysis

Once integrated, use the Opik dashboard to:

### 6.1 Monitor
- View all goal generation traces
- Filter by tags (goal category, experience level)
- Track latency and token usage

### 6.2 Debug
- Inspect failed generations
- Compare input/output for problematic goals
- Identify patterns in low-quality outputs

### 6.3 Evaluate (Future)
- Create datasets from logged traces
- Build evaluation metrics:
  - Task specificity score
  - Resource validity
  - Progressive difficulty check
- Run experiments on prompt variants

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/gemini.ts` | Add Opik wrapper or create new opik.ts |
| `src/services/ai.ts` | Wrap `generatePlan`, `regeneratePlan`, `adjustPlanIntensity` |
| `src/index.ts` | Add graceful shutdown with flush |
| `.env` | Add Opik environment variables |
| `package.json` | Add opik dependencies |

---

## Testing Checklist

- [ ] Traces appear in Opik dashboard after generating a goal
- [ ] Input/output correctly captured
- [ ] Metadata (userId, category, level) visible in traces
- [ ] Errors are logged with trace context
- [ ] Traces flush on server shutdown
- [ ] Regeneration and intensity adjustments are tracked

---

## Future Enhancements

1. **Evaluation Pipeline**
   - Define metrics for plan quality
   - Automate evaluation runs on new traces
   - Alert on quality degradation

2. **A/B Testing**
   - Version prompts in Opik
   - Compare metrics between versions
   - Auto-promote better performers

3. **Feedback Loop**
   - Correlate check-in data with trace quality
   - Identify prompts that lead to high task completion
   - Feed insights back into prompt improvements

---

## Resources

- [Opik TypeScript SDK Docs](https://www.comet.com/docs/opik/integrations/typescript-sdk)
- [Opik Gemini Integration](https://www.comet.com/docs/opik/integrations/gemini-typescript)
- [Opik GitHub](https://github.com/comet-ml/opik)
- [NPM Package](https://www.npmjs.com/package/opik)
