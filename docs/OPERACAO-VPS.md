# Operacao VPS - Carro & Casa

## Servidor

- VPS: `187.127.37.208`
- SSH: `ssh root@187.127.37.208`
- Projeto: `/srv/apps/carro-e-casa/app`
- Compose project: `carro-e-casa`
- Porta interna publicada: `127.0.0.1:3001 -> 3000`
- Nginx: `/etc/nginx/sites-available/carro-e-casa`
- Certificado: `/etc/letsencrypt/live/lojacarroecasa.com.br/`

Nao misture comandos deste projeto com o Lume Gestao. O Lume fica em outro diretorio e usa outro compose project.

## Deploy

No servidor:

```bash
cd /srv/apps/carro-e-casa/app
git pull --ff-only
docker compose -p carro-e-casa build web
docker compose -p carro-e-casa up -d web
docker compose -p carro-e-casa exec -T web npx prisma migrate deploy
docker compose -p carro-e-casa exec -T web npm run db:seed
docker compose -p carro-e-casa ps
```

Validacao rapida:

```bash
curl -I https://lojacarroecasa.com.br/
curl -I https://www.lojacarroecasa.com.br/
curl -I https://empresas.lojacarroecasa.com.br/
curl -I https://lojacarroecasa.com.br/admin
```

## Backup

Crie a pasta de backups, gere dump do Postgres e archive dos uploads:

```bash
mkdir -p /srv/apps/carro-e-casa/backups
cd /srv/apps/carro-e-casa/app

STAMP=$(date +%Y%m%d-%H%M%S)
docker compose -p carro-e-casa exec -T db pg_dump -U carro_casa carro_casa \
  > /srv/apps/carro-e-casa/backups/db-$STAMP.sql

tar -czf /srv/apps/carro-e-casa/backups/uploads-$STAMP.tar.gz \
  -C /srv/apps/carro-e-casa data/uploads
```

Antes de migracoes maiores, rode o backup e confira se os arquivos foram criados:

```bash
ls -lh /srv/apps/carro-e-casa/backups | tail
```

## SSL

Os hosts atuais cobertos pelo certificado:

- `lojacarroecasa.com.br`
- `www.lojacarroecasa.com.br`
- `empresas.lojacarroecasa.com.br`

Renovacao automatica pelo Certbot:

```bash
certbot certificates
certbot renew --dry-run
```

## DNS

Registros esperados enquanto o DNS estiver na LocaWeb:

- `lojacarroecasa.com.br` A `187.127.37.208`
- `www` CNAME `lojacarroecasa.com.br`
- `empresas` A `187.127.37.208`
- MX, SPF, DKIM e webmail da LocaWeb preservados para e-mails institucionais.

Teste de propagacao:

```bash
for r in 1.1.1.1 8.8.8.8 9.9.9.9 208.67.222.222; do
  echo "--- $r"
  dig +short @${r} lojacarroecasa.com.br A
  dig +short @${r} www.lojacarroecasa.com.br A
  dig +short @${r} empresas.lojacarroecasa.com.br A
done
```

## CMS

- Admin: `https://lojacarroecasa.com.br/admin`
- Avaliacoes Google: sincronizacao em `Admin > Avaliacoes` usando dados reais do perfil no Google. Requer `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID` no `.env`.
- E-mails institucionais: cada usuario do admin pode ter um e-mail associado para abrir o Webmail da LocaWeb pelo dashboard.
- Usuarios: mantenha `owner/admin` apenas para socios ou pessoas com responsabilidade operacional. Use `editor` ou `media` para social media.
