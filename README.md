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
- Crie um arquivo .env
- Insira os dados do .env.example
- Modifique os valores
- Crie seu banco de dados usando o postgres
- Dentro do arquivo .env, na variável DATABASE_URL, altere os ambientes para o seu banco de dados
- Execute para iniciar o husky para pré commits e pré pushs
  ```
  npx husky install
  ```

<hr>


### Como executar o projeto

- Instale as dependências:

```bash
npm install
```

- Execute as migrações do banco de dados

```bash
npx prisma migrate dev
```

- Execute os seeds do banco de dados

```bash
npx prisma db seed
```

- Inicie a aplicação

```bash
npm run start:dev
```

or

```bash
npm start
```

<hr>

#### Seed da conta base de administrador

Conta criada pelo seed do prisma

<b>E-mail:</b> admin@gmail.com

<b>Senha:</b> admin

<hr>

### Swagger

Aqui está toda a documentação dos endpoints

    localhost:PORT/api/docs/#

### Variaveis de ambiente

Configuração JWT

- AT_SECRET: Segredo usado para gerar e verificar tokens de acesso.

-RT_SECRET: Segredo usado para gerar e verificar tokens de atualização.
 
- TK_EMAIL_SECRET: Segredo usado para gerar e verificar tokens de email.

- TK_EMAIL_LIFETIME: Tempo de vida dos tokens de email.

expresso em segundos ou uma string descrevendo um intervalo de tempo zeit/ms. Ex: 60, "2 dias", "10h", "7d"

- JWT_ACCESS_LIFETIME: Tempo de vida dos tokens de acesso JWT.

expresso em segundos ou uma string descrevendo um intervalo de tempo zeit/ms. Ex: 60, "2 dias", "10h", "7d"

- JWT_REFRESH_LIFETIME: Tempo de vida dos tokens de atualização JWT.

expresso em segundos ou uma string descrevendo um intervalo de tempo zeit/ms. Ex: 60, "2 dias", "10h", "7d"

Aplicação

- ENV: Ambiente de execução da aplicação ("DEV" para desenvolvimento ou "TEST" para teste).

- APP_PORT: Porta na qual a aplicação será executada (base 3333).

- FRONTEND_RECOVER_PASSWORD_URL: URL do frontend para recuperação de senha.

- FRONT_END_URL: URL de acesso ao frontend.

Banco de dados

- DATABASE_URL: Esta variável contém a URL para conectar ao banco de dados PostgreSQL. Ela especifica o nome de usuário, senha, host, porta e nome do banco de dados que a aplicação deve usar para se conectar ao banco de dados.
  
Enviar E-mail

- SENDGRID_API_KEY: Chave da API do SendGrid para enviar emails.
- EMAIL_OPTIONS_FROM: Endereço de email que será usado como remetente para enviar emails.
