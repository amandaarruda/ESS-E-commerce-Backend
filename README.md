### Technologies Used
- **Node.js**: Version 20.11.0
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: An open-source database toolkit.
- **Python**: Version 3.11.7, used for generating modules.

<hr>

### Recommended VSCode Extensions

- Prisma
- Eslint
- Docker
- NestJS Files

<hr>

### Getting Started
- Run 
  ``` bash
  npm i -g @nestjs/cli
  ```
- Create a .env
- Enter data from .env.example
- Modify the values
- Create your database using postgres
- Inside `.env` in the variable `DATABASE_URL` change the environments for your database
- Run to startup the husky for pre commits and pre pushs
  ```
  npx husky install
  ```

<hr>


### How to run the project

- Install dependencies:

```bash
npm install
```

- Run database migrations

```bash
npx prisma migrate dev
```

- Run database seeds

```bash
npx prisma db seed
```

- Start the application

```bash
npm run start:dev
```

or

```bash
npm start
```

<hr>

#### Seed base account

Account created by prisma seed

<b>Email:</b> admin@gmail.com

<b>Password:</b> admin

<hr>

### Swagger

There are all documentation of the end points

    localhost:PORT/api/docs/#

### Environment Variables

JWT Configuration

- AT_SECRET: Secret used to generate and verify access tokens.

- RT_SECRET: Secret used to generate and verify refresh tokens.

- TK_EMAIL_SECRET: Secret used to generate and verify email tokens.

- TK_EMAIL_LIFETIME: Lifetime of email tokens.

  expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"

- JWT_ACCESS_LIFETIME: Lifetime of JWT access tokens. 

  expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"

- JWT_REFRESH_LIFETIME: Lifetime of JWT refresh tokens.

  expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"

Application

- ENV: Application execution environment ("DEV" for development or "TEST" for testing).

- APP_PORT: Port on which the application will run ( base 3333 ).

- FRONTEND_RECOVER_PASSWORD_URL: Frontend URL for password recovery.

- FRONT_END_URL: FrontEnd URL access.

Databases

- DATABASE_URL: This variable contains the URL to connect to the PostgreSQL database. It specifies the username, password, host, port, and database name that the application should use to connect to the database.

Used to send emails

- SENDGRID_API_KEY: SendGrid API key for sending emails.
- EMAIL_OPTIONS_FROM: Email address that will be used as the sender for sending emails.

<hr>
