// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Deliberately bare. No image service config, no client router, no font
// integration — every one of those adds either client JS or build weight, and
// this site is a static index plus some markdown. The sitemap is the one
// integration that clears the bar: it emits two XML files at build time and
// ships nothing to the client. robots.txt points crawlers at it.
export default defineConfig({
  site: "https://smccl.ca/",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Astro 7 ships a new default Markdown processor (Sätteri). The
    // remark/rehype pipeline is opt-in now: `markdown.remarkPlugins` and
    // `markdown.rehypePlugins` still work but are deprecated, so the plugins
    // and Shiki config move inside `unified()` instead.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    // Stays at markdown level, NOT inside unified(): passed to the processor
    // it is silently ignored and code blocks fall back to the default single
    // `github-dark` theme, which emits a hardcoded light text colour and no
    // --shiki-dark variable — unreadable in light mode.
    shikiConfig: {
      themes: { light: "github-light", dark: "poimandres" },
    },
  },
});
