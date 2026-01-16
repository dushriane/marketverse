# MarketVerse Monorepo

This repository is organized as a Node.js monorepo using npm workspaces.

## Structure

```
├── apps/
│   ├── frontend/          # React frontend
│   └── backend/           # Node.js backend
├── packages/              # Shared code
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Shared utilities
│   └── config/            # Shared configuration
├── docs/
├── .github/               # CI/CD workflows
└── package.json           # Root workspaces config
```

## Getting Started

Prerequisites:
- Node.js 18+ and npm 10+

Install workspace dependencies from the repo root:

```bash
npm install --workspaces
```

Build (placeholder):

```bash
npm run build --workspaces --if-present
```

Test (placeholder):

```bash
npm test --workspaces --if-present
```

## Running the Application

### 1. Install Dependencies
Run this from the root directory:
```bash
npm install --workspaces
```

### 2. Start Backend
Open a terminal and run:
```bash
npm start --workspace=@marketverse/backend
```
*Runs on http://localhost:3000*

### 3. Start Frontend
Open another terminal and run:
```bash
npm run dev --workspace=@marketverse/frontend
```
*Runs on http://localhost:5175*

## Features Implemented

### Vendor Onboarding & Profile
- **Login / Register**: Enter a phone number. If new, you are redirected to Onboarding.
- **Onboarding**: Select a market location to create your profile.
- **Profile Management**: Update your store name, description, operating hours, and contact info (WhatsApp/Phone).

### Tech Stack Configured
- **Frontend**: Vite + React + Tailwind + Zustand + React Hook Form + Zod
- **Backend**: Express + In-Memory Database + Zod
- **Shared**: Common TypeScript types in `@marketverse/types`

