# Trellis Goal Planner - Detailed Onboarding Flow Design

> Based on industry best practices from UserFlow, VWO, Userpilot, Appcues, UXCam, and NNGroup research.

---

## Overview

### Design Philosophy

Following the core principles from the research:

1. **Get users to the "Aha Moment" fast** - Users should experience value within 60 seconds
2. **Learning by doing** - Interactive goal creation, not passive tutorials
3. **Personalization from the start** - Tailor the experience based on user intent
4. **Progressive disclosure** - Reveal features contextually, not all at once
5. **Reduce cognitive load** - One concept per screen, minimal text

### Key Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Completion Rate | >80% | Users who finish all steps / Users who start |
| Time to Complete | <90 seconds | Timestamp difference |
| Drop-off Points | <10% per step | Funnel analytics per screen |
| Day 1 Retention | >40% | Users returning within 24 hours |
| First Goal Created | >90% | Users with at least one goal |

---

## Complete Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Welcome  │───▶│  Intent  │───▶│   Goal   │───▶│  Level   │  │
│  │  Screen  │    │  Survey  │    │  Input   │    │ Select   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       1              2               3               4          │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Timeline │───▶│  Avail-  │───▶│ Success  │───▶│   Home   │  │
│  │  Select  │    │  ability │    │  State   │    │  Screen  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       5              6               7          (Main App)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen-by-Screen Breakdown

---

### Screen 1: Welcome Screen

**Purpose:** Value proposition + emotional connection (Benefits-Oriented Onboarding)

**Why this screen:**
> "From the very beginning, users should understand why your app matters. Clear, simple messaging about the value you provide helps capture their interest and builds trust." - UserFlow Guide

**Design:**

```
┌─────────────────────────────────────┐
│                                     │
│            🌱                       │  <- Trellis logo/icon (animated grow)
│                                     │
│         Welcome to                  │  <- h2, secondary color
│          Trellis                    │  <- h1, forest green
│                                     │
│   ┌─────────────────────────────┐   │
│   │  "Turn your dreams into     │   │  <- Value proposition
│   │   achievable daily actions" │   │     Single sentence
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ ✓ AI-powered weekly plans   │   │  <- 3 key benefits
│   │ ✓ Smart calendar sync       │   │     (from login screen)
│   │ ✓ Track your progress       │   │
│   └─────────────────────────────┘   │
│                                     │
│                                     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │      Let's Get Started      │   │  <- Primary button
│   └─────────────────────────────┘   │
│                                     │
│        Already have goals?          │  <- Skip link (ghost button)
│                                     │
└─────────────────────────────────────┘
```

**Copy:**
- Headline: "Welcome to Trellis"
- Subheadline: "Turn your dreams into achievable daily actions"
- Benefits (with checkmarks):
  - "AI-powered weekly plans tailored to you"
  - "Smart calendar sync keeps you on track"
  - "Track progress and celebrate wins"
- CTA: "Let's Get Started"
- Skip: "Already have goals? Skip"

**Interactions:**
- Logo animation: Subtle grow/pulse on mount (Reanimated)
- Button: Ripple effect on press
- Skip link visible but de-emphasized

**Best Practice Applied:**
> "Highlight your value proposition - Start by explaining what makes your app unique and how it helps users." - VWO Guide

---

### Screen 2: Intent Survey (Self-Select Onboarding)

**Purpose:** Personalize experience + segment users + create investment

**Why this screen:**
> "Self-select onboarding lets users choose their own onboarding path based on their goals or preferences. This approach is especially effective for apps with multiple use cases." - UserFlow Guide

**Design:**

