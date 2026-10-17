import { criarApp } from "./app.js";
import { AlunoManager } from "./entities/AlunoManager.js";
import prisma from "./prismaClient.js";

const PORT = process.env.PORT || 3000;

const app = criarApp(new AlunoManager(prisma));

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
