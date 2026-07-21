
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install


RUN npx prisma generate

COPY . .

EXPOSE 8017

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]