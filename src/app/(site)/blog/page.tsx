import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { blogPosts } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Conteúdos editoriais e SEO local para a assessoria imobiliária.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Blog"
          title="Conteúdos que ajudam o cliente e fortalecem a busca local"
          description="A camada editorial já está preparada para receber artigos, categorias e meta tags."
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Propor pauta
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="space-y-4 p-5">
              <Badge variant="outline">{post.category}</Badge>
              <h2 className="font-display text-3xl text-brand-ivory">{post.title}</h2>
              <p className="text-sm leading-6 text-brand-ivory/70">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                <CalendarDays className="size-4" />
                {post.readingTime}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
