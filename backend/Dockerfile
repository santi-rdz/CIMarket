FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

WORKDIR /app

EXPOSE 8000

CMD ["sh", "-c", "pnpm install && pnpm run prisma:generate && pnpm run db:push && pnpm run db:seed && pnpm run dev"]
