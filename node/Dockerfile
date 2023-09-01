FROM node:20.5 AS base

WORKDIR /app

COPY node/package.json ./
COPY node/yarn.lock ./

RUN yarn install

FROM base as build

WORKDIR /app

COPY node/.husky \
    node/.sequelizerc \
    node/babel.config.json \
    node/webpack.config.js \
    node/bin/start.sh ./
COPY node/src ./src

RUN NODE_ENV=dev yarn build

FROM node:20.5-slim

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/start.sh ./

RUN chmod +x dist/main.js && \
    chmod +x start.sh && \
    chmod +x src/db/migrator.js

RUN apt-get update && apt-get install -y netcat-traditional

ENTRYPOINT [ "./start.sh" ]