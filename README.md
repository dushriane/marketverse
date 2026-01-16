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

## CI

Basic CI is configured in `.github/workflows/ci.yml` to install, build, and test all workspaces.
