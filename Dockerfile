FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

RUN bun install

COPY ./src ./src/
COPY ./public ./public
COPY bunfig.toml .
COPY ./postcss.config.js .
COPY ./tailwind.config.js .
COPY ./tsconfig.json .

ENV NODE_ENV=production
EXPOSE 3000

RUN ls

CMD ["bun", "run", "start"]
