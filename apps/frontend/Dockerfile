FROM node:18-alpine

WORKDIR /app

# Copy root workspace config
COPY package.json ./

# Copy source code
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN npm install

# Switch to frontend directory
WORKDIR /app/apps/frontend

EXPOSE 5173 3000

# Placeholder command until a real bundler (Vite/Webpack) is set up
CMD ["npm", "start"]
