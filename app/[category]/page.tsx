import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getCalculatorsByCategory,
  categoryMetadata,
  getCalculatorPath,
} from '@/lib/calculators';
import { siteConfig } from '@/lib/config';
import { generateBreadcrumbSchema } from '@/lib/structured-data';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

function normalizeCategoryParam(param: string | string[] | undefined): string {
  if (!param) return '';
  const value = Array.isArray(param) ? param[0] : param;
  const lowerValue = value.toLowerCase();
  const categories = getCategories();
  return (
    categories.find((category) => category.toLowerCase() === lowerValue) ??
    lowerValue
  );
}

// Generate static params for all categories at build time
export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    category,
  }));
}

// Generate metadata for each category page
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const categorySlug = normalizeCategoryParam(params?.category);
  if (!categorySlug) {
    return {
      title: 'Categoria Non Trovata',
    };
  }
  const meta = categoryMetadata[categorySlug];

  if (!meta) {
    return {
      title: 'Categoria Non Trovata',
    };
  }

  const calculators = getCalculatorsByCategory(categorySlug);
  const url = `${siteConfig.url}/${categorySlug}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      meta.title.toLowerCase(),
      'calcolatori',
      'strumenti professionali',
      ...calculators.flatMap((c) => c.keywords).slice(0, 10),
    ],
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: 'it_IT',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = normalizeCategoryParam(params?.category);
  if (!categorySlug) {
    notFound();
  }
  const meta = categoryMetadata[categorySlug];
  const calculators = getCalculatorsByCategory(categorySlug);

  if (!meta || calculators.length === 0) {
    notFound();
  }

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: meta.title, url: `${siteConfig.url}/${categorySlug}` },
  ]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{meta.title}</span>
        </nav>

        {/* Category Header */}
        <header>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{meta.icon}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{meta.title}</h1>
              <p className="text-gray-600 mt-2">
                {calculators.length} calcolatori disponibili
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
            {meta.description}
          </p>
        </header>

        {/* Calculators Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calculators.map((calculator) => {
              const path = getCalculatorPath(calculator);
              return (
                <Link
                  key={calculator.slug}
                  href={path}
                  className="section-card hover:shadow-md transition-shadow group"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {calculator.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {calculator.description}
                  </p>

                  {/* Author Badge */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-4 border-t">
                    <span className="font-medium">{calculator.author.name}</span>
                    <span>•</span>
                    <span>{calculator.author.role}</span>
                  </div>

                  {/* Featured Badge */}
                  {calculator.featured && (
                    <div className="mt-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ⭐ In Evidenza
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Category-specific Info Section */}
        <section className="section-card bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Informazioni su {meta.title}
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              I nostri calcolatori per {meta.title.toLowerCase()} sono sviluppati
              da professionisti certificati e validati secondo le normative vigenti.
              Ogni strumento fornisce risultati immediati e accurati, essenziali
              per il tuo lavoro quotidiano.
            </p>
            <p>
              Gli strumenti sono costantemente aggiornati per riflettere le più
              recenti normative tecniche, fiscali e professionali. Tutti i calcoli
              citano esplicitamente le fonti normative utilizzate.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
