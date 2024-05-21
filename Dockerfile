# ---
FROM node:22-alpine AS dev-deps
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---
FROM node:22-alpine AS prd-deps
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=dev-deps /app/node_modules ./node_modules
RUN npm prune --omit=dev --omit=optional

# ---
FROM node:22-alpine as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV APPDIR /app
WORKDIR $APPDIR

COPY . .
COPY --from=dev-deps /app/node_modules ./node_modules

RUN npm run build

# ---
FROM node:22-alpine as runner

RUN apk add --no-cache chromium

ENV NODE_ENV production
ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV APPDIR /app

RUN mkdir -p $APPDIR && chown -R node:node $APPDIR
WORKDIR $APPDIR

COPY --from=prd-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node
CMD [ "node", "dist/index.js" ]
