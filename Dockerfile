# Development
FROM node:18-alpine AS development

WORKDIR /app

# Copy project files
COPY ./src ./src
COPY ./test ./test
COPY .eslintrc.json ./
COPY .prettierrc ./
COPY nodemon.json ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install PNPM and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Production
FROM node:18-alpine AS production

WORKDIR /app

COPY ./src ./src
COPY ./test ./test
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY docker-entrypoint.sh ./

RUN npm install -g pnpm
RUN pnpm install --prod

EXPOSE 8080

CMD ["./docker-entrypoint.sh"]
