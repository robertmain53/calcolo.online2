"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryMetadata = exports.calculators = void 0;
exports.getCategories = getCategories;
exports.getCalculatorsByCategory = getCalculatorsByCategory;
exports.getCalculatorBySlug = getCalculatorBySlug;
exports.getCalculatorPath = getCalculatorPath;
const config_1 = require("./config");
/**
 * Central database of all calculators
 * Add new calculators here and they will automatically appear in:
 * - Category pages
 * - Sitemap
 * - Homepage
 */
exports.calculators = [
    {
        slug: 'roi-calculator',
        title: 'Calcolatore ROI (Return on Investment)',
        description: 'Calcola il ritorno sull\'investimento (ROI) per valutare la redditività e l\'efficacia dei tuoi progetti aziendali. Strumento essenziale per analisi finanziarie e decisioni di investimento.',
        metaDescription: 'Calcolatore ROI gratuito per misurare il ritorno sugli investimenti. Calcola la redditività dei progetti aziendali con formule certificate e analisi dettagliate.',
        category: 'finanza',
        keywords: [
            'ROI',
            'return on investment',
            'ritorno investimento',
            'calcolatore ROI',
            'analisi investimenti',
            'redditività progetto',
            'valutazione investimenti',
            'KPI finanziari',
            'business analysis',
        ],
        author: config_1.defaultAuthors.accountant,
        datePublished: '2024-01-15',
        dateModified: '2025-10-30',
        featured: true,
        schema: 'WebApplication',
    },
    // Add more calculators here following the same structure
    // Example:
    // {
    //   slug: 'ebitda-calculator',
    //   title: 'Calcolatore EBITDA',
    //   description: '...',
    //   category: 'finanza',
    //   ...
    // },
];
/**
 * Get all unique categories from calculators
 */
function getCategories() {
    const categories = new Set(exports.calculators.map((calc) => calc.category.toLowerCase()));
    return Array.from(categories);
}
/**
 * Get all calculators for a specific category
 */
function getCalculatorsByCategory(category) {
    const normalizedCategory = category.toLowerCase();
    return exports.calculators.filter((calc) => calc.category.toLowerCase() === normalizedCategory);
}
/**
 * Get a single calculator by slug
 */
function getCalculatorBySlug(slug) {
    const normalizedSlug = slug.toLowerCase();
    return exports.calculators.find((calc) => calc.slug.toLowerCase() === normalizedSlug);
}
/**
 * Get calculator full URL path
 */
function getCalculatorPath(calculator) {
    return `/${calculator.category}/${calculator.slug}`;
}
/**
 * Category metadata - customize as needed
 */
exports.categoryMetadata = {
    finanza: {
        title: 'Finanza e Business',
        description: 'Calcoli finanziari, analisi investimenti, valutazioni economiche e strumenti per decisioni aziendali strategiche. KPI, ROI, EBITDA e altri indicatori professionali.',
        icon: '💰',
    },
    // Add more categories as you create calculators
    ingegneria: {
        title: 'Ingegneria Strutturale',
        description: 'Calcoli strutturali, verifiche sismiche, dimensionamento elementi secondo NTC 2018 e Eurocodici.',
        icon: '🏗️',
    },
    matematica: {
        title: 'Matematica e Statistica',
        description: 'Calcolatori matematici avanzati per algebra, geometria, statistica e analisi numerica.',
        icon: '📊',
    },
};
