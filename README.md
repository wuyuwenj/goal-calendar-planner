# Trellis - AI Goal Planner

> An AI-powered mobile app that turns your goals into personalized, progressive weekly plans.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-4-000000?logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Google-4285F4?logo=google&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

---

## Screenshots

### Onboarding Flow

Set your goal, assess your current level, configure availability, and let AI build your plan.

<p align="center">
  <!-- Replace with your own screenshots -->
  <img src="./assets/screenshots/onboarding-1.png" width="180" alt="Onboarding - Welcome" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/onboarding-2.png" width="180" alt="Onboarding - Goal Input" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/onboarding-3.png" width="180" alt="Onboarding - Skill Level" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/onboarding-4.png" width="180" alt="Onboarding - Availability" />
</p>

### Dashboard & Tasks

Track your weekly progress, swipe tasks to complete, and view your goal at a glance.

<p align="center">
  <!-- Replace with your own screenshots -->
  <img src="./assets/screenshots/dashboard-1.png" width="180" alt="Dashboard" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/dashboard-2.png" width="180" alt="Weekly Tasks" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/dashboard-3.png" width="180" alt="Task Cards" />
</p>

### Task Detail View

Tap any task for a detailed explanation, curated resources, and helpful links.

<p align="center">
  <!-- Replace with your own screenshots -->
  <img src="./assets/screenshots/task-detail-1.png" width="180" alt="Task Detail" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/task-detail-2.png" width="180" alt="Task Resources" />
</p>

### Weekly Check-in

Report your progress each week — the AI adjusts your upcoming plan based on how you did.

<p align="center">
  <!-- Replace with your own screenshots -->
  <img src="./assets/screenshots/checkin-1.png" width="180" alt="Check-in - Progress Report" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/checkin-2.png" width="180" alt="Check-in - Plan Adjustment" />
</p>

---

## Features

**AI-Powered Planning**
- Generates personalized weekly plans using Google Gemini with multi-model rotation
- Progressive difficulty scaling — starts at foundation level (30-40%) and ramps to peak (90-100%)
- Self-improving RAG knowledge system that caches expert information for faster, richer plans

**Task Management**
- Swipeable task cards with completion animations
- Tap any task for detailed explanations, resources, and links
- Track completion across weeks with visual progress indicators

**Smart Scheduling**
- Syncs tasks to Google Calendar with proper time slots
- Schedules around your weekly availability preferences
- Timezone-aware scheduling

**Weekly Check-ins**
- Report task completion each week
- AI analyzes your progress and adjusts the next week's plan accordingly
- Keeps you on track with adaptive difficulty

**Subscription & Monetization**
- In-app purchases via Apple App Store
- Geo-localized pricing for 150+ countries
- 7-day free trial

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Mobile** | React Native, Expo, Expo Router, Zustand, NativeWind, react-native-iap |
| **Backend** | Node.js, Fastify, Prisma, PostgreSQL |
| **AI** | Google Gemini (multi-model rotation), Anthropic Claude |
| **Auth** | Supabase Auth (email/password, Google OAuth) |
| **Integrations** | Google Calendar API, Brave Search API, Svix Webhooks |
| **Support Site** | Next.js, Tailwind CSS |

---

## Architecture

```
trellis/
├── goal-planner-mobile/    React Native / Expo mobile app
│   ├── app/                File-based routing (Expo Router)
│   ├── components/         Reusable UI components
│   ├── store/              Zustand state management
│   └── hooks/              Custom React hooks
│
├── goal-planner-backend/   Fastify REST API
│   ├── routes/             API endpoints (goals, tasks, check-ins, calendar)
│   ├── services/           Business logic (AI generation, planning, knowledge)
│   ├── middleware/          Auth & logging
│   ├── knowledge/          RAG knowledge base (cached JSON)
│   └── prisma/             Database schema & migrations
│
└── support-page/           Next.js support / landing page
```

---

<p align="center">Built by <a href="https://github.com/YOUR_GITHUB_USERNAME">Your Name</a></p>
