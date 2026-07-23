---
name: seo
purpose: Garantir que toda entrega publica preserve descoberta organica, SEO local e qualidade tecnica.
---

# Regra obrigatoria

Toda pagina, funcionalidade, conteudo, rota ou modelo de dados que afete a area publica deve
ser projetado, implementado e validado com SEO desde o inicio. Uma entrega publica nao esta
pronta enquanto os itens aplicaveis deste workflow nao forem verificados.

# Fonte de verdade

- Usar somente `SITE_URL` por meio de `src/lib/site.ts` para URLs absolutas.
- Nao duplicar dominio em componentes, rotas, sitemap, robots ou dados estruturados.
- Nao inventar endereco, cidade, CRECI, avaliacao, depoimento ou qualquer dado comercial.
- Conteudo editavel deve preservar fallback seguro e metadata coerente.

# Checklist de implementacao

1. Definir a intencao de busca e o objetivo de conversao da pagina.
2. Garantir exatamente um `h1` descritivo e hierarquia `h2`/`h3` coerente.
3. Configurar title, description, canonical, Open Graph e Twitter.
4. Definir explicitamente indexacao, canonical e politica para filtros/paginacao.
5. Adicionar a rota ao sitemap apenas quando for publica e indexavel.
6. Aplicar dados estruturados validos quando houver entidade real:
   - `RealEstateAgent`/`WebSite` no site;
   - `BreadcrumbList` em rotas internas;
   - `House`, `Apartment` ou `Residence` com `Offer` em imoveis;
   - `BlogPosting` em artigos.
7. Criar links internos uteis entre servicos, areas, imoveis, artigos e contato.
8. Usar texto orientado ao cliente; nunca exibir linguagem de banco, painel, seed ou implementacao.
9. Garantir alt text util, dimensoes de imagem e carregamento adequado.
10. Preservar cache/revalidacao e evitar dependencia dinamica desnecessaria.
11. Validar que nenhuma rota administrativa ou API seja indexada.

# SEO local

- Usar NAP consistente quando os dados reais estiverem cadastrados.
- Estruturar hubs e paginas unicas por cidade, bairro, servico e tipo somente quando houver
  conteudo util e inventario real.
- Evitar paginas em massa com texto duplicado ou apenas substituicao de localidade.
- Conectar paginas locais ao catalogo e a um CTA contextual.

# Validacao obrigatoria

- Rodar typecheck, lint, testes e build.
- Verificar no HTML renderizado:
  - title e description;
  - canonical absoluto;
  - robots;
  - um `h1`;
  - Open Graph/Twitter;
  - JSON-LD valido quando aplicavel.
- Verificar `robots.txt` e `sitemap.xml`.
- Registrar no handoff o impacto SEO, os testes e qualquer dado de negocio ainda pendente.
