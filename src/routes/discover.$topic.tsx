import { createFileRoute, notFound } from "@tanstack/react-router";
import { TopicLanding } from "@/components/discover/TopicLanding";
import { getRequestLocale } from "@/lib/locale.functions";
import { discoverCopy } from "@/lib/discover/copy";
import { isTopicSlug } from "@/lib/discover/topics";
import { canonicalLinks } from "@/lib/social-meta";

export const Route = createFileRoute("/discover/$topic")({
  loader: async ({ params }) => {
    if (!isTopicSlug(params.topic)) throw notFound();
    const { locale } = await getRequestLocale().catch(() => ({ locale: "en" as const }));
    return { locale, slug: params.topic };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "ROUT" }, { name: "robots", content: "noindex" }] };
    const c = discoverCopy(loaderData.locale).topics[loaderData.slug];
    const title = `${c.brand}: ${c.title} | ROUT`;
    return {
      meta: [
        { title },
        { name: "description", content: c.lead },
        { property: "og:title", content: title },
        { property: "og:description", content: c.lead },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: canonicalLinks(`/discover/${params.topic}`),
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { slug } = Route.useLoaderData();
  return <TopicLanding slug={slug} />;
}