```
┌─────────────────────────────────────┐
│  ←                    ○ ○ ○ ○ ○ ○   │  <- Back + Step indicator (1/6)
│                                     │
│   What brings you to Trellis?       │  <- h2
│                                     │
│   This helps us personalize         │  <- Body text, muted
│   your experience                   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🎯  Learning a new skill   │   │  <- Selectable card (tap)
│   │      Guitar, coding, etc.   │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  💪  Health & Fitness       │   │
│   │      Running, gym, diet     │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  📈  Career Growth          │   │
│   │      Promotion, skills      │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🎨  Creative Project       │   │
│   │      Writing, art, music    │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ✨  Something else         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          Continue           │   │  <- Disabled until selection
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Categories:**
| Category | Icon | Examples | Use for Personalization |
|----------|------|----------|------------------------|
| Learning a new skill | 🎯 | Guitar, coding, language | Suggest skill-based goals |
| Health & Fitness | 💪 | Running, gym, diet | Suggest fitness goals |
| Career Growth | 📈 | Promotion, certification | Suggest professional goals |
| Creative Project | 🎨 | Writing, art, music | Suggest creative goals |
| Something else | ✨ | - | Generic suggestions |

**Interactions:**
- Single select (radio behavior)
- Card highlights with forest green border on select
- Subtle scale animation on selection (1.02x)
- Continue button enables after selection

**Data Captured:**
```typescript
onboardingData.category = 'learning' | 'health' | 'career' | 'creative' | 'other'
```

**Best Practice Applied:**
> "Use information from sign-up—like goals, preferences, or role—to tailor the onboarding path. Personalized flows feel more relevant and help users connect with the product faster." - Userpilot Guide

---

### Screen 3: Goal Input (Interactive Onboarding)

**Purpose:** Core action - create first goal with guided assistance

**Why this screen:**
> "Encourage users to complete real tasks inside your app. Doing is more effective than reading." - UserFlow Guide

**Design:**

```
┌─────────────────────────────────────┐
│  ←                    ● ○ ○ ○ ○ ○   │  <- Step 2/6
│                                     │
│   What's your goal?                 │  <- h2
│                                     │
│   ┌─────────────────────────────┐   │
│   │  I want to...               │   │  <- Input label
│   │  ┌───────────────────────┐  │   │
│   │  │ Learn to play guitar  │  │   │  <- Text input (pre-filled
│   │  │                       │  │   │     based on category)
│   │  └───────────────────────┘  │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Tell us more (optional)    │   │  <- Textarea label
│   │  ┌───────────────────────┐  │   │
│   │  │ I've always wanted to │  │   │
│   │  │ play my favorite      │  │   │
│   │  │ songs...              │  │   │
│   │  └───────────────────────┘  │   │
│   └─────────────────────────────┘   │
│                                     │
│   ───────────────────────────────── │
│                                     │
│   💡 Popular goals like yours:      │  <- Suggestion section
│                                     │     (based on category)
│   ┌───────────┐ ┌───────────┐       │
│   │ Run a 5K  │ │ Learn     │       │  <- Tappable chips
│   └───────────┘ │ Spanish   │       │
│   ┌───────────┐ └───────────┘       │
│   │ Read 12   │ ┌───────────┐       │
│   │ books     │ │ Meditate  │       │
│   └───────────┘ │ daily     │       │
│                 └───────────┘       │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          Continue           │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Dynamic Suggestions by Category:**

| Category | Suggestions |
|----------|-------------|
| Learning | "Learn Spanish", "Learn to code", "Play guitar", "Learn photography" |
| Health | "Run a 5K", "Lose 10 pounds", "Build muscle", "Meditate daily" |
| Career | "Get promoted", "Learn data science", "Build a portfolio", "Network more" |
| Creative | "Write a novel", "Learn to paint", "Record an album", "Start a blog" |
| Other | Mix of popular goals from all categories |

**Interactions:**
- Auto-focus on goal input on mount
- Tapping a suggestion chip fills the input
- Character counter for description (optional, max 500)
- Keyboard avoidance for input fields

**Validation:**
- Goal title: Required, min 3 characters
- Description: Optional

**Best Practice Applied:**
> "Fill the user onboarding screen with relevant data... Show contextual tips based on the user's expertise and familiarity with the product." - Userpilot Guide

---

### Screen 4: Experience Level (Existing Screen - Enhanced)

**Purpose:** Calibrate AI recommendations to user's current ability

**Why this screen:**
> "Personalize the learning experience based on the user's goals and prior knowledge... This step makes the experience feel tailored and meaningful." - VWO Guide (Duolingo example)

**Design:** (Keep existing design with minor enhancements)

