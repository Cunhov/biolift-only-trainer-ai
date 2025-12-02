# BioLift App - Guia de Deployment com Docker

Este guia fornece instruções passo a passo para implantar a aplicação BioLift usando Docker em qualquer VPS (Servidor Privado Virtual).

## Pré-requisitos

- Docker Engine (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)
- Pelo menos 2GB de RAM
- 10GB de espaço livre em disco
- Portas abertas: 3000 (frontend), 3001 (backend)

## Início Rápido

### 1. Instalar Docker

#### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### CentOS/RHEL
```bash
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**Nota**: Faça logout e login novamente para que as alterações de grupo entrem em vigor.

### 2. Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 3. Clonar ou Enviar Sua Aplicação

```bash
# Se usar git
git clone <url-do-seu-repo>
cd biolift-app

# Ou envie seus arquivos via SCP/SFTP
```

### 4. Configurar Variáveis de Ambiente

Crie seu arquivo de ambiente de produção:

```bash
cp .env.production.example .env.production
nano .env.production
```

**Variáveis obrigatórias:**

```env
# Autenticação - ALTERE ISSO!
JWT_SECRET=sua_chave_secreta_jwt_minimo_32_caracteres

# Webhook de Login
LOGIN_WEBHOOK_URL=https://aplicativos-n8n.m23la1.easypanel.host/webhook/login-app-ai-biolift-trainer

# Configuração de LLM
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=sua_chave_api_gemini_real

# Suporte legado
API_KEY=sua_chave_api_gemini_real
```

**Importante**: 
- Gere um JWT_SECRET forte: `openssl rand -base64 32`
- Nunca commite `.env.production` no git
- Mantenha suas chaves de API seguras

### 5. Construir e Iniciar a Aplicação

```bash
# Construir as imagens Docker
docker-compose build

# Iniciar os serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

### 6. Verificar Deployment

```bash
# Verificar saúde do backend
curl http://localhost:3001/health

# Verificar frontend
curl http://localhost:3000

# Ver logs
docker-compose logs -f
```

## Deployment em Produção no VPS

### Configuração Inicial

1. **Conecte-se ao seu VPS**
   ```bash
   ssh usuario@ip-do-seu-vps
   ```

2. **Atualize o sistema**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Instale Docker e Docker Compose** (veja a seção Início Rápido)

4. **Configure o firewall**
   ```bash
   # Permitir SSH
   sudo ufw allow 22/tcp
   
   # Permitir HTTP/HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Permitir portas do app (se acessar diretamente)
   sudo ufw allow 3000/tcp
   sudo ufw allow 3001/tcp
   
   # Ativar firewall
   sudo ufw enable
   ```

### Configuração de Domínio (Opcional mas Recomendado)

1. **Aponte seu domínio para o IP do VPS**
   - Crie registro A: `app.seudominio.com` → `ip-do-seu-vps`
   - Crie registro A: `api.seudominio.com` → `ip-do-seu-vps`

2. **Instale e configure Nginx como proxy reverso**
   ```bash
   sudo apt install nginx -y
   ```

3. **Crie a configuração do Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/biolift
   ```

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

4. **Ative o site e reinicie o Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/biolift /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Instale certificado SSL com Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d app.seudominio.com -d api.seudominio.com
   ```

### Implantar Aplicação

1. **Envie os arquivos da aplicação**
   ```bash
   # Da sua máquina local
   scp -r /caminho/para/biolift usuario@ip-do-seu-vps:/home/usuario/
   ```

2. **Configure o ambiente**
   ```bash
   cd /home/usuario/biolift
   cp .env.production.example .env.production
   nano .env.production
   # Preencha com seus valores de produção
   ```

3. **Construa e inicie**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Verifique**
   - Visite `http://app.seudominio.com` (ou `http://ip-do-seu-vps:3000`)
   - Teste a funcionalidade de login
   - Verifique o backend: `http://api.seudominio.com/health`

## Comandos de Gerenciamento

### Ver Logs
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 100 linhas
docker-compose logs --tail=100
```

### Reiniciar Serviços
```bash
# Reiniciar tudo
docker-compose restart

# Reiniciar serviço específico
docker-compose restart backend
docker-compose restart frontend
```

### Parar Serviços
```bash
# Parar tudo
docker-compose stop

# Parar serviço específico
docker-compose stop backend
```

### Atualizar Aplicação
```bash
# Puxar código mais recente
git pull

# Reconstruir e reiniciar
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup do Banco de Dados
```bash
# Backup do banco SQLite
docker-compose exec backend cp /app/data/prod.db /app/data/backup-$(date +%Y%m%d).db

# Copiar backup para o host
docker cp biolift-backend:/app/data/backup-$(date +%Y%m%d).db ./backups/
```

