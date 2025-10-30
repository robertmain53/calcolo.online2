"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrganizationSchema = generateOrganizationSchema;
exports.generateWebSiteSchema = generateWebSiteSchema;
exports.generateCalculatorSchema = generateCalculatorSchema;
exports.generateArticleSchema = generateArticleSchema;
exports.generateBreadcrumbSchema = generateBreadcrumbSchema;
exports.generateFAQSchema = generateFAQSchema;
exports.generateHowToSchema = generateHowToSchema;
const config_1 = require("./config");
/**
 * Generate Organization schema for the entire site
 */
function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: config_1.siteConfig.organization.name,
        legalName: config_1.siteConfig.organization.legalName,
        url: config_1.siteConfig.url,
        logo: config_1.siteConfig.organization.logo,
        foundingDate: config_1.siteConfig.organization.foundingDate,
        address: {
            '@type': 'PostalAddress',
            streetAddress: config_1.siteConfig.organization.address.streetAddress,
            addressLocality: config_1.siteConfig.organization.address.addressLocality,
            postalCode: config_1.siteConfig.organization.address.postalCode,
            addressCountry: config_1.siteConfig.organization.address.addressCountry,
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
function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: config_1.siteConfig.name,
        url: config_1.siteConfig.url,
        description: config_1.siteConfig.description,
        inLanguage: 'it-IT',
        publisher: {
            '@type': 'Organization',
            name: config_1.siteConfig.organization.name,
            logo: {
                '@type': 'ImageObject',
                url: config_1.siteConfig.organization.logo,
            },
        },
    };
}
/**
 * Generate Calculator/SoftwareApplication schema
 * This helps Google understand your calculator is a tool
 */
function generateCalculatorSchema(calculator, fullUrl) {
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
function generateArticleSchema(calculator, fullUrl) {
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
            name: config_1.siteConfig.organization.name,
            logo: {
                '@type': 'ImageObject',
                url: config_1.siteConfig.organization.logo,
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
function generateBreadcrumbSchema(items) {
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
function generateFAQSchema(faqs) {
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
function generateHowToSchema(name, description, steps) {
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
