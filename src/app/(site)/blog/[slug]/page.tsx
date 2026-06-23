import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookText, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { blogPosts, getBlogPostBySlug } from "@/lib/site-data";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Post nao encontrado",
      description: "O artigo solicitado nao existe.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Artigo"
          title={post.title}
          description={post.excerpt}
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            <Badge variant="gold">{post.category}</Badge>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
              <CalendarDays className="size-4" />
              {post.readingTime}
            </div>
            <p className="text-sm leading-7 text-brand-ivory/70">
              Este post existe como base editorial e SEO para a assessoria.
              Quando o CMS entrar, o corpo do artigo vai ser persistido no banco.
            </p>
          </Card>

          <Card className="space-y-4 p-6">
            <BookText className="size-5 text-brand-gold" />
            <div className="space-y-3 text-sm leading-7 text-brand-ivory/72">
              {post.summary.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
