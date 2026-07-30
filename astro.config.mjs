// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Deliberately bare. No sitemap, no image service, no client router, no font
// integration — every one of those adds either client JS or build weight, and
// this site is a static index plus some markdown.
export default defineConfig({
  site: "https://smccl.ca/",
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: "github-light", dark: "poimandres" },
    },
  },
});
