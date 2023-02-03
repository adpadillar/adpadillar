import { defineCollection } from "astro:content";
import { z } from "zod";

// 2. Define your collection(s)
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    publishDate: z.string().transform((str) => new Date(str)),
    description: z.string(),
    author: z.string().optional(),
    image: z.string().optional(),
    showReadTime: z.boolean().default(true),
  }),
});
// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  blog: blogCollection,
};
