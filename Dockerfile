# Imagem base com Node.js
FROM node:20-slim

# O Prisma precisa do OpenSSL no Linux
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala as dependencias primeiro (aproveita o cache de camadas do Docker)
COPY package*.json ./
RUN npm install

# Gera o Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copia o codigo da API
COPY entities ./entities
COPY app.js server.js prismaClient.js ./

EXPOSE 3000

# Aplica as migracoes no banco e inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