### Limpeza
```bash
# Remover containers parados
docker-compose down

# Remover containers e volumes (AVISO: apaga o banco de dados!)
docker-compose down -v

# Remover imagens não utilizadas
docker image prune -a
```

## Monitoramento

### Verificar Saúde do Serviço
```bash
# Verificar se os containers estão rodando
docker-compose ps

# Verificar uso de recursos
docker stats

# Verificar endpoint de saúde do backend
curl http://localhost:3001/health
```

### Reinício Automático em Falha

Os serviços estão configurados com `restart: unless-stopped`, o que significa:
- Containers reiniciam automaticamente se travarem
- Containers iniciam automaticamente ao reiniciar o servidor
- Containers só param quando explicitamente parados

## Solução de Problemas

### Backend Não Inicia

1. **Verifique os logs**
   ```bash
   docker-compose logs backend
   ```

2. **Problemas comuns**
   - Variáveis de ambiente ausentes
   - Problemas de conexão com banco de dados
   - Porta já em uso

3. **Verifique o arquivo de ambiente**
   ```bash
   cat .env.production
   ```

### Frontend Não Carrega

1. **Verifique se o backend está rodando**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verifique logs do frontend**
   ```bash
   docker-compose logs frontend
   ```

3. **Verifique configuração do nginx** (se usar proxy reverso)
   ```bash
   sudo nginx -t
   ```

### Problemas de Banco de Dados

1. **Verifique se o arquivo do banco existe**
   ```bash
   docker-compose exec backend ls -la /app/data/
   ```

2. **Resetar banco de dados** (AVISO: apaga todos os dados!)
   ```bash
   docker-compose down
   docker volume rm biolift_biolift-data
   docker-compose up -d
   ```

### Conflitos de Porta

Se as portas 3000 ou 3001 já estiverem em uso:

1. **Descubra o que está usando a porta**
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :3001
   ```

2. **Altere as portas no docker-compose.yml**
   ```yaml
   ports:
     - "8000:3000"  # Use porta 8000 em vez de 3000
   ```

### Problemas de Memória

Se o VPS ficar sem memória:

1. **Adicione espaço de swap**
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Limite a memória do container** no docker-compose.yml
   ```yaml
   services:
     backend:
       mem_limit: 512m
   ```

## Melhores Práticas de Segurança

1. **Use segredos fortes**
   - Gere JWT_SECRET com: `openssl rand -base64 32`
   - Nunca use valores padrão em produção

2. **Mantenha o Docker atualizado**
   ```bash
   sudo apt update && sudo apt upgrade docker-ce docker-ce-cli
   ```

3. **Backups regulares**
   - Faça backup do banco diariamente
   - Armazene backups fora do servidor

4. **Monitore logs**
   - Verifique atividades suspeitas
   - Configure rotação de logs

5. **Use HTTPS**
   - Sempre use certificados SSL em produção
   - Redirecione HTTP para HTTPS

6. **Configuração de firewall**
   - Abra apenas as portas necessárias
   - Use UFW ou iptables

## Otimização de Performance

### Ativar Docker BuildKit
```bash
export DOCKER_BUILDKIT=1
docker-compose build
```

### Otimizar Imagens
```bash
# Remover imagens não utilizadas
docker image prune -a

# Remover cache de build
docker builder prune
```

### Otimização de Banco de Dados

Para melhor performance do SQLite, considere:
- Operações regulares de VACUUM
- Indexação adequada
- Migrar para PostgreSQL para alto tráfego

## Atualizando a Aplicação

### Atualização Padrão
```bash
# Puxar código mais recente
git pull origin main

# Reconstruir e reiniciar
docker-compose down
docker-compose build
docker-compose up -d
```

### Atualização Sem Downtime
```bash
# Construir novas imagens
docker-compose build

# Iniciar novos containers
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend
```

## Suporte e Manutenção

### Tarefas de Manutenção Regular

1. **Semanalmente**
   - Verificar logs por erros
   - Verificar se backups estão funcionando
   - Monitorar espaço em disco

2. **Mensalmente**
   - Atualizar Docker e pacotes do sistema
   - Revisar e rotacionar logs
   - Testar restauração de backup

3. **Trimestralmente**
   - Auditoria de segurança
   - Revisão de performance
   - Atualizar dependências

## Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Documentação Docker Compose](https://docs.docker.com/compose/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## Obtendo Ajuda

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique variáveis de ambiente: `cat .env.production`
3. Verifique status do Docker: `docker-compose ps`
4. Revise esta documentação
5. Verifique recursos do Docker e sistema: `docker stats` e `df -h`
