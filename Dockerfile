FROM node:20

WORKDIR /app

COPY package*.json .

RUN npm install
RUN npm i -g @nestjs/cli

COPY prisma prisma
RUN npx prisma generate

COPY . .

EXPOSE 8080

CMD /bin/sh -c "npm run prisma:migrate && npm run prisma:seed && npm run start"
