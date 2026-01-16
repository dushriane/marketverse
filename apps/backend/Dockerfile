FROM node:18-alpine

WORKDIR /app

# Copy root workspace config
COPY package.json ./

# Copy source code (this is a simple approach for development)
# For production, you'd likely use a multi-stage build and filter specific packages
COPY packages ./packages
COPY apps/backend ./apps/backend

# Install dependencies
RUN npm install

# Build shared packages
RUN npm run build -w packages/types

# Build backend
RUN npm run build -w apps/backend

# Switch to backend directory
WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "start"]
