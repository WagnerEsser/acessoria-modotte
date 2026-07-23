---
name: security
purpose: Tornar seguranca e privacidade criterios obrigatorios de projeto, implementacao e entrega.
---

# Regra obrigatoria

Toda alteracao de codigo, dados, infraestrutura, dependencias ou configuracao deve ser
projetada e validada com seguranca desde o inicio. Uma entrega nao esta pronta enquanto os
itens aplicaveis deste workflow nao forem verificados.

# Principios

- Aplicar menor privilegio, defesa em profundidade, falha segura e negacao por padrao.
- Tratar navegador, headers, cookies, query strings, formularios, arquivos e webhooks como
  entrada nao confiavel.
- Nao confiar em controles visuais, campos hidden, middleware isolado ou dados enviados
  pelo cliente para autorizar operacoes.
- Nao prometer "seguranca absoluta"; registrar ameacas, controles, testes e riscos residuais.
- Nao inventar credenciais nem registrar secrets, tokens, senhas, dados pessoais ou
  payloads sensiveis em logs, fixtures, screenshots ou handoffs.

# Autenticacao e sessao

1. Usar somente Supabase Auth para login, logout, recuperacao e sessao administrativa.
2. Validar identidade no servidor com `auth.getUser()`; nunca autorizar apenas pelo
   conteudo de um cookie ou pelo estado do cliente.
3. Confirmar papel e `is_active` no banco em toda fronteira privilegiada.
4. Proteger paginas e APIs administrativas de forma independente; middleware e apenas uma
   camada adicional.
5. Cookies de sessao devem usar `HttpOnly`, `Secure` em producao, `SameSite=Lax` ou mais
   restritivo e escopo minimo.
6. Logout deve revogar a sessao no provedor e limpar cookies.
7. Cadastro publico deve permanecer desabilitado. Administradores sao provisionados por
   convite ou processo fora de banda auditavel.
8. Manter login administrativo simples quando esse for o requisito do produto, sem
   abrir mao de senha forte, rate limiting, sessao segura e revogacao.
9. Nunca criar bypass de desenvolvimento com senha fixa, cookie previsivel ou flag que
   possa chegar ao build de producao.

# Autorizacao e banco

1. Manter RLS habilitada em toda tabela exposta e testar `anon`, usuario inativo, papel
   insuficiente, admin e sessao expirada.
2. APIs privilegiadas devem validar sessao e papel antes de ler o corpo ou executar queries.
3. Service/secret keys sao exclusivamente server-side e devem ficar em secret manager.
4. Acesso publico de escrita deve ocorrer por uma fronteira estreita, validada e limitada;
   nao liberar `insert`, `update` ou `delete` anonimo amplo.
5. Operacoes administrativas relevantes devem gerar trilha de auditoria sem copiar dados
   pessoais ou secrets desnecessarios.
6. Uploads exigem bucket privado quando aplicavel, allowlist de MIME/extensao, limite de
   tamanho, nome gerado no servidor, verificacao de conteudo e policies especificas antes
   de serem habilitados.

# Entradas, saidas e abuso

1. Validar no servidor com schema e allowlist; aplicar limites de tamanho, formato, faixa e
   quantidade.
2. Rejeitar content types inesperados e limitar o corpo antes de carrega-lo integralmente.
3. Rotas mutaveis devem validar `Origin`/`Sec-Fetch-Site` ou usar protecao CSRF equivalente.
4. Formularios publicos devem ter rate limiting persistente, honeypot e verificacao
   anti-bot server-side. Em producao, falhar de forma segura quando o servico anti-bot nao
   estiver configurado.
5. Escapar saidas por padrao; qualquer HTML bruto precisa de sanitizacao e revisao.
6. URLs externas, redirects, fetches, caminhos e nomes de arquivo precisam de allowlist
   contra open redirect, SSRF e path traversal.
7. Mensagens ao usuario nao devem revelar stack trace, SQL, existencia de contas ou detalhes
   internos de autorizacao.

# Plataforma e transporte

- Exigir HTTPS em producao e configurar HSTS somente depois de o dominio estar em HTTPS.
- Aplicar CSP, `frame-ancestors`, `nosniff`, Referrer Policy, Permissions Policy e remocao de
  headers de tecnologia.
- O proxy deve sobrescrever headers encaminhados e impedir acesso direto ao origin.
- Studio, banco, storage administrativo e portas internas nao podem ficar publicos.
- Manter dependencias fixadas e rodar `npm audit`; vulnerabilidade conhecida sem correcao
  exige mitigacao documentada e aceite explicito.
- Segredos de cada ambiente devem ser unicos, rotacionaveis e nunca versionados.

# Validacao obrigatoria

- Rodar typecheck, lint, testes, build e auditoria de dependencias.
- Criar testes negativos para falta de sessao, papel insuficiente, usuario inativo, cookie
  forjado, origem cruzada, payload invalido/grande, rate limit e RLS.
- Inspecionar headers e cookies no runtime.
- Confirmar que HTML e bundle nao contem senhas, service keys ou dados sensiveis.
- Verificar que logs de auditoria registram a acao sem expor payload sensivel.
- Registrar no handoff controles aplicados, testes, riscos residuais, rotacao necessaria e
  configuracoes externas pendentes.

# Operacao

Para provisionamento de administradores, Turnstile, HTTPS, secrets, backups e rotacao,
seguir `docs/seguranca-operacional.md`.
