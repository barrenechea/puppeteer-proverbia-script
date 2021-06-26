FROM node:14.17.1-alpine as build-stage

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV APPDIR /usr/src/app
WORKDIR $APPDIR

COPY ./src $APPDIR/src
COPY ./typings $APPDIR/typings
COPY ./tsconfig.json $APPDIR/tsconfig.json
COPY ./package.json $APPDIR/package.json
COPY ./package-lock.json $APPDIR/package-lock.json

RUN npm ci --no-optional

RUN npm run build

# Deploy
FROM node:14.17.1-alpine

RUN apk add --no-cache chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV BUILDDIR /usr/src/app
ENV APPDIR /usr/src/app

RUN mkdir -p $APPDIR && chown -R node:node $APPDIR
WORKDIR $APPDIR

COPY --from=build-stage --chown=node:node $BUILDDIR/dist $APPDIR/dist
COPY --chown=node:node ./package.json $APPDIR/package.json
COPY --chown=node:node ./package-lock.json $APPDIR/package-lock.json

RUN npm ci --production --no-optional

USER node
CMD [ "npm", "start" ]
