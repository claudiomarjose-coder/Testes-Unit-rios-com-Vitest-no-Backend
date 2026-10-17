import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { criarApp } from "./app.js";
import { AlunoManager } from "./entities/AlunoManager.js";
import { AppError } from "./entities/AppError.js";

// Gerenciador falso (mock): testa so as rotas, sem banco e sem regras de negocio
function criarManagerMock() {
  return {
    criar: vi.fn(),
    listar: vi.fn(),
    buscar: vi.fn(),
    atualizar: vi.fn(),
    excluir: vi.fn(),
  };
}

let manager;
let app;

beforeEach(() => {
  manager = criarManagerMock();
  app = criarApp(manager);
});

describe("GET /health", () => {
  it("responde 200 com status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /alunos", () => {
  it("cadastra um aluno e responde 201", async () => {
    manager.criar.mockResolvedValue({ id: 1, nome: "Ana", email: "ana@email.com", curso: "ADS" });

    const res = await request(app)
      .post("/alunos")
      .send({ nome: "Ana", email: "ana@email.com", curso: "ADS" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
    expect(manager.criar).toHaveBeenCalledWith({ nome: "Ana", email: "ana@email.com", curso: "ADS" });
  });

  it("responde com o status do AppError (400)", async () => {
    manager.criar.mockRejectedValue(new AppError(400, "O campo nome é obrigatório."));

    const res = await request(app).post("/alunos").send({ email: "ana@email.com" });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("O campo nome é obrigatório.");
  });

  it("responde 409 quando o e-mail ja esta cadastrado", async () => {
    manager.criar.mockRejectedValue(new AppError(409, "Já existe um aluno com esse e-mail."));

    const res = await request(app).post("/alunos").send({ nome: "Ana", email: "ana@email.com" });

    expect(res.status).toBe(409);
  });

  it("responde 400 quando o JSON enviado e invalido", async () => {
    const res = await request(app)
      .post("/alunos")
      .set("Content-Type", "application/json")
      .send("{json-quebrado");

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe("JSON inválido.");
  });

  it("responde 500 quando acontece um erro inesperado", async () => {
    const espiao = vi.spyOn(console, "error").mockImplementation(() => {});
    manager.criar.mockRejectedValue(new Error("falha no banco"));

    const res = await request(app).post("/alunos").send({ nome: "Ana", email: "ana@email.com" });

    expect(res.status).toBe(500);
    expect(res.body.erro).toBe("Erro interno do servidor.");
    espiao.mockRestore();
  });
});

describe("GET /alunos", () => {
  it("lista os alunos", async () => {
    manager.listar.mockResolvedValue([{ id: 1, nome: "Ana" }, { id: 2, nome: "Bruno" }]);

    const res = await request(app).get("/alunos");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /alunos/:id", () => {
  it("retorna o aluno encontrado", async () => {
    manager.buscar.mockResolvedValue({ id: 1, nome: "Ana" });

    const res = await request(app).get("/alunos/1");

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Ana");
    expect(manager.buscar).toHaveBeenCalledWith("1");
  });

  it("responde 404 quando o aluno nao existe", async () => {
    manager.buscar.mockRejectedValue(new AppError(404, "Aluno não encontrado."));

    const res = await request(app).get("/alunos/99");

    expect(res.status).toBe(404);
  });
});

describe("PUT /alunos/:id", () => {
  it("atualiza o aluno", async () => {
    manager.atualizar.mockResolvedValue({ id: 1, nome: "Ana Maria" });

    const res = await request(app).put("/alunos/1").send({ nome: "Ana Maria", email: "ana@email.com" });

    expect(res.status).toBe(200);
    expect(manager.atualizar).toHaveBeenCalledWith("1", { nome: "Ana Maria", email: "ana@email.com" });
  });
});

describe("DELETE /alunos/:id", () => {
  it("exclui o aluno e responde 204", async () => {
    manager.excluir.mockResolvedValue();

    const res = await request(app).delete("/alunos/1");

    expect(res.status).toBe(204);
    expect(manager.excluir).toHaveBeenCalledWith("1");
  });

  it("responde 404 quando o aluno nao existe", async () => {
    manager.excluir.mockRejectedValue(new AppError(404, "Aluno não encontrado."));

    const res = await request(app).delete("/alunos/99");

    expect(res.status).toBe(404);
  });
});

describe("rotas inexistentes", () => {
  it("responde 404 para uma rota desconhecida", async () => {
    const res = await request(app).get("/rota-que-nao-existe");

    expect(res.status).toBe(404);
  });
});

// Teste de integracao: rotas + AlunoManager reais, apenas o Prisma e falso
describe("app com AlunoManager real (Prisma mockado)", () => {
  it("responde 400 e nao chama o banco quando falta o nome", async () => {
    const prisma = { aluno: { create: vi.fn() } };
    const appReal = criarApp(new AlunoManager(prisma));

    const res = await request(appReal).post("/alunos").send({ email: "ana@email.com" });

    expect(res.status).toBe(400);
    expect(prisma.aluno.create).not.toHaveBeenCalled();
  });

  it("responde 400 quando o ID da URL nao e numerico", async () => {
    const prisma = { aluno: { findUnique: vi.fn() } };
    const appReal = criarApp(new AlunoManager(prisma));

    const res = await request(appReal).get("/alunos/abc");

    expect(res.status).toBe(400);
    expect(prisma.aluno.findUnique).not.toHaveBeenCalled();
  });
});
