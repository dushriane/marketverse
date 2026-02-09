FROM node:18-alpine

WORKDIR /app

# Install OpenSSL
RUN apk add --no-cache openssl

# Optimize Build Layer: Copy only dependency definitions first
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install dependencies (utilizing cache if package.jsons haven't changed)
RUN npm ci

# Copy source code
COPY packages ./packages
COPY apps/backend ./apps/backend

# Generate Prisma Client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build Shared Packages & Backend
RUN npm run build -w packages/types
RUN npm run build -w apps/backend

# Set working directory to backend
WORKDIR /app/apps/backend

EXPOSE 5000

CMD ["npm", "start"]
