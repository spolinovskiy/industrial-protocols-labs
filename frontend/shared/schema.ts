import { z } from "zod";

// Export auth models (IMPORTANT: Required for Replit Auth)
export * from "./models/auth";

// Blog Post schema
export const blogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  author: z.string(),
  date: z.string(),
  category: z.string(),
  readTime: z.string(),
  tags: z.array(z.string()),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// Protocol schema - single page per protocol with FUXA integration
export const protocolSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortDescription: z.string(),
  overview: z.string(),
  transportLayer: z.object({
    type: z.string(),
    port: z.number(),
    description: z.string(),
  }),
  fuxaConfig: z.object({
    enabled: z.boolean(),
    hmiPath: z.string().optional(),
    serverPort: z.number().optional(),
  }),
  testWorkflow: z.array(z.string()),
  relatedBlogs: z.array(z.string()),
  libraryDocs: z.array(z.object({
    name: z.string(),
    url: z.string(),
    language: z.string(),
  })),
  icon: z.string(),
  guestAccess: z.boolean(),
});

export type Protocol = z.infer<typeof protocolSchema>;

// Tool schema
export const toolSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  content: z.string(),
  category: z.string(),
  version: z.string().optional(),
  installCommand: z.string().optional(),
  docsUrl: z.string().optional(),
  icon: z.string(),
});

export type Tool = z.infer<typeof toolSchema>;
