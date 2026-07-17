# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm --prefix packages/shared install
RUN npm --prefix apps/api install

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package and api
RUN npm --prefix packages/shared run build
RUN npm --prefix apps/api run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy built code from builder
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api

# Switch context to API app
WORKDIR /app/apps/api

# Install production dependencies only
RUN npm prune --production

# Expose port 7860
EXPOSE 7860

ENV PORT=7860
ENV NODE_ENV=production

CMD ["npm", "start"]
