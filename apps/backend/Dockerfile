FROM node:18-alpine

WORKDIR /app

#Install OpenSSL
RUN apk update && \
    apk add --no-cache openssl

# Copy root workspace config
COPY package.json ./

# For production, you'd likely use a multi-stage build and filter specific packages
COPY packages ./packages
COPY apps/backend ./apps/backend
COPY apps/backend/prisma ./apps/backend/prisma

# Install dependencies
RUN npm install

# Build shared packages
RUN npm run build -w packages/types

# This allows the 'npm run build' step to succeed
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build backend
RUN npm run build -w apps/backend

# Switch to backend directory
WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "start"]