```
┌─────────────────────────────────────┐
│  ←                    ● ● ○ ○ ○ ○   │  <- Step 3/6
│                                     │
│   What's your experience with       │  <- h2
│   [goal title]?                     │  <- Dynamic from previous
│                                     │
│   This helps us create the          │  <- Body, muted
│   perfect plan for you              │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🌱  Complete Beginner      │   │
│   │      Never tried this       │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🌿  Some Experience        │   │  <- Selected state
│   │      Tried a few times      │   │     (forest green border)
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🌳  Intermediate           │   │
│   │      Comfortable basics     │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🏆  Advanced               │   │
│   │      Looking to master      │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │  <- Conditional input
│   │  Tell us more about your    │   │     (appears after selection)
│   │  experience (optional)      │   │
│   │  ┌───────────────────────┐  │   │
│   │  │ I took lessons as a   │  │   │
│   │  │ kid but stopped...    │  │   │
│   │  └───────────────────────┘  │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          Continue           │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Enhancements from existing:**
- Add nature-themed icons (🌱🌿🌳🏆) to match Trellis brand
- Dynamic headline with goal title interpolation
- Animate conditional input appearance

**Best Practice Applied:**
> "Duolingo asks users about their goals—whether they want to learn for travel, career, or personal interest. This step makes the experience feel tailored and meaningful." - VWO Guide

---

### Screen 5: Timeline Selection (Existing Screen - Enhanced)

**Purpose:** Set realistic expectations and commitment level

**Design:** (Keep existing with minor copy improvements)

```
┌─────────────────────────────────────┐
│  ←                    ● ● ● ○ ○ ○   │  <- Step 4/6
│                                     │
│   How long do you want to           │  <- h2
│   work on this?                     │
│                                     │
│   We'll break it into weekly        │  <- Body, muted
│   milestones you can actually hit   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ⚡  1 Month                 │   │
│   │      Quick sprint           │   │
│   │      Best for simple goals  │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🎯  3 Months (Recommended) │   │  <- Highlight recommended
│   │      Balanced approach      │   │
│   │      Most popular choice    │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🏔️  6 Months               │   │
│   │      Deep commitment        │   │
│   │      For ambitious goals    │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ⚙️  Custom                  │   │
│   │      Choose your own        │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Custom slider appears here       │
│    when Custom is selected]         │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          Continue           │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Enhancement:** Add "(Recommended)" badge and social proof "Most popular choice" to 3-month option.

**Best Practice Applied:**
> "Use gamification elements - progress bars, achievements, or rewards—to make onboarding more motivating." - UserFlow Guide

---

### Screen 6: Weekly Availability (Existing Screen - Enhanced)

**Purpose:** Collect scheduling preferences for AI task generation

**Design:** (Keep existing with UX improvements)

```
┌─────────────────────────────────────┐
│  ←                    ● ● ● ● ○ ○   │  <- Step 5/6
│                                     │
│   When can you work on your goal?   │  <- h2
│                                     │
│   Select days and times you're      │  <- Body, muted
│   usually free                      │
│                                     │
│   ┌───────────────────────────────────┐ │
│   │  Select days                      │ │
│   │                                   │ │
│   │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐│
│   │  │M │ │T │ │W │ │T │ │F │ │S │ │S ││ <- Toggleable pills
│   │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘│    (all 7 days)
│   │  Mon  Tue  Wed  Thu  Fri  Sat  Sun │
│   │                                   │ │
│   └───────────────────────────────────┘ │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Preferred time             │   │
│   │                             │   │
│   │  From: [9:00 AM     ▼]      │   │  <- Time pickers
│   │  To:   [6:00 PM     ▼]      │   │
│   │                             │   │
│   │  💡 We'll schedule tasks    │   │
│   │     within these hours      │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │       Create My Plan        │   │  <- Primary action
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Validation:**
- At least 1 day selected
- Start time before end time

**Best Practice Applied:**
> "Simplify steps - Break down intricate processes into smaller, logical steps." - VWO Guide

---

### Screen 7: Success State (Celebration)

**Purpose:** Celebrate completion + build anticipation + guide to next action

**Why this screen:**
> "Reinforce progress and success - Add visual progress indicators... End the flow with a success message like 'You're all set!' to give users a sense of achievement." - VWO Guide

**Design:**

```
┌─────────────────────────────────────┐
│                    ● ● ● ● ● ●      │  <- Step 6/6 (complete)
│                                     │
│                                     │
│              🎉                     │  <- Animated confetti/celebration
│                                     │
│           You're all set!           │  <- h1, forest green
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │  Your personalized plan     │   │  <- Summary card
│   │  is being created...        │   │
│   │                             │   │
│   │  ┌───────────────────────┐  │   │
│   │  │  🎯 Learn to play     │  │   │  <- Goal title
│   │  │     guitar            │  │   │
│   │  └───────────────────────┘  │   │
│   │                             │   │
│   │  📅 12 weeks               │   │  <- Summary stats
│   │  📆 Mon, Wed, Fri          │   │
│   │  ⏰ 9:00 AM - 6:00 PM      │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ✨ What happens next:      │   │
│   │                             │   │
│   │  1. AI creates your weekly  │   │
│   │     task breakdown          │   │
│   │                             │   │
│   │  2. Tasks sync to your      │   │
│   │     calendar (optional)     │   │
│   │                             │   │
│   │  3. Weekly check-ins keep   │   │
│   │     you on track            │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │      See My Dashboard       │   │  <- Primary button
│   └─────────────────────────────┘   │
│                                     │
│   [Loading indicator if pending]    │
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Confetti burst on mount (react-native-confetti-cannon or Lottie)
- Checkmark animation
- Card slide-up entrance

