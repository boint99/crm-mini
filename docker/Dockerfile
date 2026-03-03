
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY prisma ./

RUN npm install

RUN npx prisma generate

COPY . .

EXPOSE 8017

CMD ["npm", "prisma", "migrate" && "npm", "run", "dev"]