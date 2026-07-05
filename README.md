# Carro & Casa Landing

Landing page institucional premium da Carro & Casa, com painel administrativo simples para manter textos, imagens, carrossel, marcas, categorias, FAQ, páginas legais, SEO e contatos.

Este projeto é apenas a landing institucional. O futuro SaaS deve ficar em outro projeto/repositório e será acessado por um botão opcional configurável.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Auth.js com login por credenciais
- Upload local persistente para VPS/Docker
- Zod para validação

## Rotas

- `/` landing pública
- `/faq` FAQ completo
- `/termos-de-uso` termos editáveis
- `/privacidade` política editável
- `/admin/login` login administrativo
- `/admin` painel protegido

## Configuração Local

1. Instale dependências:

```bash
npm install
```

2. Copie as variáveis:

```bash
cp .env.example .env
```

3. Ajuste no `.env`:

```env
POSTGRES_PASSWORD="troque-por-uma-senha-forte"
DATABASE_URL="postgresql://carro_casa:troque-por-uma-senha-forte@localhost:5432/carro_casa?schema=public"
AUTH_SECRET="uma-chave-segura-com-32-caracteres-ou-mais"
ADMIN_SEED_EMAIL="admin@lojacarroecasa.com.br"
ADMIN_SEED_PASSWORD="troque-esta-senha"
UPLOAD_DIR="./uploads"
GOOGLE_PLACES_API_KEY=""
GOOGLE_PLACE_ID=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="https://lojacarroecasa.com.br/api/google/callback"
```

4. Suba um PostgreSQL local ou use Docker:

```bash
docker compose up -d db
```

5. Rode migrações e seed:

```bash
npm run db:deploy
npm run db:seed
```

6. Rode em desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:3000/admin/login` com o e-mail e senha definidos no `.env`.

## Deploy VPS/Docker

Guia operacional com deploy, backup, SSL e DNS: [docs/OPERACAO-VPS.md](docs/OPERACAO-VPS.md).

Layout recomendado na VPS, mantendo o projeto separado de outros sistemas:

```text
/srv/apps/carro-e-casa/
  app/
  data/
  backups/
  ops/
```

O `docker-compose.yml` publica a aplicação apenas em `127.0.0.1:3001` por padrão. O PostgreSQL fica somente na rede Docker, sem porta aberta no host. O Nginx deve fazer proxy para `http://127.0.0.1:3001`.

1. Clone o repositório em `/srv/apps/carro-e-casa/app`.
2. Crie `.env` no servidor com valores de produção. Use senhas e secrets novos, não reaproveite os exemplos.
3. Suba banco e aplicação:

```bash
docker compose up -d --build
```

4. Aplique migrações e seed dentro do container:

```bash
docker compose exec web npm run db:deploy
docker compose exec web npm run db:seed
```

Uploads ficam no volume `uploads_data`, montado em `/app/uploads`.

## Scripts

- `npm run dev` inicia o Next em desenvolvimento
- `npm run build` gera build de produção
- `npm run start` inicia produção
- `npm run lint` roda ESLint
- `npm run typecheck` roda TypeScript
- `npm run db:generate` gera Prisma Client
- `npm run db:deploy` aplica migrações em produção
- `npm run db:seed` cria conteúdo inicial e usuário admin

Os scripts chamam binários via `node ./node_modules/...` para funcionar bem mesmo com `&` no caminho da pasta no Windows.

## Conteúdo Inicial

O seed cadastra:

- Dados institucionais da Carro & Casa
- WhatsApp `+55 82 3028-7161`
- Instagram `https://www.instagram.com/lojacarroecasa/`
- Endereço e horário observados nos materiais enviados
- Hero, carrossel, marcas, categorias, FAQ, termos, privacidade e SEO base
- Botão “Acessar sistema” desativado por padrão

## Imagens E Marcas

- A logo enviada foi preservada em `public/brand/logo-carro-casa.jpg`.
- As imagens de hero/carrossel foram geradas como assets neutros, sem marcas, textos ou produtos identificáveis.
- Logos das marcas destacadas estão como placeholders até a cliente fornecer arquivos oficiais autorizados.
- Não há hotlink de imagens externas.

## Pendências Para Produção

- Confirmar número final do WhatsApp.
- Confirmar e-mail institucional, se houver.
- Confirmar Google Maps embed oficial.
- Enviar logos oficiais/autorizadas de Autolimpe, Nasiol, Vonixx e Dimension.
- Trocar a senha admin criada pelo seed.
- Definir `NEXT_PUBLIC_SITE_URL` com o domínio final.
- Definir `NEXT_PUBLIC_APP_ACCESS_URL` quando o futuro SaaS estiver pronto.