**Pending State:**
If goal is still being generated by AI:
- Show "Creating your plan..." with spinner
- Poll every 10 seconds (existing logic)
- Update to success state when complete

**Best Practice Applied:**
> "Gamification is woven directly into Duolingo's onboarding... This steady sense of progress keeps users motivated." - VWO Guide

---

### Screen 8: Home Screen (Post-Onboarding - Contextual Tips)

**Purpose:** Deliver immediate value + contextual education

**Why contextual tips:**
> "Progressive onboarding reveals features gradually as users explore the app... Slack ensures that guidance appears at the right moment, making the experience intuitive." - UserFlow Guide

**Design - First Launch State:**

```
┌─────────────────────────────────────┐
│  Good morning, James! 👋            │  <- Personalized greeting
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎯 Learn to play guitar     │   │  <- Goal card
│  │                             │   │
│  │ Week 1 of 12                │   │
│  │ ████░░░░░░░░░░░░░ 8%        │   │
│  │                             │   │
│  │ 🔥 0 day streak             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │  <- CONTEXTUAL TIP (tooltip)
│  │ 💡 Tip: Complete tasks to   │   │     First-time only
│  │    build your streak!       │   │
│  │                    Got it   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Today's Tasks                      │
│  ┌─────────────────────────────┐   │
│  │ □ Watch intro video (15m)   │   │  <- First task
│  │   9:00 AM                   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ □ Learn basic chords (30m)  │   │
│  │   10:00 AM                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Sync to Calendar         │   │  <- Upsell card
│  │    Never miss a task        │   │     (contextual, not forced)
│  │              Connect →      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Contextual Tips (Show once, dismiss permanently):**

| Trigger | Tip Content | Location |
|---------|-------------|----------|
| First dashboard view | "Complete tasks to build your streak!" | Below goal card |
| First task completion | "Great job! Your first task done!" | Toast notification |
| First week complete | "Weekly check-in unlocked!" | Modal |
| 3-day streak | "You're on fire! Keep it going!" | Toast |
| Calendar not synced (day 3) | "Sync to calendar for reminders" | Card on dashboard |

**Best Practice Applied:**
> "Offer contextual instructions - Deliver guidance at the moment users need it. Use tooltips, inline hints, or small in-app messages to explain UI elements as users encounter them." - UserFlow Guide

---

## Empty States Design

**Why empty states matter:**
> "Use empty states to guide users when screens have no content yet, showing them how to get started." - UserFlow Guide

**Dashboard - No Goals:**
```
┌─────────────────────────────────────┐
│                                     │
│           🌱                        │
│                                     │
│    No goals yet                     │
│                                     │
│    What do you want to achieve?     │
│    Let's create your first goal.    │
│                                     │
│   ┌─────────────────────────────┐   │
│   │    Create Your First Goal   │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Calendar - No Tasks Today:**
```
┌─────────────────────────────────────┐
│                                     │
│           ☀️                        │
│                                     │
│    Nothing scheduled today          │
│                                     │
│    Enjoy your free time, or         │
│    get ahead on tomorrow's tasks!   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     View Upcoming Tasks     │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Permission Requests

**Best Practice:**
> "Request access to device features—like the camera or location—only when they are needed. Briefly explain why each permission is required." - UserFlow Guide

**Notification Permission (Delayed):**
- Don't ask during onboarding
- Ask after first task completion or day 2
- Pre-permission screen explaining value:

```
┌─────────────────────────────────────┐
│                                     │
│           🔔                        │
│                                     │
│    Stay on track with reminders     │
│                                     │
│    We'll remind you about:          │
│    • Upcoming tasks                 │
│    • Weekly check-ins               │
│    • Streak milestones              │
│                                     │
│   ┌─────────────────────────────┐   │
│   │      Enable Notifications   │   │
│   └─────────────────────────────┘   │
│                                     │
│          Maybe Later                │
│                                     │
└─────────────────────────────────────┘
```

**Calendar Permission (Contextual):**
- Only ask when user taps "Sync to Calendar"
- Explain value in context

---

## Skip & Exit Behavior

**Best Practice:**
> "Let users skip onboarding if they want to explore on their own. Just make sure help and guidance are easy to find later." - UserFlow Guide

**Skip Options:**
- Welcome screen: "Already have goals? Skip" → Goes to dashboard
- Any screen: Back button → Previous screen
- X button (top-right): "Exit onboarding?" confirmation modal

**Resume Behavior:**
- If user exits mid-onboarding, save progress
- On next launch, prompt: "Continue setting up your goal?"
- Option to start fresh or continue

---

## Technical Implementation Notes

### New Files to Create

```
app/
├── onboarding/
│   ├── welcome.tsx          <- NEW: Welcome screen
│   ├── intent.tsx           <- NEW: Intent survey
│   ├── index.tsx            <- MODIFY: Goal input (add suggestions)
│   ├── level.tsx            <- MODIFY: Add icons
│   ├── timeline.tsx         <- MODIFY: Add recommended badge
│   ├── availability.tsx     <- EXISTING
│   └── success.tsx          <- NEW: Success celebration

