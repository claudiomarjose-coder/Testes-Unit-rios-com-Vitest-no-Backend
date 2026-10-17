# testesunitarios_node_vitest

API de alunos em Node.js com Express, Prisma e PostgreSQL (Docker), com testes automatizados usando Vitest e Supertest (Aulas 7 e 8).

## Estrutura

```
testesunitarios_node_vitest/
├── entities/
│   ├── Aluno.js               # classe Aluno (valida e normaliza os dados)
│   ├── AlunoManager.js        # classe que gerencia os alunos usando o Prisma
│   ├── AppError.js            # erro com código HTTP
│   ├── aluno.test.js          # testes unitários da classe Aluno
│   └── alunomanager.test.js   # testes do AlunoManager (Prisma mockado)
├── prisma/
│   ├── schema.prisma          # modelo Aluno
│   └── migrations/            # migração inicial (cria a tabela alunos)
├── app.js                     # rotas do Express (criarApp)
├── app.test.js                # testes de rotas com Supertest
├── server.js                  # inicia o servidor
├── prismaClient.js            # instância do Prisma Client
├── Dockerfile
├── docker-compose.yml
├── vitest.config.js
└── package.json
```

Os testes ficam ao lado dos arquivos que testam. A pasta `coverage` é criada ao rodar o relatório de cobertura.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está no ar |
| POST | `/alunos` | Cadastra um aluno (`nome`, `email`, `curso` opcional) |
| GET | `/alunos` | Lista todos os alunos |
| GET | `/alunos/:id` | Busca um aluno pelo ID |
| PUT | `/alunos/:id` | Atualiza um aluno |
| DELETE | `/alunos/:id` | Exclui um aluno |

## Aula 7: rodando com Docker

Com o Docker Desktop aberto, na pasta do projeto:

```bash
docker compose up -d --build
```

Isso sobe dois serviços na mesma rede (`app_network`):

- **db**: PostgreSQL 16, com os dados salvos no volume `postgres_data`;
- **api**: a API Node.js, que aplica a migração e inicia na porta 3000.

Teste a conexão (PowerShell):

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod -Method Post -Uri http://localhost:3000/alunos -ContentType "application/json" -Body '{"nome":"Ana","email":"ana@email.com","curso":"ADS"}'
Invoke-RestMethod http://localhost:3000/alunos
```

Para parar: `docker compose down` (os dados continuam no volume; use `docker compose down -v` para apagá-los também).

> O banco fica exposto na porta **5433** do computador para não conflitar com um PostgreSQL local na 5432.

## Aula 8: testes

```bash
npm install
npm test                 # executa os testes
npm run test:coverage    # executa os testes com relatório de cobertura
```

Os testes não precisam de banco nem de Docker: o Prisma e o gerenciador de alunos são substituídos por mocks (`vi.fn()`).

- **Testes unitários** (`entities/`): a classe `Aluno` e o `AlunoManager` com o Prisma mockado.
- **Testes de rotas** (`app.test.js`): usam o Supertest para chamar a API e conferir status e respostas (201, 400, 404, 409 e 500).

## Tecnologias

Node.js, Express, Prisma ORM, PostgreSQL, Docker e Docker Compose, Vitest e Supertest.
