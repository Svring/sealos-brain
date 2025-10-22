# Stage 1: Build the Next.js app
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app
# Copy package.json and bun.lockb
COPY package.json bun.lockb ./
# Install dependencies with bun
RUN bun install
# Copy the rest of the project files
COPY . .
# Build the Next.js app (skip linting for Docker build)
RUN bun run build --turbopack

# Stage 2: Run the Next.js app
FROM oven/bun:1.1-alpine
WORKDIR /app
# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb ./bun.lockb
COPY --from=builder /app/public ./public
# Expose the port Next.js runs on (default: 3000)
EXPOSE 3000
# Set environment variables
ENV NODE_ENV=production
# Run the Next.js app with bun
CMD ["bun", "run", "start"]