components/
├── onboarding/
│   ├── CategoryCard.tsx     <- NEW: Selectable category card
│   ├── SuggestionChip.tsx   <- NEW: Goal suggestion chip
│   ├── SuccessAnimation.tsx <- NEW: Confetti/celebration
│   └── ContextualTip.tsx    <- NEW: Dismissable tip component

store/
├── goal.ts                  <- MODIFY: Add category to onboardingData
└── onboarding.ts            <- NEW: Track tip dismissals, resume state
```

### Data Model Updates

```typescript
// Add to OnboardingData
interface OnboardingData {
  category: 'learning' | 'health' | 'career' | 'creative' | 'other';  // NEW
  title: string;
  description: string;
  currentLevel: ExperienceLevel;
  levelDetails: string;
  timeline: Timeline;
  customWeeks?: number;
  availability: Availability[];
  commitments: string;
}

// New store for onboarding state
interface OnboardingState {
  hasCompletedOnboarding: boolean;
  dismissedTips: string[];  // Track which tips user has seen
  partialProgress?: Partial<OnboardingData>;  // For resume
}
```

### Analytics Events to Track

```typescript
// Track at each step
analytics.track('onboarding_step_viewed', { step: 'welcome' });
analytics.track('onboarding_step_completed', { step: 'intent', category: 'learning' });
analytics.track('onboarding_skipped', { fromStep: 'welcome' });
analytics.track('onboarding_completed', { totalTime: 65, stepsCompleted: 6 });
analytics.track('contextual_tip_dismissed', { tipId: 'streak_intro' });
```

---

## A/B Testing Recommendations

Once implemented, consider testing:

1. **Welcome screen variants:**
   - A: 3 benefits listed
   - B: Single strong value proposition

2. **Intent survey:**
   - A: With survey
   - B: Skip directly to goal input

3. **Timeline defaults:**
   - A: No default selected
   - B: 3 months pre-selected

4. **Success screen:**
   - A: With "What happens next" explanation
   - B: Minimal celebration only

---

## Summary Checklist

- [ ] Welcome screen with value proposition
- [ ] Intent survey for personalization
- [ ] Goal input with contextual suggestions
- [ ] Experience level with visual icons
- [ ] Timeline with recommended badge
- [ ] Availability selection (existing)
- [ ] Success celebration with summary
- [ ] Contextual tips on first dashboard view
- [ ] Empty states for all screens
- [ ] Skip/exit behavior with resume
- [ ] Delayed permission requests
- [ ] Analytics tracking at each step

---

## References

- [UserFlow: Ultimate Guide to In-App Onboarding](https://www.userflow.com/blog/the-ultimate-guide-to-in-app-onboarding-boost-user-retention-and-engagement)
- [VWO: Mobile App Onboarding Guide 2025](https://vwo.com/blog/mobile-app-onboarding-guide/)
- [Userpilot: 12 App Onboarding Best Practices](https://userpilot.com/blog/app-onboarding-best-practices/)
- [Appcues: Mobile User Onboarding UI/UX Patterns](https://www.appcues.com/blog/essential-guide-mobile-user-onboarding-ui-ux)
- [UXCam: Top 10 Onboarding Flow Examples](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)
- [NNGroup: Mobile App Onboarding Analysis](https://www.nngroup.com/articles/mobile-app-onboarding/)
