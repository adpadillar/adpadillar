import { defineConfig } from "astro/config";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import mdx from "@astrojs/mdx";

// Rehype
import remarkMath from "remark-math";

// Remark
import rehypeMathJaxSvg from "rehype-mathjax";

// https://astro.build/config
import astroPrefetch from "@astrojs/prefetch";

// https://astro.build/config
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx(), astroPrefetch(), react()],
  markdown: {
    shikiConfig: {
      theme: "one-dark-pro",
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeMathJaxSvg,
        {
          tex: {
            tags: "ams",
          },
        },
      ],
    ],
  },
});
