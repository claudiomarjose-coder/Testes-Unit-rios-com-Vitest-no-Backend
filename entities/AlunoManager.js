import { Aluno } from "./Aluno.js";
import { AppError } from "./AppError.js";

// Gerencia os alunos usando o Prisma.
// O Prisma e recebido no construtor, o que facilita trocar por um mock nos testes.
export class AlunoManager {
  constructor(prisma) {
    this.prisma = prisma;
  }

  static validarId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new AppError(400, "ID inválido.");
    }
    return numero;
  }

  // Converte erros conhecidos do Prisma em erros HTTP
  static traduzirErro(err) {
    if (err?.code === "P2002") {
      return new AppError(409, "Já existe um aluno com esse e-mail.");
    }
    if (err?.code === "P2025") {
      return new AppError(404, "Aluno não encontrado.");
    }
    return err;
  }

  async criar(dados) {
    const data = new Aluno(dados).toData();
    try {
      return await this.prisma.aluno.create({ data });
    } catch (err) {
      throw AlunoManager.traduzirErro(err);
    }
  }

  async listar() {
    return this.prisma.aluno.findMany({ orderBy: { id: "asc" } });
  }

  async buscar(id) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id: AlunoManager.validarId(id) } });
    if (!aluno) {
      throw new AppError(404, "Aluno não encontrado.");
    }
    return aluno;
  }

  async atualizar(id, dados) {
    const idNumero = AlunoManager.validarId(id);
    const data = new Aluno(dados).toData();
    try {
      return await this.prisma.aluno.update({ where: { id: idNumero }, data });
    } catch (err) {
      throw AlunoManager.traduzirErro(err);
    }
  }

  async excluir(id) {
    const idNumero = AlunoManager.validarId(id);
    try {
      await this.prisma.aluno.delete({ where: { id: idNumero } });
    } catch (err) {
      throw AlunoManager.traduzirErro(err);
    }
  }
}
