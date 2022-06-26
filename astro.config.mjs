import { defineConfig } from 'astro/config';

import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";

const tailwindConfig = tailwind({
  config: {
    applyBaseStyles: false,
  }
});

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), tailwindConfig],
  markdown: {
    remarkPlugins: [
      "remark-math", 
      "remark-gfm", 
    ],
    rehypePlugins: [
      "rehype-katex"
    ],
    shikiConfig: {
      theme: 'nord',
      langs: [],
    },
  }
});
