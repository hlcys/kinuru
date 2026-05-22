import { defineCollection, z } from "astro:content";

const plannedCategories = ["杂谈", "LLM", "C/C++", "AI infra", "Agent", "日常", "课题研究"] as const;

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string().optional(),
    badge: z.string().optional(),
    draft: z.boolean().default(false),
    categories: z
      .array(z.enum(plannedCategories))
      .refine((items: string[]) => new Set(items).size === items.length, {
        message: "categories must be unique",
      })
      .optional(),
    tags: z
      .array(z.string())
      .refine((items: string[]) => new Set(items).size === items.length, {
        message: "tags must be unique",
      })
      .optional(),
  }),
});

export const collections = { blog };
