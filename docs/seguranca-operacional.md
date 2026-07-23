# Seguranca operacional

Este runbook cobre os controles que dependem do ambiente e nao podem ser garantidos apenas
pelo codigo.

## Antes de publicar

1. Ativar HTTPS no dominio e alterar somente `SITE_URL` para a origem `https://`.
2. Manter o origin inacessivel diretamente e configurar o proxy para sobrescrever
   `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Forwarded-For` e IP do cliente.
3. Nao publicar Supabase Studio, Postgres, pooler, MinIO ou portas administrativas.
4. Gerar valores exclusivos, longos e aleatorios para todos os secrets do ambiente.
5. Guardar secrets em secret manager; nunca copiar `.env` para imagem, log ou repositorio.
6. Configurar `AUTH_RATE_LIMIT_SECRET` e `LEAD_RATE_LIMIT_SECRET` com valores diferentes,
   cada um com pelo menos 32 caracteres aleatorios.
7. Criar um widget Cloudflare Turnstile para o dominio e configurar:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: chave publica do widget;
   - `TURNSTILE_SECRET_KEY`: secret exclusivamente server-side.
8. Confirmar `DISABLE_SIGNUP=true` e `ENABLE_PHONE_SIGNUP=false`.
   `ENABLE_EMAIL_SIGNUP=true` deve permanecer ativo porque, neste template, essa variavel
   habilita tambem o login por e-mail; o bloqueio de novos cadastros e feito por
   `DISABLE_SIGNUP`.
9. Rodar `npm audit`, testes, build e os testes negativos de autorizacao.
10. Configurar backup criptografado do Postgres e testar restauracao.

## Provisionar administrador

O sistema nao promove automaticamente o primeiro cadastro.

1. Para usuarios adicionais, usar `/admin/usuarios` no painel da aplicacao. Somente o
   primeiro administrador precisa ser criado pelo Supabase ou pela Admin API.
2. Confirmar a identidade e o e-mail por canal confiavel.
3. Vincular o usuario explicitamente:

```sql
update public.users
set role = 'admin',
    is_active = true,
    updated_at = now()
where auth_user_id = (
  select id
  from auth.users
  where email = '<email-confirmado>'
);
```

4. Manter uma senha administrativa forte, exclusiva e armazenada em gerenciador de
   senhas; trocar imediatamente se houver suspeita de vazamento.
5. Nunca armazenar a senha em `.env`, seed, fixture, documentacao ou formulario.

## Rotacao e desligamento

- Para desligar um acesso imediatamente, definir `public.users.is_active=false` e revogar
  as sessoes no Supabase Auth.
- Rotacionar uma chave potencialmente exposta antes de investigar reutilizacao.
- Depois de rotacionar JWT/API keys, recriar os servicos dependentes e validar login, RLS,
  formularios e integracoes.
- Registrar a acao no incidente sem copiar tokens ou senhas para o relato.

## Verificacao recorrente

- Mensal: dependencias, usuarios ativos, papeis, sessoes e logs de auditoria.
- Trimestral: restauracao de backup, rotacao de secrets de menor impacto e teste de abuso
  dos formularios.
- Antes de upload/webhook novo: threat model, allowlists, limites, policies e teste do
  `security-auditor`.
- Depois de mudanca em auth/RLS/proxy: executar novamente a auditoria completa.
