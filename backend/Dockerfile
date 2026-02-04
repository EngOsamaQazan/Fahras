FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
    && npm install

COPY . .
RUN npm run prisma:generate

EXPOSE 4000
CMD ["npm", "run", "dev"]
