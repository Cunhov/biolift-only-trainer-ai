# BioLift App - Guia de Embedding

Este guia explica como incorporar o aplicativo BioLift em sites externos usando iframes.

## Início Rápido

Para incorporar o app BioLift no seu site, adicione o seguinte código HTML:

```html
<iframe 
    src="http://seu-dominio-servidor:3000" 
    width="100%" 
    height="800px" 
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
</iframe>
```

## Opções de Configuração

### Embedding Básico

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BioLift Trainer</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        .app-container {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <iframe 
        class="app-container"
        src="http://seu-dominio-servidor:3000"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</body>
</html>
```

### Embedding Responsivo

Para um iframe responsivo que se adapta a diferentes tamanhos de tela:

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe 
        src="http://seu-dominio-servidor:3000"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</div>
```

### Embedding com Tamanho Fixo

Para um embed de tamanho fixo em uma seção específica da sua página:

```html
<div style="max-width: 1200px; margin: 0 auto;">
    <h2>Seu Personal Trainer</h2>
    <iframe 
        src="http://seu-dominio-servidor:3000"
        width="100%"
        height="900px"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</div>
```

## Configuração do Servidor

### Configurações CORS

O backend do BioLift está configurado para aceitar requisições de qualquer origem por padrão. Isso permite que o app funcione quando incorporado em qualquer site.

**Configuração Atual:**
- **Origem**: `*` (todas as origens permitidas)
- **Credenciais**: Ativado (suporta autenticação no contexto incorporado)
- **Métodos**: GET, POST, PUT, DELETE, OPTIONS

### Restringindo Embedding a Domínios Específicos

Se você quiser restringir o embedding apenas a domínios específicos, atualize a configuração CORS em `server/src/app.ts`:

```typescript
app.use(cors({
    origin: ['https://seusite.com', 'https://outrosite.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

E atualize a Política de Segurança de Conteúdo (CSP):

```typescript
res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://seusite.com https://outrosite.com");
```

## Considerações de Segurança

### Configuração de Segurança Atual

1. **Frame Ancestors**: Definido como `*` (permite embedding de qualquer domínio)
2. **CORS**: Configurado para aceitar requisições de todas as origens
3. **Credenciais**: Ativado para suporte a autenticação

### Recomendado para Produção

Para ambientes de produção, considere:

1. **Listar domínios específicos** em vez de permitir todas as origens
2. **Usar HTTPS** tanto para o app incorporado quanto para a página pai
3. **Implementar rate limiting** para prevenir abusos
4. **Monitorar uso** para detectar embedding não autorizado

### Exemplo de Configuração de Produção

```typescript
// Em server/src/app.ts
const ALLOWED_ORIGINS = [
    'https://seusite.com',
    'https://www.seusite.com',
    'https://site-parceiro.com'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    const allowedFrameAncestors = ALLOWED_ORIGINS.join(' ');
    res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${allowedFrameAncestors}`);
    next();
});
```

## Testando Embedding Localmente

1. Crie um arquivo HTML de teste (ex: `test-embed.html`) com o código de embedding
2. Certifique-se que seu app BioLift está rodando (`./start.sh`)
3. Abra o arquivo HTML no seu navegador
4. O app deve carregar e funcionar normalmente dentro do iframe

### Exemplo de Arquivo de Teste

Salve isso como `test-embed.html` e abra no seu navegador:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Embedding BioLift</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f0f0f0;
        }
        .header {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        iframe {
            width: 100%;
            height: 900px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BioLift Trainer - Demo Incorporada</h1>
        <p>Isso demonstra o app BioLift incorporado em um site externo</p>
    </div>
    <div class="container">
        <iframe 
            src="http://localhost:3000"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
    </div>
</body>
</html>
```

## Solução de Problemas

### App Não Carrega no Iframe

1. **Verifique erros de CORS** no console do navegador
2. **Verifique se o servidor está rodando** na porta correta
3. **Verifique X-Frame-Options** ou bloqueio CSP (deve estar configurado corretamente)
4. **Garanta HTTPS** se a página pai usa HTTPS

### Problemas de Autenticação

1. **Ative credenciais** na configuração CORS (já ativado)
2. **Verifique configurações de cookie** - Atributo SameSite pode precisar de ajuste
3. **Verifique se a origem** é permitida na configuração CORS

### Problemas de Performance

1. **Otimize o tamanho do iframe** - não faça desnecessariamente grande
2. **Use lazy loading** se incorporar múltiplas instâncias
3. **Considere indicadores de carregamento** enquanto o iframe carrega

## Deployment em Produção

Ao implantar em produção:

1. **Atualize o src do iframe** para seu domínio de produção (ex: `https://biolift.seudominio.com`)
2. **Use HTTPS** para conexões seguras
3. **Configure CORS** para listar apenas domínios confiáveis
4. **Configure DNS** e certificados SSL adequados
5. **Monitore performance** e uso

## Suporte

Para problemas ou dúvidas sobre embedding:
- Verifique os logs do servidor para erros de CORS ou segurança
- Revise o console do navegador para erros do lado do cliente
- Garanta que todas as variáveis de ambiente estão configuradas corretamente
