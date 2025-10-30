import { Metadata } from 'next';
import Link from 'next/link';
import ROICalculator from '@/components/ROICalculator';
import { getCalculatorBySlug, getCalculatorPath } from '@/lib/calculators';
import { siteConfig } from '@/lib/config';
import {
  generateCalculatorSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/structured-data';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const calculator = getCalculatorBySlug('roi-calculator');
  if (!calculator) return {};

  const url = `${siteConfig.url}${getCalculatorPath(calculator)}`;

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
      type: 'website',
      locale: 'it_IT',
      publishedTime: calculator.datePublished,
      modifiedTime: calculator.dateModified,
      images: [
        {
          url: '/calculators/roi-calculator-og.png',
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
      images: ['/calculators/roi-calculator-og.png'],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function ROICalculatorPage() {
  const calculator = getCalculatorBySlug('roi-calculator');
  if (!calculator) return null;

  const fullUrl = `${siteConfig.url}${getCalculatorPath(calculator)}`;

  // Structured Data
  const calculatorSchema = generateCalculatorSchema(calculator, fullUrl);
  const articleSchema = generateArticleSchema(calculator, fullUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Finanza', url: `${siteConfig.url}/finanza` },
    { name: calculator.title, url: fullUrl },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: 'Cos\'è il ROI (Return on Investment)?',
      answer:
        'Il ROI (Return on Investment) è un indicatore finanziario che misura la redditività di un investimento. Si calcola dividendo il profitto netto per il costo dell\'investimento iniziale. Un ROI positivo indica che l\'investimento sta generando profitto.',
    },
    {
      question: 'Come si calcola il ROI?',
      answer:
        'Il ROI si calcola con la formula: ROI = (Ricavi - Costi - Investimento) / Investimento × 100. Il risultato è espresso in percentuale e indica quanto guadagni per ogni euro investito.',
    },
    {
      question: 'Cos\'è il periodo di recupero (Payback Period)?',
      answer:
        'Il periodo di recupero indica quanto tempo è necessario per recuperare l\'investimento iniziale attraverso i flussi di cassa generati. Un periodo più breve indica un investimento più sicuro.',
    },
    {
      question: 'Qual è un buon valore di ROI?',
      answer:
        'Un buon ROI dipende dal settore e dal tipo di investimento. Generalmente, un ROI superiore al 10-15% annuo è considerato buono. Per progetti a breve termine, anche un ROI del 5-7% può essere accettabile.',
    },
  ]);

  const howToSchema = generateHowToSchema(
    'Come Calcolare il ROI',
    'Guida passo-passo per calcolare il Return on Investment',
    [
      {
        name: 'Inserisci l\'investimento iniziale',
        text: 'Indica l\'ammontare totale che hai investito nel progetto o nell\'attività.',
      },
      {
        name: 'Specifica i ricavi totali',
        text: 'Inserisci i ricavi totali generati dall\'investimento nel periodo considerato.',
      },
      {
        name: 'Aggiungi i costi operativi',
        text: 'Indica tutti i costi sostenuti per operare il progetto (escluso l\'investimento iniziale).',
      },
      {
        name: 'Seleziona il periodo',
        text: 'Scegli il numero di mesi su cui vuoi calcolare il ROI.',
      },
      {
        name: 'Analizza i risultati',
        text: 'Valuta il ROI percentuale, il profitto netto e il periodo di recupero per prendere decisioni informate.',
      },
    ]
  );

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />

      <article className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/finanza" className="hover:text-blue-600">
            Finanza
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">ROI Calculator</span>
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
              {calculator.author.linkedIn && (
                <a
                  href={calculator.author.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  LinkedIn →
                </a>
              )}
            </div>
          </div>

          {/* Publication Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
            <span>
              Pubblicato: {new Date(calculator.datePublished).toLocaleDateString('it-IT')}
            </span>
            <span>•</span>
            <span>
              Aggiornato: {new Date(calculator.dateModified).toLocaleDateString('it-IT')}
            </span>
          </div>
        </header>

        {/* Calculator Component */}
        <ROICalculator />

        {/* Educational Content for SEO */}
        <section className="section-card prose prose-lg max-w-none">
          <h2>Cos'è il ROI e Come si Calcola</h2>
          
          <p>
            Il <strong>Return on Investment (ROI)</strong> è uno degli indicatori
            finanziari più importanti per valutare la redditività di un investimento.
            Misura il rendimento generato rispetto al capitale investito, permettendo
            di confrontare diverse opportunità di investimento e prendere decisioni
            strategiche informate.
          </p>

          <h3>Formula del ROI</h3>
          
          <p>
            La formula base per calcolare il ROI è:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6 text-center">
            <code className="text-lg">
              ROI = (Ricavi - Costi - Investimento) / Investimento × 100
            </code>
          </div>

          <p>
            Dove:
          </p>
          <ul>
            <li>
              <strong>Ricavi:</strong> I ricavi totali generati dall'investimento
            </li>
            <li>
              <strong>Costi:</strong> I costi operativi sostenuti (escluso l'investimento iniziale)
            </li>
            <li>
              <strong>Investimento:</strong> Il capitale iniziale investito
            </li>
          </ul>

          <h3>Interpretazione del ROI</h3>

          <p>
            Il risultato del calcolo del ROI può essere interpretato come segue:
          </p>

          <ul>
            <li>
              <strong>ROI positivo ({">"} 0%):</strong> L'investimento sta generando
              profitto. Più alto è il valore, migliore è il rendimento.
            </li>
            <li>
              <strong>ROI negativo ({"<"} 0%):</strong> L'investimento sta generando
              una perdita. È necessario valutare se continuare con il progetto.
            </li>
            <li>
              <strong>ROI neutro (= 0%):</strong> L'investimento sta recuperando
              esattamente i costi, senza generare profitto né perdita.
            </li>
          </ul>

          <h3>Periodo di Recupero (Payback Period)</h3>

          <p>
            Oltre al ROI, è importante calcolare il <strong>periodo di recupero</strong>,
            che indica quanto tempo è necessario per recuperare l'investimento iniziale
            attraverso i flussi di cassa generati. Un periodo più breve indica
            generalmente un investimento più sicuro e liquido.
          </p>

          <h3>Applicazioni Pratiche del ROI</h3>

          <p>
            Il calcolo del ROI è fondamentale in diversi contesti aziendali:
          </p>

          <ul>
            <li>
              <strong>Valutazione progetti:</strong> Confrontare diverse opportunità
              di investimento per scegliere la più redditizia
            </li>
            <li>
              <strong>Marketing:</strong> Misurare l'efficacia delle campagne
              pubblicitarie e di marketing
            </li>
            <li>
              <strong>IT e tecnologia:</strong> Valutare investimenti in software,
              hardware e infrastrutture digitali
            </li>
            <li>
              <strong>Immobiliare:</strong> Analizzare la redditività di investimenti
              immobiliari
            </li>
            <li>
              <strong>Formazione:</strong> Calcolare il ritorno su investimenti
              in formazione del personale
            </li>
          </ul>

          <h3>Limiti del ROI</h3>

          <p>
            Sebbene il ROI sia uno strumento potente, presenta alcuni limiti:
          </p>

          <ul>
            <li>
              Non considera il <strong>valore temporale del denaro</strong> (un euro
              oggi vale più di un euro domani)
            </li>
            <li>
              Non tiene conto del <strong>rischio</strong> associato all'investimento
            </li>
            <li>
              Può essere manipolato scegliendo <strong>periodi di riferimento</strong> diversi
            </li>
            <li>
              Non considera i <strong>costi opportunità</strong> di investimenti alternativi
            </li>
          </ul>

          <p>
            Per una valutazione completa, è consigliabile utilizzare il ROI insieme
            ad altri indicatori finanziari come il VAN (Valore Attuale Netto),
            TIR (Tasso Interno di Rendimento) e il rapporto costi-benefici.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="section-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Domande Frequenti sul ROI
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cos'è il ROI (Return on Investment)?
              </h3>
              <p className="text-gray-700">
                Il ROI (Return on Investment) è un indicatore finanziario che
                misura la redditività di un investimento. Si calcola dividendo
                il profitto netto per il costo dell'investimento iniziale.
                Un ROI positivo indica che l'investimento sta generando profitto.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Come si calcola il ROI?
              </h3>
              <p className="text-gray-700">
                Il ROI si calcola con la formula: ROI = (Ricavi - Costi - Investimento)
                / Investimento × 100. Il risultato è espresso in percentuale e
                indica quanto guadagni per ogni euro investito.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cos'è il periodo di recupero (Payback Period)?
              </h3>
              <p className="text-gray-700">
                Il periodo di recupero indica quanto tempo è necessario per
                recuperare l'investimento iniziale attraverso i flussi di cassa
                generati. Un periodo più breve indica un investimento più sicuro.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Qual è un buon valore di ROI?
              </h3>
              <p className="text-gray-700">
                Un buon ROI dipende dal settore e dal tipo di investimento.
                Generalmente, un ROI superiore al 10-15% annuo è considerato buono.
                Per progetti a breve termine, anche un ROI del 5-7% può essere
                accettabile.
              </p>
            </div>
          </div>
        </section>

        {/* Related Calculators */}
        <section className="section-card bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Calcolatori Correlati
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/finanza/ebitda-calculator"
              className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Calcolatore EBITDA</h3>
              <p className="text-sm text-gray-600 mt-1">
                Calcola il margine operativo lordo della tua azienda
              </p>
            </Link>
            <Link
              href="/finanza/npv-calculator"
              className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">Calcolatore VAN</h3>
              <p className="text-sm text-gray-600 mt-1">
                Calcola il valore attuale netto degli investimenti
              </p>
            </Link>
          </div>
        </section>

        {/* Trust/Disclaimer Section */}
        <section className="section-card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ⚠️ Avvertenza
          </h3>
          <p className="text-sm text-gray-700">
            Questo calcolatore fornisce stime indicative basate sui dati inseriti.
            I risultati non costituiscono consulenza finanziaria professionale.
            Per decisioni di investimento importanti, consulta sempre un
            commercialista o un consulente finanziario qualificato. Gli autori
            non si assumono responsabilità per decisioni prese sulla base di
            questi calcoli.
          </p>
        </section>
      </article>
    </>
  );
}
