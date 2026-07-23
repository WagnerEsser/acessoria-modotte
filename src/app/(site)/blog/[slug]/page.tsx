import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookText, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDateBRL } from "@/lib/formatters";
import { getPublicBlogPostBySlug, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import {
  buildArticleStructuredData,
  buildBreadcrumbStructuredData,
} from "@/lib/structured-data";

export const revalidate = 300;

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Post não encontrado",
      description: "O artigo solicitado não existe ou ainda não foi publicado.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: post.seoTitle ?? post.title,
    description:
      post.seoDescription ??
      post.excerpt ??
      post.summary[0] ??
      "Artigo da assessoria imobiliária.",
    path: `/blog/${post.slug}`,
    image: post.ogImageUrl ?? post.coverImageUrl,
    imageAlt: post.title,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = splitParagraphs(post.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildBreadcrumbStructuredData([
            { name: "Início", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          buildArticleStructuredData(post),
        ]}
      />
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Artigo"
          title={post.title}
          description={post.excerpt ?? undefined}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            {post.category ? <Badge variant="gold">{post.category}</Badge> : null}
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
              <CalendarDays className="size-4" />
              {formatDateBRL(post.publishedAt)}
              <span>{post.readingTime}</span>
            </div>

            {post.coverImageUrl ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-brand-beige/12 bg-brand-ivory/4">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  width={1200}
                  height={630}
                  loading="lazy"
                  className="h-72 w-full object-cover"
                />
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4 p-6">
            <BookText className="size-5 text-brand-gold" />
            <div className="space-y-3 text-sm leading-7 text-brand-ivory/72">
              {paragraphs.length ? (
                paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : post.summary.length ? (
                post.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>
                  Este conteúdo está em atualização. Enquanto isso, fale com a assessoria para receber
                  orientação sobre este tema.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
