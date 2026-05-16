import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      order: z.number().int().positive(),
      roleLabel: z.string(),
      headshot: image(),
      headshotAlt: z.string().min(3),
      bio: z.string(),
      functionalExpertise: z.array(z.string()).nonempty(),
      industryExperience: z.array(z.string()).nonempty(),
      defaultTab: z.enum(['functional', 'industry']).default('functional'),
      legacyModalId: z.string().regex(/^modal(-\d+)?$/),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.enum(['operations', 'finance', 'digital', 'hr']),
      order: z.number().int().positive(),
      cardHeading: z.string(),
      cardBody: z.string(),
      cardImage: image(),
      cardImageAlt: z.string(),
      modalHeading: z.string(),
      modalSubheading: z.string(),
      modalImage: image(),
      modalImageAlt: z.string(),
      subServices: z
        .array(z.object({ title: z.string(), description: z.string() }))
        .min(1),
      legacyModalId: z.union([
        z.literal('modal'),
        z.literal('modal-2'),
        z.literal('modal-3'),
        z.literal('modal-4'),
      ]),
    }),
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/industries' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      order: z.number().int().positive(),
      tabLabel: z.string(),
      body: z.string(),
      image: image(),
      imageAlt: z.string(),
      imageClass: z.string().optional(),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      order: z.number().int().positive(),
      quote: z.string(),
      title: z.string(),
      color: z.enum(['light-blue', 'blue', 'orange']),
      portrait: image(),
      portraitAlt: z.string(),
    }),
});

const clientLogos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/client-logos' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      order: z.number().int().positive(),
      logo: image(),
      logoAlt: z.string(),
      sizeClass: z
        .enum(['max-1-75', 'max-2', 'max-2-25', 'max-3', 'osprey'])
        .optional(),
      externalUrl: z.string().url().optional(),
      brandClass: z
        .enum(['black-diamond', 'willis', 'greenfield', 'los-alamos'])
        .optional(),
    }),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/home' }),
  schema: z.object({
    headline: z.string(),
    subheadline: z.string(),
  }),
});

export const collections = {
  home,
  team,
  services,
  industries,
  testimonials,
  clientLogos,
};
