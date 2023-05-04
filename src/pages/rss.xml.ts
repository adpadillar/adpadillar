import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const get: APIRoute = async function get(context) {
  const blog = await getCollection("blog");

  return rss({
    title: "Axel Padilla’s Blog",
    description:
      "Sharing my thoughts on software development, productivity, and life.",
    site: context.site?.href || "https://blog.axelpadilla.me/",
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/${post.slug}/`,
    })),
    stylesheet: "/rss/styles.xsl",
  });
};
