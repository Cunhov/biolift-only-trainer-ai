# 🏋️ BioLift - Personal Trainer com IA

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Instalação Local](#instalação-local)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Configuração de LLM (IA)](#configuração-de-llm-ia)
- [Deployment com Docker (Produção)](#deployment-com-docker-produção)
- [Embedding em Sites Externos](#embedding-em-sites-externos)
- [Gerenciamento e Manutenção](#gerenciamento-e-manutenção)
- [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Sobre o Projeto

BioLift é uma aplicação de personal trainer com inteligência artificial que gera treinos personalizados, acompanha o progresso do usuário e fornece orientações profissionais de forma automatizada.

**Tecnologias:**
- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Banco de Dados:** SQLite com Prisma ORM
- **IA:** Suporte para Gemini, OpenAI e APIs customizadas
- **Containerização:** Docker + Docker Compose

---

## ✨ Funcionalidades

- ✅ Autenticação via webhook externo (n8n)
- ✅ Geração de treinos personalizados com IA
- ✅ Acompanhamento de progresso
- ✅ Integração com vídeos do YouTube
- ✅ Suporte para múltiplos provedores de IA
- ✅ Pronto para embedding em sites externos
- ✅ Containerizado com Docker para deploy fácil

---

## 🚀 Instalação Local

### Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd biolift-app
   ```

2. **Instale as dependências**
   ```bash
   # Dependências do frontend
   npm install
   
   # Dependências do backend
   cd server
   npm install
   cd ..
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cd server
   cp .env.example .env
   nano .env
   ```

4. **Inicie a aplicação**
   ```bash
   # Na raiz do projeto
   ./start.sh
   ```

5. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

---

## ⚙️ Configuração de Variáveis de Ambiente

### Arquivo: `server/.env`

```env
# Banco de Dados
DATABASE_URL="file:./dev.db"

# Autenticação
JWT_SECRET="supersecretkey_change_me_in_prod"

# Porta do Servidor
PORT=3001

# Webhook de Login (n8n ou similar)
# Você pode modificar esta URL a qualquer momento sem alterar código
LOGIN_WEBHOOK_URL=https://aplicativos-n8n.m23la1.easypanel.host/webhook/login-app-ai-biolift-trainer

# Configuração do Provedor de IA
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=sua_chave_api_aqui

# Compatibilidade (manter por enquanto)
API_KEY=sua_chave_api_aqui
```

### Variáveis Importantes

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DATABASE_URL` | Caminho do banco SQLite | ✅ Sim |
| `JWT_SECRET` | Chave secreta para tokens JWT | ✅ Sim |
| `PORT` | Porta do servidor backend | ✅ Sim |
| `LOGIN_WEBHOOK_URL` | URL do webhook de autenticação | ✅ Sim |
| `LLM_PROVIDER` | Provedor de IA (gemini/openai/custom) | ✅ Sim |
| `LLM_MODEL` | Modelo de IA a ser usado | ✅ Sim |
| `LLM_API_KEY` | Chave da API do provedor de IA | ✅ Sim |
| `LLM_BASE_URL` | URL base (apenas para custom) | ❌ Opcional |

---

## 🤖 Configuração de LLM (IA)

O BioLift suporta múltiplos provedores de IA. Escolha o que melhor atende suas necessidades:

### Opção 1: Google Gemini (Recomendado)

**Vantagens:** Rápido, econômico, excelente para português

```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=sua_chave_gemini_aqui
```

**Modelos disponíveis:**
- `gemini-2.5-flash` - Recomendado (rápido e eficiente)
- `gemini-2.0-flash-exp` - Experimental
- `gemini-1.5-pro` - Mais avançado

**Como obter a chave:**
1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crie uma nova chave API
3. Copie e cole em `LLM_API_KEY`

### Opção 2: OpenAI

**Vantagens:** Modelos GPT-4 de alta qualidade

```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_API_KEY=sk-sua_chave_openai_aqui
```

**Modelos disponíveis:**
- `gpt-4o` - Recomendado (mais recente)
- `gpt-4-turbo` - Rápido e eficiente
- `gpt-3.5-turbo` - Econômico

**Como obter a chave:**
1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma nova chave API
3. Copie e cole em `LLM_API_KEY`

### Opção 3: Provedor Customizado

**Vantagens:** Use qualquer API compatível com OpenAI (Anthropic Claude, LLMs locais, etc.)

```env
LLM_PROVIDER=custom
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_API_KEY=sua_chave_api
LLM_BASE_URL=https://api.anthropic.com/v1
```

**Exemplos de uso:**

**Anthropic Claude:**
```env
LLM_PROVIDER=custom
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_API_KEY=sk-ant-sua_chave_anthropic
LLM_BASE_URL=https://api.anthropic.com/v1
```

**LLM Local (Ollama, LM Studio, etc.):**
```env
LLM_PROVIDER=custom
LLM_MODEL=llama3
LLM_API_KEY=not-needed
LLM_BASE_URL=http://localhost:11434/v1
```

### Alterando o Provedor de IA

1. Edite `server/.env`
2. Altere as variáveis `LLM_PROVIDER`, `LLM_MODEL` e `LLM_API_KEY`
3. Reinicie o servidor:
   ```bash
   # Se estiver usando ./start.sh, pressione Ctrl+C e execute novamente
   ./start.sh
   
   # Ou se estiver usando Docker
   docker-compose restart backend
   ```

---

## 🐳 Deployment com Docker (Produção)

### Por que usar Docker?

- ✅ Instalação simplificada em qualquer servidor
- ✅ Ambiente isolado e consistente
- ✅ Fácil atualização e rollback
- ✅ Escalabilidade
- ✅ Gerenciamento simplificado

### Pré-requisitos no Servidor

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 10GB espaço em disco
- Portas 3000 e 3001 disponíveis

### Instalação do Docker no VPS

#### Ubuntu/Debian

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

**Importante:** Faça logout e login novamente para que as permissões do grupo docker sejam aplicadas.

### Deploy Passo a Passo

#### 1. Enviar Arquivos para o VPS

```bash
# Do seu computador local
scp -r /caminho/para/biolift usuario@ip-do-vps:/home/usuario/
```

Ou use Git:

```bash
# No VPS
git clone <url-do-repositorio>
cd biolift-app
```

#### 2. Configurar Variáveis de Ambiente

```bash
# No VPS, dentro da pasta do projeto
cp .env.production.example .env.production
nano .env.production
```

**Arquivo `.env.production` (exemplo):**

```env
# IMPORTANTE: Gere um JWT_SECRET forte!
# Use: openssl rand -base64 32
JWT_SECRET=sua_chave_secreta_super_forte_aqui_minimo_32_caracteres

# Webhook de Login
LOGIN_WEBHOOK_URL=https://aplicativos-n8n.m23la1.easypanel.host/webhook/login-app-ai-biolift-trainer

# Configuração de IA
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=sua_chave_gemini_de_producao

# Compatibilidade
API_KEY=sua_chave_gemini_de_producao
```

**⚠️ SEGURANÇA:**
- Nunca use valores padrão em produção
- Gere um JWT_SECRET forte: `openssl rand -base64 32`
- Nunca commite `.env.production` no git
- Mantenha suas chaves API seguras

#### 3. Construir e Iniciar os Containers

```bash
# Construir as imagens Docker
docker-compose build

# Iniciar os serviços em background
docker-compose up -d

# Verificar status
docker-compose ps
```

#### 4. Verificar Deployment

```bash
# Verificar logs
docker-compose logs -f

# Testar backend
curl http://localhost:3001/health

# Testar frontend
curl http://localhost:3000
```

#### 5. Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir portas da aplicação (se acesso direto)
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Ativar firewall
sudo ufw enable
```

### Configurar Domínio e SSL (Recomendado)

#### 1. Apontar Domínio para o VPS

Configure os registros DNS:
- `app.seudominio.com` → IP do VPS (registro A)
- `api.seudominio.com` → IP do VPS (registro A)

#### 2. Instalar Nginx como Reverse Proxy

```bash
sudo apt update
sudo apt install nginx -y
```

#### 3. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/biolift
```

**Conteúdo do arquivo:**

```nginx
# Frontend
server {
    listen 80;
    server_name app.seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.seudominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Ativar Configuração

```bash
sudo ln -s /etc/nginx/sites-available/biolift /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Instalar Certificado SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d app.seudominio.com -d api.seudominio.com

# Renovação automática já está configurada!
```

Agora sua aplicação está disponível em:
- **Frontend:** https://app.seudominio.com
- **Backend:** https://api.seudominio.com

---

## 🌐 Embedding em Sites Externos

O BioLift pode ser incorporado em qualquer site usando iframe.

### Código Básico de Embedding

```html
<iframe 
    src="https://app.seudominio.com" 
    width="100%" 
    height="800px" 
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
</iframe>
```

### Embedding Responsivo

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe 
        src="https://app.seudominio.com"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</div>
```

### Embedding com Tamanho Fixo

```html
<div style="max-width: 1200px; margin: 0 auto;">
    <h2>Seu Personal Trainer com IA</h2>
    <iframe 
        src="https://app.seudominio.com"
        width="100%"
        height="900px"
        frameborder="0"
        allowfullscreen>
    </iframe>
</div>
```

### Testar Embedding Localmente

1. Certifique-se que a aplicação está rodando
2. Abra o arquivo `test-embed.html` no navegador
3. Verifique se todas as funcionalidades funcionam no iframe

### Restringir Embedding a Domínios Específicos

Por padrão, o app pode ser incorporado em qualquer site. Para restringir:

Edite `server/src/app.ts`:

```typescript
// Substituir origin: true por:
app.use(cors({
    origin: ['https://seusite.com', 'https://outrosite.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// E atualizar o CSP:
res.setHeader('Content-Security-Policy', 
    "frame-ancestors 'self' https://seusite.com https://outrosite.com");
```

---

## 🔧 Gerenciamento e Manutenção

### Comandos Docker Essenciais

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar serviços
docker-compose restart

# Parar serviços
docker-compose stop

# Parar e remover containers
docker-compose down

# Ver status dos containers
docker-compose ps

# Ver uso de recursos
docker stats
```

### Atualizar a Aplicação

```bash
# Puxar código atualizado
git pull origin main

# Reconstruir e reiniciar
docker-compose down
docker-compose build
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### Backup do Banco de Dados

```bash
# Criar backup
docker cp biolift-backend:/app/data/prod.db ./backup-$(date +%Y%m%d).db

# Ou usando docker-compose exec
docker-compose exec backend cp /app/data/prod.db /app/data/backup-$(date +%Y%m%d).db
docker cp biolift-backend:/app/data/backup-$(date +%Y%m%d).db ./backups/
```

### Restaurar Backup

```bash
# Parar o backend
docker-compose stop backend

# Restaurar arquivo
docker cp ./backup-20241202.db biolift-backend:/app/data/prod.db

# Reiniciar
docker-compose start backend
```

### Monitoramento

```bash
# Verificar saúde dos serviços
curl http://localhost:3001/health

# Ver uso de recursos
docker stats

# Ver espaço em disco
df -h

# Ver logs de erro
docker-compose logs --tail=100 | grep -i error
```

---

## 🔍 Solução de Problemas

### Backend Não Inicia

**Sintomas:** Container backend para ou reinicia constantemente

**Soluções:**

1. Verificar logs:
   ```bash
   docker-compose logs backend
   ```

2. Verificar variáveis de ambiente:
   ```bash
   cat .env.production
   ```

3. Verificar se a porta 3001 está livre:
   ```bash
   sudo lsof -i :3001
   ```

### Frontend Não Carrega

**Sintomas:** Página em branco ou erro 502

**Soluções:**

1. Verificar se o backend está rodando:
   ```bash
   curl http://localhost:3001/health
   ```

2. Verificar logs do frontend:
   ```bash
   docker-compose logs frontend
   ```

3. Verificar configuração do Nginx (se usar):
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Erro de Login

**Sintomas:** "Falha no login. Verifique suas credenciais."

**Soluções:**

1. Verificar se o webhook está configurado corretamente:
   ```bash
   grep LOGIN_WEBHOOK_URL server/.env
   ```

2. Testar o webhook manualmente:
   ```bash
   curl -X POST https://seu-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@teste.com","cpf":"12345678900"}'
   ```

3. Verificar logs do backend:
   ```bash
   docker-compose logs backend | grep -i webhook
   ```

### Problemas com IA

**Sintomas:** Treinos não são gerados ou erros de API

**Soluções:**

1. Verificar configuração da API:
   ```bash
   grep LLM_ server/.env
   ```

2. Testar a chave API:
   ```bash
   # Para Gemini
   curl "https://generativelanguage.googleapis.com/v1/models?key=SUA_CHAVE"
   ```

3. Verificar logs:
   ```bash
   docker-compose logs backend | grep -i "llm\|api"
   ```

### Falta de Memória

**Sintomas:** Containers param, sistema lento

**Soluções:**

1. Adicionar swap:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. Limitar memória dos containers em `docker-compose.yml`:
   ```yaml
   services:
     backend:
       mem_limit: 512m
   ```

### Problemas de Embedding

**Sintomas:** App não carrega no iframe

**Soluções:**

1. Verificar console do navegador para erros CORS
2. Verificar se HTTPS está sendo usado (necessário para alguns recursos)
3. Verificar configuração CORS em `server/src/app.ts`

---

## 📚 Recursos Adicionais

- **Documentação Completa de Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Guia de Embedding:** [EMBEDDING.md](EMBEDDING.md)
- **Exemplo de Embedding:** [test-embed.html](test-embed.html)

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] JWT_SECRET forte e único (mínimo 32 caracteres)
- [ ] Chaves API mantidas em segredo
- [ ] `.env.production` não commitado no git
- [ ] HTTPS configurado (SSL/TLS)
- [ ] Firewall configurado (UFW ou iptables)
- [ ] Backups regulares do banco de dados
- [ ] Logs monitorados regularmente
- [ ] Docker e sistema operacional atualizados
- [ ] CORS restrito a domínios específicos (se necessário)
- [ ] Rate limiting configurado (se alto tráfego)

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `docker-compose logs -f`
2. Consulte a seção de [Solução de Problemas](#solução-de-problemas)
3. Revise as variáveis de ambiente
4. Verifique a documentação completa em [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📄 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

---

**Desenvolvido com ❤️ para revolucionar o fitness com IA**
