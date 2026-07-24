import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateBRL } from "@/lib/formatters";
import { getPublicBlogPosts } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Conteúdos editoriais e SEO local para a assessoria imobiliária.",
  path: "/blog",
});

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPublicBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Blog"
          title="Conteúdos que ajudam o cliente e fortalecem a busca local"
          description="Informações para tomar decisões imobiliárias com mais clareza, segurança e conhecimento do mercado."
        />

        {posts.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.slug} className="space-y-4 p-5">
                {post.category ? <Badge variant="outline">{post.category}</Badge> : null}
                <h2 className="font-display text-3xl text-brand-ivory">{post.title}</h2>
                {post.excerpt ? <p className="text-sm leading-6 text-brand-ivory/70">{post.excerpt}</p> : null}
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                  <CalendarDays className="size-4" />
                  {formatDateBRL(post.publishedAt)}
                  <span>{post.readingTime}</span>
                </div>
                <Link href={`/blog/${post.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Ler artigo
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-sm leading-6 text-brand-ivory/70">
            Nenhum artigo publicado ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
