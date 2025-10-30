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
import SimplySupportedBeamCalculator from '@/components/SimplySupportedBeamCalculator';
import RCSectionSLUCalculator from '@/components/RCSectionSLUCalculator';
import RCColumnBiaxialCalculator from '@/components/RCColumnBiaxialCalculator';
import SteelBeamSLUCalculator from '@/components/SteelBeamSLUCalculator';
import LoadCombinationCalculator from '@/components/LoadCombinationCalculator';
import TerzaghiBearingCapacityCalculator from '@/components/TerzaghiBearingCapacityCalculator';
import RetainingWallCalculator from '@/components/RetainingWallCalculator';
import LaterocementoSlabCalculator from '@/components/LaterocementoSlabCalculator';
import WoodBeamSLUCalculator from '@/components/WoodBeamSLUCalculator';

interface CalculatorPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

const faqContentBySlug: Record<
  string,
  Array<{ question: string; answer: string }>
> = {
  'verifica-trave-ca': [
    {
      question: 'Quali normative considera il calcolo della trave in cemento armato?',
      answer:
        'Il calcolatore applica le prescrizioni delle NTC 2018 e degli Eurocodici 2 e 8 per combinazioni SLU e SLE, consentendo di selezionare classi di resistenza del calcestruzzo e dell\'acciaio.',
    },
    {
      question: 'Posso esportare i risultati per la relazione strutturale?',
      answer:
        'Sì, il report comprende schemi di armatura, verifiche a taglio e pressoflessione con dettagli e valori intermedi pronti da inserire nella relazione tecnica asseverata.',
    },
  ],
  'valutazione-rischio-cantiere': [
    {
      question: 'Il tool è adatto per PSC e POS?',
      answer:
        'La matrice restituisce livelli di rischio con misure preventive, DPI consigliati e note di coordinamento utili sia per il PSC che per il POS aziendale.',
    },
    {
      question: 'Posso personalizzare le schede dei pericoli?',
      answer:
        'È possibile aggiungere pericoli specifici del cantiere, definire probabilità e magnitudo, oltre a salvare modelli riutilizzabili per lavorazioni ripetitive.',
    },
  ],
  'trasmittanza-termica-pareti': [
    {
      question: 'Il calcolo è conforme alle verifiche della Legge 10?',
      answer:
        'Il calcolatore verifica automaticamente i limiti del DM 26/06/2015 per zona climatica e restituisce spessori e trasmittanze da allegare alla relazione Legge 10.',
    },
    {
      question: 'Sono disponibili librerie di materiali?',
      answer:
        'Include un database aggiornato di materiali con conducibilità certificata ed è possibile aggiungere materiali personalizzati con valori dichiarati.',
    },
  ],
  'dimensionamento-cavi-bt': [
    {
      question: 'Considera le tabelle CEI 64-8 per il dimensionamento?',
      answer:
        'Sì, il software utilizza le tabelle CEI 64-8 per calcolare la portata in funzione della posa, della temperatura e del numero di circuiti affiancati.',
    },
    {
      question: 'Posso valutare la selettività delle protezioni?',
      answer:
        'Vengono forniti suggerimenti sulla selettività magnetica e termica tra interruttori consecutivi con controllo della corrente di corto circuito presunta.',
    },
  ],
  'dimensionamento-rete-fognaria': [
    {
      question: 'Quali metodi di calcolo supporta per la portata?',
      answer:
        'Il calcolo utilizza il metodo razionale e consente di impostare coefficienti di deflusso per superfici impermeabili, semi-permeabili e naturali.',
    },
    {
      question: 'Il report include le verifiche di velocità minima?',
      answer:
        'Sì, per ogni tratto vengono riportate velocità, pendenze, riempimento e note sulle condizioni di autopulizia della condotta.',
    },
  ],
  'verifica-portanza-palo': [
    {
      question: 'È possibile lavorare con prove penetrometriche?',
      answer:
        'Sono supportate sia prove CPT/CPTU sia risultati di prove SPT, con correlazioni automatiche per la stima dei parametri di resistenza laterale e di punta.',
    },
    {
      question: 'Il calcolo considera i cedimenti ammissibili?',
      answer:
        'Oltre alla portanza ultima, viene valutato il cedimento elastico e viscoso del palo confrontandolo con il valore massimo impostato dal progettista.',
    },
  ],
  'calcolo-roi-return-on-investment': [
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
  'calcolo-break-even-point-studio-tecnico': [
    {
      question: 'Quali dati servono per il calcolo del break even?',
      answer:
        'Inserisci costi fissi annuali, costo variabile unitario, prezzo di vendita e volumi attesi. Il tool restituisce la quantità di equilibrio e il margine di sicurezza.',
    },
    {
      question: 'Posso visualizzare il grafico costi-ricavi?',
      answer:
        'Il calcolatore genera il diagramma interattivo costi/ricavi per analizzare l\'andamento degli utili al variare dei volumi di vendita.',
    },
  ],
  'trasformazione-coordinate-gauss': [
    {
      question: 'Sono supportate trasformazioni tra Gauss-Boaga e WGS84?',
      answer:
        'Il tool esegue rototraslazioni a 7 parametri tra Gauss-Boaga, UTM e WGS84, consentendo di impostare parametri personalizzati o di usare quelli ufficiali.',
    },
    {
      question: 'Posso importare punti da file CSV?',
      answer:
        'È possibile caricare punti da file CSV o DXF, elaborare la trasformazione in batch e scaricare il risultato con gli scarti residui.',
    },
  ],
  'convertitore-unita-pressione': [
    {
      question: 'Quali unità di pressione sono disponibili?',
      answer:
        'Il convertitore gestisce Pascal, bar, psi, atmosfere tecniche, mmHg, kPa e torr, con precisione configurabile fino a 6 cifre decimali.',
    },
    {
      question: 'È possibile salvare le conversioni frequenti?',
      answer:
        'Puoi aggiungere ai preferiti le conversioni più utilizzate e accedervi rapidamente da qualsiasi dispositivo autenticato.',
    },
  ],
  'gestione-scadenze-cantiere': [
    {
      question: 'Che tipo di scadenze posso gestire?',
      answer:
        'Il planner consente di monitorare permessi edilizi, verifiche periodiche, scadenze DPI, formazione sicurezza e consegna elaborati di progetto.',
    },
    {
      question: 'Sono previste notifiche automatiche?',
      answer:
        'Puoi configurare reminder via email e calendario per ogni attività, con livelli di priorità e assegnazione a membri del team.',
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
  'verifica-trave-ca': {
    name: 'Come Verificare una Trave in C.A.',
    description: 'Procedura guidata per il dimensionamento di travi in cemento armato secondo NTC 2018.',
    steps: [
      {
        name: 'Definisci geometria e materiali',
        text: 'Inserisci luci, sezione, classe del calcestruzzo e dell\'acciaio, oltre ai copriferri richiesti.',
      },
      {
        name: 'Applica i carichi',
        text: 'Carica permanenti, variabili e sismici con relativa combinazione e schema statico.',
      },
      {
        name: 'Analizza le verifiche',
        text: 'Controlla pressoflessione, taglio e deformazioni confrontandole con i limiti normativi.',
      },
    ],
  },
  'valutazione-rischio-cantiere': {
    name: 'Come Valutare i Rischi di Cantiere',
    description: 'Passi essenziali per classificare i rischi e pianificare le misure di prevenzione.',
    steps: [
      {
        name: 'Identifica le lavorazioni',
        text: 'Seleziona le attività presenti in cantiere e le attrezzature associate.',
      },
      {
        name: 'Stima rischio e misure',
        text: 'Valuta probabilità e magnitudo, quindi associa DPI, procedure e responsabilità.',
      },
      {
        name: 'Genera la matrice',
        text: 'Esporta la matrice dei rischi e integrala nel PSC o nel POS aziendale.',
      },
    ],
  },
  'trasmittanza-termica-pareti': {
    name: 'Come Calcolare la Trasmittanza di una Parete',
    description: 'Procedura passo-passo per verificare la trasmittanza delle pareti opache.',
    steps: [
      {
        name: 'Configura la stratigrafia',
        text: 'Inserisci gli strati con spessore, conducibilità e calore specifico oppure utilizza la libreria materiali.',
      },
      {
        name: 'Imposta la zona climatica',
        text: 'Seleziona la zona climatica e lascia che il sistema recuperi i limiti normativi.',
      },
      {
        name: 'Analizza i risultati',
        text: 'Valuta la trasmittanza U, la massa superficiale e confronta i limiti di legge.',
      },
    ],
  },
  'dimensionamento-cavi-bt': {
    name: 'Come Dimensionare un Cavo BT',
    description: 'Guida rapida per scegliere la sezione del cavo e verificare cadute di tensione.',
    steps: [
      {
        name: 'Inserisci il carico',
        text: 'Definisci corrente, tensione, lunghezza, potenza e fattore di potenza del circuito.',
      },
      {
        name: 'Definisci posa e protezioni',
        text: 'Seleziona metodo di posa, temperatura ambiente e interruttore associato.',
      },
      {
        name: 'Consulta la scheda tecnica',
        text: 'Analizza portata, caduta di tensione e suggerimenti sulle protezioni magnetotermiche.',
      },
    ],
  },
  'dimensionamento-rete-fognaria': {
    name: 'Come Dimensionare una Condotta Fognaria',
    description: 'Metodo per dimensionare reti fognarie pluviali e miste.',
    steps: [
      {
        name: 'Definisci i bacini scolanti',
        text: 'Inserisci superfici di contribuzione con coefficienti di deflusso e tempo di corrivazione.',
      },
      {
        name: 'Calcola portate e diametri',
        text: 'Il tool determina portate di progetto, diametri commerciali e verifica il riempimento.',
      },
      {
        name: 'Esporta il report tecnico',
        text: 'Scarica la tabella con le verifiche di velocità, pendenze e note tecniche.',
      },
    ],
  },
  'verifica-portanza-palo': {
    name: 'Come Verificare la Portanza di un Palo',
    description: 'I passaggi fondamentali per stimare la portanza ultima e i cedimenti di un palo di fondazione.',
    steps: [
      {
        name: 'Inserisci stratigrafia e prove',
        text: 'Definisci i livelli del terreno, le prove CPT/SPT e i parametri geotecnici disponibili.',
      },
      {
        name: 'Calcola resistenza laterale e di punta',
        text: 'Il software combina i contributi laterali e di punta generando diagrammi di carico.',
      },
      {
        name: 'Verifica i cedimenti',
        text: 'Controlla i cedimenti stimati rispetto al limite imposto e genera il report sintetico.',
      },
    ],
  },
  'calcolo-roi-return-on-investment': {
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
  'calcolo-break-even-point-studio-tecnico': {
    name: 'Come Calcolare il Break Even Point',
    description: 'Approccio guidato per individuare il punto di pareggio aziendale.',
    steps: [
      {
        name: 'Raccogli i dati economici',
        text: 'Inserisci costi fissi, costo variabile unitario e prezzo di vendita dei prodotti o servizi.',
      },
      {
        name: 'Analizza margini e volumi',
        text: 'Osserva margine di contribuzione, quantità critica e margine di sicurezza.',
      },
      {
        name: 'Scarica il grafico del BEP',
        text: 'Esporta il grafico costi-ricavi per condividerlo con il management o inserirlo nel business plan.',
      },
    ],
  },
  'trasformazione-coordinate-gauss': {
    name: 'Come Trasformare Coordinate Gauss-Boaga',
    description: 'Guida per convertire punti tra sistemi cartografici nazionali e globali.',
    steps: [
      {
        name: 'Importa i punti di rilievo',
        text: 'Carica i punti da file CSV o inseriscili manualmente con le coordinate note.',
      },
      {
        name: 'Scegli sistema di destinazione',
        text: 'Seleziona il sistema di arrivo (UTM, WGS84) e i parametri di trasformazione disponibili.',
      },
      {
        name: 'Ottieni la trasformazione compensata',
        text: 'Scarica le nuove coordinate insieme agli scarti residui e alla qualità della trasformazione.',
      },
    ],
  },
  'convertitore-unita-pressione': {
    name: 'Come Convertire un\'Unità di Pressione',
    description: 'Passi essenziali per convertire pressioni tra sistemi internazionali e imperiali.',
    steps: [
      {
        name: 'Seleziona le unità di partenza e arrivo',
        text: 'Scegli l\'unità di origine e quella di destinazione tra le opzioni disponibili.',
      },
      {
        name: 'Inserisci il valore',
        text: 'Digita il valore da convertire e definisci il numero di cifre decimali desiderate.',
      },
      {
        name: 'Salva la conversione',
        text: 'Opzionalmente aggiungi la conversione ai preferiti per riutilizzarla rapidamente.',
      },
    ],
  },
  'gestione-scadenze-cantiere': {
    name: 'Come Organizzare le Scadenze di Cantiere',
    description: 'Procedura per gestire in modo efficiente scadenze e permessi di un cantiere.',
    steps: [
      {
        name: 'Crea il progetto',
        text: 'Imposta il cantiere, assegna i responsabili e definisci la durata delle lavorazioni.',
      },
      {
        name: 'Registra le scadenze critiche',
        text: 'Aggiungi permessi, verifiche, collaudi e attività di sicurezza con relative date e documenti.',
      },
      {
        name: 'Attiva le notifiche',
        text: 'Configura promemoria automatici via email o calendario per tutto il team.',
      },
    ],
  },
};

const calculatorComponents: Record<string, ComponentType | undefined> = {
  'calcolo-pilastro-ca-pressoflessione': RCColumnBiaxialCalculator,
  'verifica-trave-acciaio-slu': SteelBeamSLUCalculator,
  'verifica-sezione-ca-slu': RCSectionSLUCalculator,
  'combinazioni-carico-ntc-2018': LoadCombinationCalculator,
  'calcolo-portanza-fondazione-terzaghi': TerzaghiBearingCapacityCalculator,
  'verifica-muro-sostegno': RetainingWallCalculator,
  'calcolo-solaio-laterocemento': LaterocementoSlabCalculator,
  'verifica-trave-legno-slu': WoodBeamSLUCalculator,
  'calcolo-trave-appoggiata': SimplySupportedBeamCalculator,
  'calcolo-roi-return-on-investment': ROICalculator,
};

function normalizeCategoryParam(param: string | undefined): string {
  if (!param) return '';
  const lowerValue = param.toLowerCase();
  const knownCategories = Object.keys(categoryMetadata);
  return (
    knownCategories.find(
      (category) => category.toLowerCase() === lowerValue
    ) ?? lowerValue
  );
}

function normalizeSlugParam(param: string | undefined): string {
  if (!param) return '';
  const lowerValue = param.toLowerCase();
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
  const resolvedParams = await params;
  const normalizedCategory = normalizeCategoryParam(
    resolvedParams?.category
  );
  const slug = normalizeSlugParam(resolvedParams?.slug);
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

export default async function CalculatorPage({
  params,
}: CalculatorPageProps) {
  const resolvedParams = await params;
  const normalizedCategory = normalizeCategoryParam(
    resolvedParams?.category
  );
  const slug = normalizeSlugParam(resolvedParams?.slug);
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
          <section className="section-card space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {calculator.metaDescription}
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Funzionalità principali
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {calculator.keywords.slice(0, 6).map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            </div>
            <div className="border-l-4 border-blue-200 pl-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800">
                Esperto di riferimento: {calculator.author.name}
              </p>
              <p>{calculator.author.bio}</p>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
