/**
 * Core types for the calculator system
 */

export interface Author {
  name: string;
  role: string;
  credentials: string;
  bio: string;
  image?: string;
  linkedIn?: string;
  email?: string;
}

export interface Calculator {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  category: string;
  keywords: string[];
  author: Author;
  datePublished: string;
  dateModified: string;
  featured?: boolean;
  schema?: 'SoftwareApplication' | 'WebApplication';
}

export interface Category {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  icon?: string;
  calculators: Calculator[];
}

export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  locale: string;
  organization: {
    name: string;
    legalName: string;
    url: string;
    logo: string;
    foundingDate: string;
    taxId?: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      postalCode: string;
      addressCountry: string;
    };
  };
}
