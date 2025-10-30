import { Calculator } from '@/types/calculator';
import { defaultAuthors } from './config';

/**
 * Central database of all calculators
 * Add new calculators here and they will automatically appear in:
 * - Category pages
 * - Sitemap
 * - Homepage
 */
export const calculators: Calculator[] = [
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
    author: defaultAuthors.accountant,
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
export function getCategories(): string[] {
  const categories = new Set(calculators.map(calc => calc.category));
  return Array.from(categories);
}

/**
 * Get all calculators for a specific category
 */
export function getCalculatorsByCategory(category: string): Calculator[] {
  return calculators.filter(calc => calc.category === category);
}

/**
 * Get a single calculator by slug
 */
export function getCalculatorBySlug(slug: string): Calculator | undefined {
  return calculators.find(calc => calc.slug === slug);
}

/**
 * Get calculator full URL path
 */
export function getCalculatorPath(calculator: Calculator): string {
  return `/${calculator.category}/${calculator.slug}`;
}

/**
 * Category metadata - customize as needed
 */
export const categoryMetadata: Record<string, {
  title: string;
  description: string;
  icon: string;
}> = {
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
