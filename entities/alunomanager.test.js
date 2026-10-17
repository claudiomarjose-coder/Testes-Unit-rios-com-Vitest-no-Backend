import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlunoManager } from "./AlunoManager.js";

// Prisma falso (mock): nenhum teste aqui acessa o banco de verdade
function criarPrismaMock() {
  return {
    aluno: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

let prisma;
let manager;

beforeEach(() => {
  prisma = criarPrismaMock();
  manager = new AlunoManager(prisma);
});

describe("AlunoManager.criar", () => {
  it("envia os dados normalizados para o Prisma", async () => {
    prisma.aluno.create.mockResolvedValue({ id: 1, nome: "Ana", email: "ana@email.com", curso: null });

    const aluno = await manager.criar({ nome: " Ana ", email: "ANA@email.com" });

    expect(prisma.aluno.create).toHaveBeenCalledWith({
      data: { nome: "Ana", email: "ana@email.com", curso: null },
    });
    expect(aluno.id).toBe(1);
  });

  it("nao acessa o banco quando os dados sao invalidos", async () => {
    await expect(manager.criar({ nome: "", email: "x@x.com" })).rejects.toMatchObject({ status: 400 });

    expect(prisma.aluno.create).not.toHaveBeenCalled();
  });

  it("retorna 409 quando o e-mail ja existe (erro P2002)", async () => {
    prisma.aluno.create.mockRejectedValue({ code: "P2002" });

    await expect(manager.criar({ nome: "Ana", email: "ana@email.com" })).rejects.toMatchObject({
      status: 409,
    });
  });

  it("repassa erros desconhecidos sem alterar", async () => {
    const erro = new Error("falha no banco");
    prisma.aluno.create.mockRejectedValue(erro);

    await expect(manager.criar({ nome: "Ana", email: "ana@email.com" })).rejects.toBe(erro);
  });
});

describe("AlunoManager.listar", () => {
  it("retorna a lista do banco", async () => {
    const lista = [{ id: 1, nome: "Ana" }, { id: 2, nome: "Bruno" }];
    prisma.aluno.findMany.mockResolvedValue(lista);

    expect(await manager.listar()).toEqual(lista);
  });
});

describe("AlunoManager.buscar", () => {
  it("retorna o aluno encontrado", async () => {
    prisma.aluno.findUnique.mockResolvedValue({ id: 5, nome: "Carla" });

    const aluno = await manager.buscar("5");

    expect(prisma.aluno.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(aluno.nome).toBe("Carla");
  });

  it("lanca 404 quando o aluno nao existe", async () => {
    prisma.aluno.findUnique.mockResolvedValue(null);

    await expect(manager.buscar(99)).rejects.toMatchObject({ status: 404 });
  });

  it("lanca 400 quando o ID e invalido", async () => {
    await expect(manager.buscar("abc")).rejects.toMatchObject({ status: 400 });

    expect(prisma.aluno.findUnique).not.toHaveBeenCalled();
  });
});

describe("AlunoManager.atualizar", () => {
  it("atualiza e retorna o aluno", async () => {
    prisma.aluno.update.mockResolvedValue({ id: 1, nome: "Ana Maria", email: "ana@email.com", curso: null });

    const aluno = await manager.atualizar(1, { nome: "Ana Maria", email: "ana@email.com" });

    expect(prisma.aluno.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { nome: "Ana Maria", email: "ana@email.com", curso: null },
    });
    expect(aluno.nome).toBe("Ana Maria");
  });

  it("retorna 404 quando o aluno nao existe (erro P2025)", async () => {
    prisma.aluno.update.mockRejectedValue({ code: "P2025" });

    await expect(manager.atualizar(9, { nome: "Ana", email: "ana@email.com" })).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("AlunoManager.excluir", () => {
  it("exclui o aluno pelo ID", async () => {
    prisma.aluno.delete.mockResolvedValue({ id: 3 });

    await manager.excluir("3");

    expect(prisma.aluno.delete).toHaveBeenCalledWith({ where: { id: 3 } });
  });

  it("retorna 404 quando o registro nao existe (erro P2025)", async () => {
    prisma.aluno.delete.mockRejectedValue({ code: "P2025" });

    await expect(manager.excluir(10)).rejects.toMatchObject({ status: 404 });
  });
});
