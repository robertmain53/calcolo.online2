import { Calculator } from '@/types/calculator';
import { siteConfig } from './config';

/**
 * Generate Organization schema for the entire site
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organization.name,
    legalName: siteConfig.organization.legalName,
    url: siteConfig.url,
    logo: siteConfig.organization.logo,
    foundingDate: siteConfig.organization.foundingDate,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.organization.address.streetAddress,
      addressLocality: siteConfig.organization.address.addressLocality,
      postalCode: siteConfig.organization.address.postalCode,
      addressCountry: siteConfig.organization.address.addressCountry,
    },
    sameAs: [
      // Add your social media profiles here
      'https://www.linkedin.com/company/calcolo-online',
      'https://twitter.com/calcolo_online',
    ],
  };
}

/**
 * Generate WebSite schema for better site links in search
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'it-IT',
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.organization.logo,
      },
    },
  };
}

/**
 * Generate Calculator/SoftwareApplication schema
 * This helps Google understand your calculator is a tool
 */
export function generateCalculatorSchema(
  calculator: Calculator,
  fullUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': calculator.schema || 'SoftwareApplication',
    name: calculator.title,
    description: calculator.description,
    url: fullUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: calculator.author.name,
      jobTitle: calculator.author.role,
      description: calculator.author.bio,
    },
    datePublished: calculator.datePublished,
    dateModified: calculator.dateModified,
    inLanguage: 'it-IT',
  };
}

/**
 * Generate Article schema for calculator pages
 * Good for E-E-A-T signals
 */
export function generateArticleSchema(
  calculator: Calculator,
  fullUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: calculator.title,
    description: calculator.description,
    url: fullUrl,
    datePublished: calculator.datePublished,
    dateModified: calculator.dateModified,
    author: {
      '@type': 'Person',
      name: calculator.author.name,
      jobTitle: calculator.author.role,
      description: calculator.author.bio,
      sameAs: calculator.author.linkedIn ? [calculator.author.linkedIn] : [],
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.organization.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    inLanguage: 'it-IT',
  };
}

/**
 * Generate BreadcrumbList schema for better navigation in search results
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ schema - add this to calculators with common questions
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate HowTo schema for step-by-step calculator guides
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Generate ItemList schema for category pages
 */
export function generateCategoryItemListSchema(
  categoryTitle: string,
  categoryDescription: string,
  categoryUrl: string,
  calculators: Calculator[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryTitle} - Calcolatori`,
    description: categoryDescription,
    url: categoryUrl,
    numberOfItems: calculators.length,
    itemListElement: calculators.map((calculator, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: calculator.title,
      description: calculator.metaDescription,
      url: `${siteConfig.url}/${calculator.category}/${calculator.slug}`,
    })),
  };
}
