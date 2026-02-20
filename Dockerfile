# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files from backend directory to container root
COPY backend/package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code from backend directory to container root
COPY backend/ .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
