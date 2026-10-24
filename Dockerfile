FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*
RUN npm i -g pnpm @earendil-works/pi-coding-agent
# web_search / fetch_content extension (writes to ~/.pi/agent settings)
RUN pi install npm:pi-web-access
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENV NODE_ENV=production DATA_DIR=/data
CMD ["pnpm", "start"]
