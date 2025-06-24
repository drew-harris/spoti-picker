FROM oven/bun:latest

WORKDIR /app

# Install Python and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY bun.lock ./

RUN bun install


COPY ./src ./src/
COPY ./public ./public
COPY bunfig.toml .
COPY ./postcss.config.js .
COPY ./tailwind.config.js .
COPY ./tsconfig.json .
COPY ./drizzle/ ./drizzle/

ENV NODE_ENV=production
EXPOSE 3000

RUN ls

CMD ["bun", "run", "start"]
