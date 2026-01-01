# Paywall Design Guide for Goal Planner

This document outlines the paywall design strategy for Goal Planner, based on industry best practices and research from leading subscription app resources.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Paywall Structure](#paywall-structure)
3. [Copy Guidelines](#copy-guidelines)
4. [Pricing Strategy](#pricing-strategy)
5. [Visual Design](#visual-design)
6. [Superwall Implementation](#superwall-implementation)
7. [Compliance Checklist](#compliance-checklist)
8. [A/B Testing Ideas](#ab-testing-ideas)
9. [Metrics to Track](#metrics-to-track)

---

## Design Principles

### The 3-Second Rule
Users should understand what they're getting within 3 seconds of seeing the paywall. If copy is too complex, users will bounce.

### Outcome-Focused Messaging
Sell **results**, not features. Users care about what the app will do for them.

| Don't Say | Say Instead |
|-----------|-------------|
| "Unlimited goal tracking" | "Achieve your goals faster" |
| "AI-powered planning" | "Get a personalized plan that works" |
| "Progress analytics" | "Stay motivated with clear progress" |

### Trust Building
- Show transparent pricing upfront
- Include "Cancel anytime" reassurance
- Avoid dark patterns that hide information

---

## Paywall Structure

### Recommended Layout (Top to Bottom)

```
┌─────────────────────────────────────┐
│                                     │
│         [App Logo/Icon]             │
│                                     │
│    "Achieve Your Goals Faster"      │  ← Main Headline
│                                     │
│    ────────────────────────────     │
│                                     │
│    ✓ Unlimited goal creation        │
│    ✓ AI-powered personalized plans  │  ← 3-4 Benefits
│    ✓ Daily motivation & reminders   │
│    ✓ Detailed progress insights     │
│                                     │
│    ────────────────────────────     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  YEARLY          Best Value │    │  ← Recommended Plan
│  │  $29.99/year                │    │     (highlighted)
│  │  Just $2.49/month           │    │
│  │  Save 50%                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  MONTHLY                    │    │
│  │  $4.99/month                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Start 7-Day Free Trial     │    │  ← Primary CTA
│  └─────────────────────────────┘    │
│                                     │
│    Cancel anytime · No commitment   │  ← Trust Signal
│    Restore purchases                │
│                                     │
│    Terms of Service | Privacy       │
│                                     │
└─────────────────────────────────────┘
```

### Key Elements Breakdown

#### 1. Header Section
- Clean app icon or relevant illustration
- Bold, benefit-driven headline
- Subheadline with emotional hook (optional)

#### 2. Value Proposition
- 3-4 bullet points with checkmarks
- Focus on outcomes, not features
- Use action verbs ("Achieve", "Stay", "Track")

#### 3. Pricing Section
- Show both plans upfront (transparency builds trust)
- Default to yearly plan (visually prominent)
- Show monthly equivalent for yearly plan
- Highlight savings percentage

#### 4. CTA Button
- Action-oriented copy
- High contrast color
- Large, easy to tap (minimum 48px height)

#### 5. Trust Signals
- "Cancel anytime" text
- Restore purchases link
- Legal links (Terms, Privacy)

---

## Copy Guidelines

### Headlines (Choose One)

**Outcome-Focused:**
- "Achieve Your Goals Faster"
- "Turn Your Dreams Into Action"
- "Your Personal Success Coach"

**Value-Focused:**
- "Unlock Your Full Potential"
- "Get Unlimited Access"
- "Everything You Need to Succeed"

### Benefit Bullets

```
✓ Unlimited goal creation
✓ AI-powered personalized plans
✓ Daily motivation & smart reminders
✓ Detailed progress insights
✓ Priority support
```

### CTA Copy Options

**For Free Trial:**
- "Start My Free Trial" (recommended)
- "Try Free for 7 Days"
- "Start Free, Cancel Anytime"

**For Direct Purchase:**
- "Unlock All Features"
- "Get Started Now"
- "Continue with Pro"

**Avoid:**
- "Subscribe" (too transactional)
- "Buy now" (aggressive)
- "Continue" (vague)

### Trust Copy
```
Cancel anytime · No commitment
You won't be charged until your trial ends
```

---

## Pricing Strategy

### Recommended Price Points

| Plan | Price | Monthly Equivalent | Notes |
|------|-------|-------------------|-------|
| Yearly | $29.99/year | $2.49/month | Anchor price, best value |
| Monthly | $4.99/month | - | Higher flexibility |

### Price Anchoring
- Always show monthly equivalent for yearly plan
- Display "Save 50%" or similar discount badge
- Make yearly plan visually dominant

### Free Trial
- 7-day free trial recommended
- Clearly state when billing starts
- Frame as benefit: "Try all premium features free"

---

## Visual Design

### Color Palette (Goal Planner Theme)

```
Primary CTA: #2D5A3D (Forest Green)
Secondary: #F5F0E6 (Cream background)
Accent: #4A7C5C (Mint highlights)
Text Primary: #3D3024 (Bark brown)
Text Secondary: #8B7355 (Warm brown)
```

### Typography
- Headline: Bold, 24-28px
- Body: Regular, 16px
- Caption: Regular, 14px
- CTA Button: Bold, 18px

### Spacing
- Generous whitespace between sections
- Consistent padding (16-24px)
- Clear visual hierarchy

### Visual Elements
- Subtle rounded corners (12-16px)
- Soft shadows for depth
- Checkmark icons for benefits
- Badge for "Best Value" indicator

---

## Superwall Implementation

### Placement Configuration

The app currently uses one placement:

```typescript
// In availability.tsx
Superwall.shared.register({
  placement: 'create_goal',
  feature: async () => {
    // Runs after successful paywall conversion
  },
});
```

### Superwall Dashboard Setup

1. **Create Paywall Campaign**
   - Name: "Goal Creation Paywall"
   - Placement: `create_goal`
   - Status: Active

2. **Design the Paywall**
   - Use Superwall's visual editor
   - Apply the layout structure above
   - Match Goal Planner's color scheme

3. **Configure Products**
   - Add yearly product: `com.goalplanner.yearly`
   - Add monthly product: `com.goalplanner.monthly`
   - Set yearly as default/featured

4. **Add Variables**
   ```
   {{product.yearly.price}} - Full yearly price
   {{product.yearly.monthlyPrice}} - Monthly equivalent
   {{product.yearly.discount}} - Discount percentage
   {{product.monthly.price}} - Monthly price
   ```

### Additional Placements to Consider

| Placement | Trigger | Purpose |
|-----------|---------|---------|
| `create_goal` | Creating a goal | Primary conversion point |
| `goal_limit` | Hitting free goal limit | Contextual upgrade |
| `settings_upgrade` | Settings screen | Always visible upgrade path |
| `campaign_offer` | Special promotions | Seasonal offers |

---

## Compliance Checklist

### Apple App Store Requirements

- [ ] Clear pricing with billing frequency
- [ ] Trial duration clearly stated
- [ ] Auto-renewal terms visible
- [ ] "Cancel anytime" messaging
- [ ] Accessible Terms of Service link
- [ ] Accessible Privacy Policy link
- [ ] Restore purchases option
- [ ] No dark patterns or hidden skip buttons

### Required Legal Text

```
Payment will be charged to your Apple ID account at confirmation of purchase.
Subscription automatically renews unless canceled at least 24 hours before
the end of the current period. Your account will be charged for renewal
within 24 hours prior to the end of the current period.
```

---

## A/B Testing Ideas

### High Priority Tests

1. **Headline Variations**
   - A: "Achieve Your Goals Faster"
   - B: "Unlock Your Full Potential"
   - C: "Your Personal Success Coach"

2. **Plan Order**
   - A: Yearly first (default)
   - B: Monthly first
   - C: Single yearly plan only

3. **CTA Copy**
   - A: "Start My Free Trial"
   - B: "Try Free for 7 Days"
   - C: "Get Started Free"

4. **Trial Length**
   - A: 7-day trial
   - B: 3-day trial
   - C: 14-day trial

### Medium Priority Tests

5. **Number of Benefits**
   - A: 3 benefits
   - B: 4 benefits
   - C: 5 benefits

6. **Pricing Display**
   - A: Show both plans
   - B: Yearly only (monthly behind toggle)
   - C: Monthly prominent, yearly as upsell

7. **Discount Badge Style**
   - A: "Save 50%"
   - B: "Best Value"
   - C: "Most Popular"

---

## Metrics to Track

### Primary Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| CVR (Conversion Rate) | % of paywall views → subscribers | 2-4% |
| Trial Start Rate | % of paywall views → trial starts | 5-10% |
| Trial-to-Paid | % of trials → paid subscribers | 40-60% |

### Secondary Metrics

| Metric | Description |
|--------|-------------|
| 7-Day Cancellation Rate | Early churn indicator |
| Plan Split (Yearly/Monthly) | Revenue optimization |
| ARPU | Revenue per user |
| LTV | Lifetime value |

### Segmentation

Track metrics by:
- Country/region
- Traffic source (organic vs paid)
- Platform (iOS)
- User cohort (new vs returning)

---

## Resources

- [RevenueCat: Guide to Paywalls](https://www.revenuecat.com/blog/growth/guide-to-mobile-paywalls-subscription-apps/)
- [Apphud: High-Converting Paywall Design](https://apphud.com/blog/design-high-converting-subscription-app-paywalls)
- [Paywalls.com](https://paywalls.com) - Paywall inspiration gallery
- [Apple Subscription Guidelines](https://developer.apple.com/app-store/subscriptions/)
- [Superwall Documentation](https://docs.superwall.com)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-23 | 1.0 | Initial paywall design guide |
