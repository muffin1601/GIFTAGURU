export type BlogSection = { heading: string; body?: string[]; bullets?: string[] };
export type BlogFaq = { question: string; answer: string };
export type BlogLink = { label: string; href: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
  relatedLinks: BlogLink[];
  recommendedProductSlugs: string[];
  category: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  authorName?: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  focusKeyword?: string;
  isFeatured: boolean;
  publishedAt: Date;
  updatedAt: Date;
};
