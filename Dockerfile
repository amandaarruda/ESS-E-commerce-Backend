FROM node:20

WORKDIR /app

COPY package*.json .

RUN npm install
RUN npm i -g @nestjs/cli

COPY . .

EXPOSE 8080

CMD /bin/sh -c "npm run prisma:migrate && npm run start"
