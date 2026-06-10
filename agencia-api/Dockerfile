# ---- ETAPA 1: BUILD ----
# Usamos Node 20 en Alpine (versión ligera de Linux) como base para compilar
FROM node:20-alpine AS builder

# Definimos /app como el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos SOLO los archivos de dependencias primero
# Esto aprovecha el cache de Docker: si package.json no cambia, no reinstala todo
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo devDependencies como @nestjs/cli)
# npm ci es más estricto y rápido que npm install (usa package-lock.json exacto)
RUN npm ci

# Ahora sí copiamos el resto del código fuente
# Se hace después del npm ci para aprovechar el cache de Docker
COPY . .

# Compilamos TypeScript a JavaScript (genera la carpeta /app/dist)
# Equivale a ejecutar: nest build
RUN npm run build


# ---- ETAPA 2: RUNTIME (imagen final) ----
# Nueva imagen limpia, sin el código fuente ni devDependencies
# Esto hace que la imagen final sea mucho más pequeña
FROM node:20-alpine AS runner

# Directorio de trabajo en el contenedor final
WORKDIR /app

# Le decimos a Node y a las librerías que estamos en producción
# Activa optimizaciones de rendimiento y oculta stack traces en errores
ENV NODE_ENV=production

# Copiamos package.json para poder instalar dependencias de producción
COPY package*.json ./

# Instalamos SOLO las dependencias de producción (sin Jest, linters, @types, etc.)
# --omit=dev excluye todo lo que está en "devDependencies" del package.json
RUN npm ci --omit=dev

# Copiamos la carpeta dist compilada desde la ETAPA 1 (builder)
# Solo traemos el JavaScript ya compilado, no el TypeScript original
COPY --from=builder /app/dist ./dist


# Comando que se ejecuta cuando el contenedor arranca
# Corre directamente el archivo compilado (no usa nest start, más eficiente)
CMD ["node", "dist/main.js"]