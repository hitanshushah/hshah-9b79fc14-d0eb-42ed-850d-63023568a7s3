# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json jest.config.ts jest.preset.js tsconfig.base.json ./
COPY apps/api ./apps/api
COPY libs ./libs

RUN npm install --legacy-peer-deps

RUN npx nx build api --configuration=production

# Run stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/api/main.js"]
