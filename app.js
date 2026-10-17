import express from "express";
import { AppError } from "./entities/AppError.js";

// Repassa erros de funcoes async para o tratador de erros do Express
const tratar = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

// Cria a aplicacao Express recebendo o gerenciador de alunos.
// Assim os testes podem usar um gerenciador falso (mock) no lugar do banco.
export function criarApp(alunoManager) {
  const app = express();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/alunos", tratar(async (req, res) => {
    res.status(201).json(await alunoManager.criar(req.body));
  }));

  app.get("/alunos", tratar(async (req, res) => {
    res.json(await alunoManager.listar());
  }));

  app.get("/alunos/:id", tratar(async (req, res) => {
    res.json(await alunoManager.buscar(req.params.id));
  }));

  app.put("/alunos/:id", tratar(async (req, res) => {
    res.json(await alunoManager.atualizar(req.params.id, req.body));
  }));

  app.delete("/alunos/:id", tratar(async (req, res) => {
    await alunoManager.excluir(req.params.id);
    res.status(204).send();
  }));

  // Rota inexistente
  app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
  });

  // Tratamento central de erros
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      return res.status(err.status).json({ erro: err.message });
    }
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ erro: "JSON inválido." });
    }
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor." });
  });

  return app;
}
