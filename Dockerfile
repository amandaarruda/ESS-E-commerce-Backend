FROM node:20-alpine

WORKDIR /app

COPY dist/ ./dist
COPY package.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma

# Templates HTML
COPY src/utils/templates/recover-password.html /app/src/utils/templates/
COPY src/utils/templates/registration.html /app/src/utils/templates/

RUN npm install

EXPOSE 3333

CMD ["npm", "run", "prisma:start:deploy"]
