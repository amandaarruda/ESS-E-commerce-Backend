### Architecture
![diagram-export-28-07-2024-21_44_35](https://github.com/user-attachments/assets/28e2af4d-d4d8-4eea-9d5d-c370ac2d7536)

### Flow of validation
![diagram-export-28-07-2024-22_08_59](https://github.com/user-attachments/assets/0aa807fc-4d69-48b5-ac7d-4c12f5e4e501)

### Production 

URL: https://backend-nestjs.vctljts147ohu.us-east-1.cs.amazonlightsail.com/api/health

### Technologies Used
- **Node.js**: Version 20.11.0
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: An open-source database toolkit.

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
- Instale as dependências para as features de order e delivery

```
npm install @nestjs/axios nestjs-soap
```

### Como executar o projeto usando docker
- Execute o comando `make docker-build` para fazer build das imagens do container do backend.
- Execute o comando `make docker-start` para inicializar os containers do banco de dados e backend.
  > [!NOTE]
  > O Docker cria um volume para o banco de dados que salva os dados de forma persistente
- Execute o comando `make docker-sync` para rebuildar e reiniciar o container do backend (use para integrar mudanças no container).
- Execute o comando `make docker-fresh-start` para recriar o volume do banco de dados e reiniciar os containers.
  > [!CAUTION]
  > Este comando apaga todos os dados salvos no banco de dados

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
