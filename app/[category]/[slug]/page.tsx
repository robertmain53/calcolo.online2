import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import {
  calculators,
  categoryMetadata,
  getCalculatorBySlug,
  getCalculatorPath,
} from '@/lib/calculators';
import { siteConfig } from '@/lib/config';
import {
  generateCalculatorSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/structured-data';
import ROICalculator from '@/components/ROICalculator';

interface CalculatorPageProps {
  params: {
    category: string;
    slug: string;
  };
}

const faqContentBySlug: Record<
  string,
  Array<{ question: string; answer: string }>
> = {
  'roi-calculator': [
    {
      question: "Cos'è il ROI (Return on Investment)?",
      answer:
        "Il ROI (Return on Investment) è un indicatore finanziario che misura la redditività di un investimento. Si calcola dividendo il profitto netto per il costo dell'investimento iniziale. Un ROI positivo indica che l'investimento sta generando profitto.",
    },
    {
      question: 'Come si calcola il ROI?',
      answer:
        "Il ROI si calcola con la formula: ROI = (Ricavi - Costi - Investimento) / Investimento × 100. Il risultato è espresso in percentuale e indica quanto guadagni per ogni euro investito.",
    },
    {
      question: "Cos'è il periodo di recupero (Payback Period)?",
      answer:
        "Il periodo di recupero indica quanto tempo è necessario per recuperare l'investimento iniziale attraverso i flussi di cassa generati. Un periodo più breve indica un investimento più sicuro.",
    },
    {
      question: 'Qual è un buon valore di ROI?',
      answer:
        'Un buon ROI dipende dal settore e dal tipo di investimento. Generalmente, un ROI superiore al 10-15% annuo è considerato buono. Per progetti a breve termine, anche un ROI del 5-7% può essere accettabile.',
    },
  ],
};

const howToContentBySlug: Record<
  string,
  {
    name: string;
    description: string;
    steps: Array<{ name: string; text: string }>;
  }
> = {
  'roi-calculator': {
    name: 'Come Calcolare il ROI',
    description: 'Guida passo-passo per calcolare il Return on Investment',
    steps: [
      {
        name: "Inserisci l'investimento iniziale",
        text: "Indica l'ammontare totale che hai investito nel progetto o nell'attività.",
      },
      {
        name: 'Specifica i ricavi totali',
        text: "Inserisci i ricavi totali generati dall'investimento nel periodo considerato.",
      },
      {
        name: 'Aggiungi i costi operativi',
        text: "Indica tutti i costi sostenuti per operare il progetto (escluso l'investimento iniziale).",
      },
      {
        name: 'Seleziona il periodo',
        text: 'Scegli il numero di mesi su cui vuoi calcolare il ROI.',
      },
      {
        name: 'Analizza i risultati',
        text: 'Valuta il ROI percentuale, il profitto netto e il periodo di recupero per prendere decisioni informate.',
      },
    ],
  },
};

const calculatorComponents: Record<string, ComponentType | undefined> = {
  'roi-calculator': ROICalculator,
};

function normalizeCategoryParam(param: string | string[] | undefined): string {
  if (!param) return '';
  const value = Array.isArray(param) ? param[0] : param;
  const lowerValue = value.toLowerCase();
  const knownCategories = Object.keys(categoryMetadata);
  return (
    knownCategories.find(
      (category) => category.toLowerCase() === lowerValue
    ) ?? lowerValue
  );
}

function normalizeSlugParam(param: string | string[] | undefined): string {
  if (!param) return '';
  const value = Array.isArray(param) ? param[0] : param;
  const lowerValue = value.toLowerCase();
  const matchingCalculator = calculators.find(
    (calculator) => calculator.slug.toLowerCase() === lowerValue
  );
  return matchingCalculator ? matchingCalculator.slug : lowerValue;
}

export async function generateStaticParams() {
  return calculators.map(({ category, slug }) => ({
    category,
    slug,
  }));
}

export async function generateMetadata({
  params,
}: CalculatorPageProps): Promise<Metadata> {
  const normalizedCategory = normalizeCategoryParam(params?.category);
  const slug = normalizeSlugParam(params?.slug);
  const calculator = getCalculatorBySlug(slug);
  if (!calculator) {
    return {};
  }

  const categorySlug = normalizedCategory || calculator.category;
  if (calculator.category !== categorySlug) {
    return {};
  }

  const url = `${siteConfig.url}${getCalculatorPath(calculator)}`;
  const ogImage = `/calculators/${calculator.slug}-og.png`;

  return {
    title: calculator.title,
    description: calculator.metaDescription,
    keywords: calculator.keywords,
    authors: [
      {
        name: calculator.author.name,
        url: calculator.author.linkedIn,
      },
    ],
    openGraph: {
      title: calculator.title,
      description: calculator.metaDescription,
      url,
      siteName: siteConfig.name,
      type: 'article',
      locale: 'it_IT',
      authors: [calculator.author.name],
      publishedTime: calculator.datePublished,
      modifiedTime: calculator.dateModified,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: calculator.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: calculator.title,
      description: calculator.metaDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function CalculatorPage({ params }: CalculatorPageProps) {
  const normalizedCategory = normalizeCategoryParam(params?.category);
  const slug = normalizeSlugParam(params?.slug);
  const calculator = getCalculatorBySlug(slug);

  if (!calculator) {
    notFound();
  }

  const categorySlug = normalizedCategory || calculator.category;
  if (calculator.category !== categorySlug) {
    notFound();
  }

  const fullUrl = `${siteConfig.url}${getCalculatorPath(calculator)}`;
  const categoryMeta = categoryMetadata[categorySlug];
  const CalculatorComponent = calculatorComponents[calculator.slug];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    {
      name: categoryMeta ? categoryMeta.title : calculator.category,
      url: `${siteConfig.url}/${categorySlug}`,
    },
    { name: calculator.title, url: fullUrl },
  ]);

  const faqContent = faqContentBySlug[calculator.slug] || [];
  const howToContent = howToContentBySlug[calculator.slug];

  const calculatorSchema = generateCalculatorSchema(calculator, fullUrl);
  const articleSchema = generateArticleSchema(calculator, fullUrl);
  const faqSchema =
    faqContent.length > 0 ? generateFAQSchema(faqContent) : null;
  const howToSchema = howToContent
    ? generateHowToSchema(
        howToContent.name,
        howToContent.description,
        howToContent.steps
      )
    : null;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(calculatorSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
      )}

      <article className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link href={`/${categorySlug}`} className="hover:text-blue-600">
            {categoryMeta ? categoryMeta.title : calculator.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{calculator.title}</span>
        </nav>

        {/* Header with E-E-A-T Signals */}
        <header>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {calculator.title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {calculator.description}
          </p>

          {/* Author Badge - Critical for E-E-A-T */}
          <div className="mt-6 flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
              {calculator.author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                {calculator.author.name}
              </div>
              <div className="text-sm text-gray-600">
                {calculator.author.role}
              </div>
              <div className="text-sm text-gray-600">
                {calculator.author.credentials}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {calculator.author.bio}
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              Pubblicato:
            </span>{' '}
            {new Date(calculator.datePublished).toLocaleDateString('it-IT')}
            <span className="mx-2">•</span>
            <span className="font-medium text-gray-700">Aggiornato:</span>{' '}
            {new Date(calculator.dateModified).toLocaleDateString('it-IT')}
          </div>
        </header>

        {/* Calculator Component */}
        {CalculatorComponent ? (
          <CalculatorComponent />
        ) : (
          <p className="section-card">
            Il componente per questo calcolatore non è ancora stato configurato.
          </p>
        )}
      </article>
    </>
  );
}
