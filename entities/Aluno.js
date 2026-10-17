import { AppError } from "./AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Representa um aluno ja validado e normalizado
export class Aluno {
  constructor({ nome, email, curso } = {}) {
    const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
    const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!nomeLimpo) {
      throw new AppError(400, "O campo nome é obrigatório.");
    }
    if (!emailLimpo || !EMAIL_REGEX.test(emailLimpo)) {
      throw new AppError(400, "Informe um e-mail válido.");
    }

    this.nome = nomeLimpo;
    this.email = emailLimpo;
    this.curso = typeof curso === "string" && curso.trim() ? curso.trim() : null;
  }

  // Dados prontos para serem gravados pelo Prisma
  toData() {
    return { nome: this.nome, email: this.email, curso: this.curso };
  }
}
