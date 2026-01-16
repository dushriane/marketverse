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

# Switch to backend directory
WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "start"]
