import { describe, it, expect } from "vitest";
import { Aluno } from "./Aluno.js";
import { AppError } from "./AppError.js";

// Captura o erro lancado por uma funcao
function capturarErro(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
}

describe("Aluno", () => {
  it("remove espacos e normaliza o e-mail para minusculas", () => {
    const aluno = new Aluno({ nome: "  Ana Souza  ", email: " ANA@Email.com ", curso: " ADS " });

    expect(aluno.toData()).toEqual({
      nome: "Ana Souza",
      email: "ana@email.com",
      curso: "ADS",
    });
  });

  it("transforma curso vazio em null", () => {
    const aluno = new Aluno({ nome: "Ana", email: "ana@email.com", curso: "   " });

    expect(aluno.curso).toBeNull();
  });

  it("aceita aluno sem curso", () => {
    const aluno = new Aluno({ nome: "Ana", email: "ana@email.com" });

    expect(aluno.curso).toBeNull();
  });

  it("lanca erro 400 quando o nome esta vazio", () => {
    const erro = capturarErro(() => new Aluno({ nome: "", email: "ana@email.com" }));

    expect(erro).toBeInstanceOf(AppError);
    expect(erro.status).toBe(400);
    expect(erro.message).toBe("O campo nome é obrigatório.");
  });

  it("lanca erro 400 quando o e-mail e invalido", () => {
    const erro = capturarErro(() => new Aluno({ nome: "Ana", email: "ana-sem-arroba" }));

    expect(erro).toBeInstanceOf(AppError);
    expect(erro.status).toBe(400);
    expect(erro.message).toBe("Informe um e-mail válido.");
  });

  it("lanca erro 400 quando nenhum dado e informado", () => {
    const erro = capturarErro(() => new Aluno());

    expect(erro.status).toBe(400);
  });
});
