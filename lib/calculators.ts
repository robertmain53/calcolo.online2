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
    slug: 'verifica-trave-ca',
    title: 'Calcolo Trave in Cemento Armato',
    description:
      'Dimensiona e verifica travi in cemento armato secondo NTC 2018 ed Eurocodici, con controllo di presso-tenso flessione e taglio.',
    metaDescription:
      'Calcolatore professionale per il dimensionamento delle travi in cemento armato. Verifiche secondo NTC 2018, combinazioni SLU/SLE e output pronti per la relazione strutturale.',
    category: 'ingegneria-strutturale',
    keywords: [
      'calcolo trave cemento armato',
      'ntc 2018',
      'verifica strutturale',
      'eurocodice 2',
      'pressoflessione',
      'taglio trave',
      'calcolo armature',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-01-10',
    dateModified: '2025-02-12',
    featured: true,
    schema: 'SoftwareApplication',
  },
  {
    slug: 'valutazione-rischio-cantiere',
    title: 'Valutazione Rischio Cantiere',
    description:
      'Genera la matrice di rischio cantieri con individuazione pericoli, misure preventive, livello di esposizione e priorità di intervento.',
    metaDescription:
      'Strumento per la valutazione dei rischi nei cantieri temporanei o mobili. Include pericoli standard, DPI consigliati, piani di monitoraggio e output per PSC/POS.',
    category: 'sicurezza-cantiere',
    keywords: [
      'valutazione rischio cantiere',
      'psc',
      'pos',
      'coordinatore sicurezza',
      'matrice rischio',
      'cantieri temporanei',
      'dpi',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-03-05',
    dateModified: '2025-01-20',
    featured: true,
    schema: 'WebApplication',
  },
  {
    slug: 'trasmittanza-termica-pareti',
    title: 'Calcolo Trasmittanza Termica Pareti',
    description:
      'Calcola la trasmittanza termica U di pareti opache stratificate con verifica requisiti minimi e confronto con limiti legislativi.',
    metaDescription:
      'Calcolatore termotecnico per il calcolo della trasmittanza delle pareti. Inserisci gli strati e ottieni U, massa superficiale e verifiche DM 26/06/2015.',
    category: 'acustica-termotecnica',
    keywords: [
      'trasmittanza termica',
      'calcolo U',
      'dm 26 giugno 2015',
      'legge 10',
      'prestazioni energetiche',
      'pareti opache',
      'termotecnica',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-04-22',
    dateModified: '2025-02-01',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-cavi-bt',
    title: 'Dimensionamento Cavi BT',
    description:
      'Dimensiona cavi elettrici in bassa tensione con verifica portata, caduta di tensione, protezioni magnetotermiche e coordinamento.',
    metaDescription:
      'Calcolatore per il dimensionamento dei cavi elettrici BT secondo CEI 64-8. Valuta sezione, caduta V, corrente ammissibile e protezioni automatiche.',
    category: 'elettrotecnica',
    keywords: [
      'dimensionamento cavi',
      'caduta di tensione',
      'cei 64-8',
      'impianti elettrici',
      'protezioni magnetotermiche',
      'corrente ammissibile',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-02-14',
    dateModified: '2025-03-08',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-rete-fognaria',
    title: 'Dimensionamento Rete Fognaria',
    description:
      'Esegue il dimensionamento di reti fognarie pluviali e miste con metodo razionale, verifica velocità e pendenze minime.',
    metaDescription:
      'Strumento per progettare condotte fognarie: calcola portate di progetto, diametri commerciali, velocità e riporta report sintetico per memoria tecnica.',
    category: 'ingegneria-idraulica',
    keywords: [
      'dimensionamento fognatura',
      'rete pluviale',
      'metodo razionale',
      'condotte acqua',
      'pendenza minima',
      'diametro fognario',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-05-18',
    dateModified: '2025-01-11',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-portanza-palo',
    title: 'Verifica Portanza Palo di Fondazione',
    description:
      'Calcola la portanza di pali trivellati e battuti con contributo laterale, punta e fattori di sicurezza secondo NTC 2018.',
    metaDescription:
      'Calcolatore geotecnico per la verifica della capacità portante dei pali di fondazione. Include stratigrafie, prove penetrometriche e calcolo cedimenti.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'portanza pali',
      'fondazioni profonde',
      'ntc 2018',
      'geotecnica',
      'cedimenti',
      'prove penetrometriche',
      'calcolo pali',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-06-09',
    dateModified: '2025-02-27',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'roi-calculator',
    title: 'Calcolatore ROI (Return on Investment)',
    description: 'Calcola il ritorno sull\'investimento (ROI) per valutare la redditività e l\'efficacia dei tuoi progetti aziendali. Strumento essenziale per analisi finanziarie e decisioni di investimento.',
    metaDescription: 'Calcolatore ROI gratuito per misurare il ritorno sugli investimenti. Calcola la redditività dei progetti aziendali con formule certificate e analisi dettagliate.',
    category: 'finanza-business',
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
  {
    slug: 'analisi-break-even',
    title: 'Analisi Break Even Point',
    description:
      'Calcola il punto di pareggio aziendale con identificazione dei costi fissi/variabili, margine di contribuzione e grafico BEP.',
    metaDescription:
      'Tool per la determinazione del break even point. Inserisci costi e ricavi unitari per valutare margine di sicurezza e volumi di pareggio.',
    category: 'finanza-business',
    keywords: [
      'break even point',
      'punto di pareggio',
      'margine di contribuzione',
      'analisi costi ricavi',
      'controllo di gestione',
      'business plan',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-07-02',
    dateModified: '2025-02-05',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'trasformazione-coordinate-gauss',
    title: 'Trasformazione Coordinate Gauss-Boaga',
    description:
      'Esegue la trasformazione di coordinate tra sistemi Gauss-Boaga, UTM e WGS84 con compensazione e verifica scarti.',
    metaDescription:
      'Calcolatore topografico per convertire coordinate Gauss-Boaga in UTM/WGS84. Include rototraslazioni 7 parametri e report degli errori.',
    category: 'topografia-matematica',
    keywords: [
      'trasformazione coordinate',
      'gauss boaga',
      'utm',
      'wgs84',
      'rototraslazione 7 parametri',
      'rilievi topografici',
      'compensazione',
    ],
    author: defaultAuthors.surveySpecialist,
    datePublished: '2024-08-19',
    dateModified: '2025-02-18',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'convertitore-unita-pressione',
    title: 'Convertitore Unità di Pressione',
    description:
      'Converte in tempo reale le principali unità di pressione (Pa, bar, psi, atm, mmHg) con precisione industriale.',
    metaDescription:
      'Convertitore tecnico di pressione con fattori aggiornati. Supporta Pascal, bar, psi, atmosfera tecnica, mmHg e kPa con cronologia conversioni.',
    category: 'convertitori-tecnici',
    keywords: [
      'convertitore pressione',
      'psi a bar',
      'unità di misura',
      'pascal',
      'kpa',
      'atmosfera',
      'conversione tecnica',
    ],
    author: defaultAuthors.conversionSpecialist,
    datePublished: '2024-09-07',
    dateModified: '2025-01-29',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'gestione-scadenze-cantiere',
    title: 'Gestione Scadenze Cantiere',
    description:
      'Organizza scadenze, permessi, verifiche periodiche e documenti di un cantiere con timeline e notifiche automatiche.',
    metaDescription:
      'Planner digitale per monitorare scadenze di cantieri e studi tecnici: permessi, collaudi, verifiche DPI e aggiornamenti documentali.',
    category: 'strumenti-quotidiani',
    keywords: [
      'scadenze cantiere',
      'gestione documenti',
      'permessi edilizi',
      'planner professionale',
      'promemoria tecnico',
      'controllo attività',
    ],
    author: defaultAuthors.operationsManager,
    datePublished: '2024-10-12',
    dateModified: '2025-03-01',
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
  const categories = new Set(
    calculators.map((calc) => calc.category.toLowerCase())
  );
  return Array.from(categories);
}

/**
 * Get all calculators for a specific category
 */
export function getCalculatorsByCategory(category: string): Calculator[] {
  const normalizedCategory = category.toLowerCase();
  return calculators.filter(
    (calc) => calc.category.toLowerCase() === normalizedCategory
  );
}

/**
 * Get a single calculator by slug
 */
export function getCalculatorBySlug(slug: string): Calculator | undefined {
  const normalizedSlug = slug.toLowerCase();
  return calculators.find(
    (calc) => calc.slug.toLowerCase() === normalizedSlug
  );
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
export const categoryMetadata: Record<
  string,
  {
    title: string;
    description: string;
    metaDescription: string;
    icon: string;
  }
> = {
  'ingegneria-strutturale': {
    title: 'Ingegneria Strutturale',
    description: 'Dimensionamento elementi, verifiche sismiche, normativa NTC 2018 ed Eurocodici. Calcolatori per travi, pilastri, fondazioni e analisi pushover.',
    metaDescription: 'Calcolatori strutturali per travi, pilastri e fondazioni. Verifiche NTC 2018, Eurocodici, combinazioni SLU/SLE e report pronti per il professionista.',
    icon: '🏗️',
  },
  'sicurezza-cantiere': {
    title: 'Sicurezza in Cantiere',
    description: 'Valutazioni rischio, piani di sicurezza, coordinamento, PSC, POS e check-list DPI per cantieri temporanei o mobili.',
    metaDescription: 'Strumenti digitali per la sicurezza nei cantieri: valutazione rischi, redazione PSC/POS, check-list DPI e monitoraggio adempimenti HSE.',
    icon: '🦺',
  },
  'acustica-termotecnica': {
    title: 'Acustica e Termotecnica',
    description: 'Analisi energetiche, trasmittanze, ponti termici, certificazioni acustiche e calcolo dei requisiti passivi.',
    metaDescription: 'Calcolatori per acustica e termotecnica: trasmittanze, ponti termici, requisiti acustici passivi e supporto alla Legge 10.',
    icon: '🌡️',
  },
  elettrotecnica: {
    title: 'Elettrotecnica e Impianti',
    description: 'Progettazione impianti elettrici BT/MT, cadute di tensione, selettività magnetotermica e dimensionamento quadri.',
    metaDescription: 'Strumenti elettrotecnici per il dimensionamento di cavi, quadri, selettività e verifiche CEI 64-8 / 0-16.',
    icon: '⚡',
  },
  'ingegneria-idraulica': {
    title: 'Ingegneria Idraulica',
    description: 'Moti nei condotti, dimensionamento reti idriche, verifiche fognature, deflussi pluviali e opere di bonifica.',
    metaDescription: 'Calcolatori idraulici per reti idriche e fognarie, deflussi pluviali, opere di bonifica e modellazione idraulica.',
    icon: '💧',
  },
  'ingegneria-geotecnica': {
    title: 'Ingegneria Geotecnica',
    description: 'Verifiche pali, platee, stabilità dei pendii, capacità portante, cedimenti e parametri geotecnici.',
    metaDescription: 'Strumenti geotecnici per fondazioni profonde, stabilità dei versanti, prove in sito e calcolo cedimenti.',
    icon: '⛏️',
  },
  'finanza-business': {
    title: 'Finanza e Business',
    description: 'KPI aziendali, analisi investimenti, business plan, valutazioni economiche, ROI e controllo di gestione.',
    metaDescription: 'Calcolatori finanziari per ROI, break even, business plan, KPI aziendali e controllo di gestione.',
    icon: '💰',
  },
  'topografia-matematica': {
    title: 'Topografia e Matematica',
    description: 'Rilievi strumentali, trasformazioni coordinate, compensazioni, geodesia, matematica applicata e statistica.',
    metaDescription: 'Strumenti topografici e matematici per trasformazioni di coordinate, compensazioni e analisi statistiche dei rilievi.',
    icon: '🧭',
  },
  'convertitori-tecnici': {
    title: 'Convertitori Tecnici',
    description: 'Conversioni unità di misura, grandezze fisiche e chimiche, scaling parametri e strumenti rapidi da cantiere.',
    metaDescription: 'Convertitori tecnici per unità di misura fisiche e chimiche, scaling parametri e controlli rapidi in cantiere.',
    icon: '🔁',
  },
  'strumenti-quotidiani': {
    title: 'Strumenti Quotidiani',
    description: 'Utility per professionisti: calcolatori percentuali, scadenziari, promemoria e gestione documentale.',
    metaDescription: 'Utility quotidiane per studi tecnici: calcolo percentuali, gestione scadenze, promemoria e organizzazione documentale.',
    icon: '🛠️',
  },
};
