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

export const bookCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string(),
    published: z.number(),
    dateRead: z.string().transform((str: string) => new Date(str)).optional(),
    stars: z.number().optional()
  })
});

export const collections = {
  posts: postCollection,
  books: bookCollection
};
