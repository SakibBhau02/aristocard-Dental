/* ------------------------------------------------------------------ */
/*  Shared type for the 24-post blog seed (Oct 2026 content round).   */
/*  Mirrors the Prisma BlogPost model / mapBlogPost shape.            */
/* ------------------------------------------------------------------ */

export type SeedSection = {
  heading: string;
  body: string[];
  list?: string[];
};

export type NewBlogPost = {
  slug: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  category: string;
  readTime: string;
  date: string;
  updated?: string;
  author: string;
  authorCredentials: string;
  featured?: boolean;
  tags: string[];
  serviceRefs: string[];
  image: string;
  imageAlt: string;
  quickAnswer: string;
  quickAnswerBn: string;
  sections: SeedSection[];
  sectionsBn: SeedSection[];
};
