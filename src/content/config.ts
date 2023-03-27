import { z, defineCollection } from "astro:content";

const postCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    description: z.string(),
    draft: z.optional(z.boolean()),
  }),
});

export const collections = {
  posts: postCollection
};
