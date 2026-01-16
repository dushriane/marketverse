FROM node:18-alpine

WORKDIR /app

# Copy root workspace config
COPY package.json ./

# Copy source code
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN npm install

# Build shared types (frontend needs them for type checking, though Vite can transpile without them built if configured, but safe to build)
RUN npm run build -w packages/types

# Switch to frontend directory
WORKDIR /app/apps/frontend

EXPOSE 5175

# Run Vite in dev mode with host exposed
CMD ["npm", "run", "dev", "--", "--host"]
