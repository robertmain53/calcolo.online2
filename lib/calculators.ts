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
    slug: 'calcolo-trave-appoggiata',
    title: 'Calcolo Trave Appoggiata',
    description:
      'Calcola e traccia i diagrammi di momento flettente, taglio e freccia per travi appoggiate con diverse combinazioni di carico.',
    metaDescription:
      'Calcolatore per travi appoggiate su due appoggi: diagrammi di momento, taglio e deformazione secondo scienza delle costruzioni.',
    category: 'ingegneria-strutturale',
    keywords: [
      'trave appoggiata',
      'diagramma momento',
      'diagramma taglio',
      'freccia trave',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-costi-sicurezza-psc',
    title: 'Calcolo Costi della Sicurezza',
    description:
      'Stima i costi della sicurezza diretti e speciali non soggetti a ribasso da inserire nel Piano di Sicurezza e Coordinamento.',
    metaDescription:
      'Calcolatore per stimare i costi della sicurezza nel PSC: oneri non ribassabili, apprestamenti, DPI e misure collettive secondo D.Lgs. 81/08.',
    category: 'sicurezza-cantiere',
    keywords: [
      'costi sicurezza',
      'PSC',
      'oneri sicurezza',
      'D.Lgs. 81/08',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    featured: true,
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-indice-niosh-mmc',
    title: 'Calcolo Indice NIOSH (MMC)',
    description:
      'Calcola l’indice di sollevamento secondo il metodo NIOSH per valutare il rischio da movimentazione manuale dei carichi.',
    metaDescription:
      'Tool per il calcolo dell’indice NIOSH MMC: peso raccomandato, fattori di correzione e valutazione del rischio secondo ISO 11228-1.',
    category: 'sicurezza-cantiere',
    keywords: [
      'indice NIOSH',
      'movimentazione manuale carichi',
      'MMC',
      'ISO 11228-1',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-rischio-rumore-lex-8h',
    title: 'Calcolo Rischio Rumore (LEX, 8h)',
    description:
      'Calcola il livello di esposizione quotidiana al rumore e suggerisce le misure di prevenzione previste dal Titolo VIII del D.Lgs. 81/08.',
    metaDescription:
      'Calcolo del LEX,8h e Lpeak,C per la valutazione del rischio rumore nei cantieri con suggerimenti per DPI e misure di bonifica.',
    category: 'sicurezza-cantiere',
    keywords: [
      'rischio rumore',
      'LEX 8h',
      'Titolo VIII',
      'D.Lgs. 81/08 rumore',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-rischio-vibrazioni-hav-wbv',
    title: 'Calcolo Rischio Vibrazioni (A(8))',
    description:
      'Valuta l’esposizione giornaliera a vibrazioni mano-braccio (HAV) e corpo intero (WBV) confrontando i valori con i limiti di legge.',
    metaDescription:
      'Calcolatore per vibrazioni HAV e WBV: calcolo dell’A(8), confronto con valori d’azione e limite previsti dal D.Lgs. 81/08.',
    category: 'sicurezza-cantiere',
    keywords: [
      'vibrazioni HAV',
      'vibrazioni WBV',
      'A(8)',
      'rischio vibrazioni',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-ponteggi-checkist-pimus',
    title: 'Verifica Ponteggi (PiMUS)',
    description:
      'Checklist interattiva per controllare elementi strutturali, ancoraggi e accessori dei ponteggi prima dell’uso secondo PiMUS.',
    metaDescription:
      'Checklist ponteggi PiMUS: verifica montaggio, ancoraggi e dispositivi di sicurezza prima dell’utilizzo in cantiere.',
    category: 'sicurezza-cantiere',
    keywords: [
      'PiMUS',
      'verifica ponteggi',
      'checklist ponteggio',
      'sicurezza ponteggi',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-tirante-aria-anticaduta',
    title: "Calcolo Tirante d'Aria (Anticaduta)",
    description:
      'Determina il tirante d’aria minimo per sistemi anticaduta (cordini, assorbitori) per evitare impatto con il suolo.',
    metaDescription:
      "Calcolatore del tirante d’aria per dispositivi anticaduta: lunghezze, dissipatori e margini di sicurezza per lavori in quota.",
    category: 'sicurezza-cantiere',
    keywords: [
      'tirante aria',
      'anticaduta',
      'lavori in quota',
      'DPI anticaduta',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-illuminazione-cantiere',
    title: 'Calcolo Illuminazione di Cantiere',
    description:
      "Calcola il numero di proiettori necessari per garantire l'illuminazione minima delle aree di lavoro secondo UNI EN 12464-2.",
    metaDescription:
      "Calcolatore illuminotecnico per cantieri: lux richiesti, numero di proiettori e disposizione secondo UNI EN 12464-2.",
    category: 'sicurezza-cantiere',
    keywords: [
      'illuminazione cantiere',
      'UNI EN 12464-2',
      'lux cantiere',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-incidenza-manodopera-congruita',
    title: 'Calcolo Incidenza Manodopera',
    description:
      'Valuta l’incidenza percentuale della manodopera per verificare la congruità dei lavori edili secondo il D.M. 143/2021.',
    metaDescription:
      'Calcolo della congruità della manodopera per il DURC di congruità: percentuali minime e report di verifica.',
    category: 'sicurezza-cantiere',
    keywords: [
      'incidenza manodopera',
      'congruità',
      'DM 143/2021',
      'DURC congruità',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-rischio-ocra-movimenti-ripetitivi',
    title: 'Calcolo Rischio OCRA (Movimenti Ripetitivi)',
    description:
      "Calcola l’indice OCRA per valutare il rischio da movimenti ripetitivi degli arti superiori negli ambienti di lavoro.",
    metaDescription:
      "Tool OCRA checklist per movimenti ripetitivi: calcolo dell’indice, classificazione del rischio e suggerimenti di miglioramento.",
    category: 'sicurezza-cantiere',
    keywords: [
      'indice OCRA',
      'movimenti ripetitivi',
      'rischio arti superiori',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'checklist-allegato-xiii-81-08',
    title: 'Checklist Requisiti Cantiere (Allegato XIII)',
    description:
      'Checklist interattiva per verificare il rispetto dei requisiti minimi di salute e sicurezza nei cantieri secondo Allegato XIII.',
    metaDescription:
      'Checklist Allegato XIII D.Lgs. 81/08: controlli su impianti, servizi, sistemazioni e documentazione del cantiere.',
    category: 'sicurezza-cantiere',
    keywords: [
      'allegato XIII',
      'checklist cantiere',
      'requisiti sicurezza cantiere',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-15',
    dateModified: '2025-02-24',
    schema: 'WebApplication',
  },
  {
    slug: 'verifica-sezione-ca-slu',
    title: 'Verifica Sezione CA (SLU)',
    description:
      'Esegue la verifica a flessione e pressoflessione per sezioni rettangolari in cemento armato allo stato limite ultimo secondo NTC 2018.',
    metaDescription:
      'Verifica allo stato limite ultimo per sezioni in cemento armato rettangolari con calcolo dominio M-N e armature richieste.',
    category: 'ingegneria-strutturale',
    keywords: [
      'verifica sezione ca',
      'dominio M-N',
      'SLU NTC 2018',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-pilastro-ca-pressoflessione',
    title: 'Calcolo Pilastro CA (Pressoflessione)',
    description:
      'Calcola la resistenza dei pilastri in cemento armato soggetti a sforzo normale e momento flettente con verifica a pressoflessione deviata.',
    metaDescription:
      'Dimensionamento di pilastri in cemento armato con pressoflessione deviata e controllo dei domini di resistenza.',
    category: 'ingegneria-strutturale',
    keywords: [
      'calcolo pilastro ca',
      'pressoflessione deviata',
      'pilastro NTC 2018',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-trave-acciaio-slu',
    title: 'Verifica Trave in Acciaio (SLU)',
    description:
      'Verifica resistenza, taglio e stabilità di profili in acciaio laminati o saldati secondo NTC 2018 ed Eurocodice 3.',
    metaDescription:
      'Calcolatore per travi in acciaio con verifiche a flessione, taglio e instabilità flesso-torsionale (svergolamento).',
    category: 'ingegneria-strutturale',
    keywords: [
      'trave acciaio',
      'instabilità flesso torsionale',
      'verifica SLU acciaio',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'combinazioni-carico-ntc-2018',
    title: 'Calcolo Combinazioni di Carico (NTC 2018)',
    description:
      'Genera automaticamente combinazioni di carico SLU e SLE, sismiche e statiche, in accordo con il Capitolo 2.5 delle NTC 2018.',
    metaDescription:
      'Tool per combinazioni di carico NTC 2018 con coefficienti parziali e di combinazione per SLU, SLE e combinazioni sismiche.',
    category: 'ingegneria-strutturale',
    keywords: [
      'combinazioni carico',
      'NTC 2018',
      'SLU SLE',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-portanza-fondazione-terzaghi',
    title: 'Portanza Fondazione (Terzaghi)',
    description:
      'Stima la capacità portante di fondazioni superficiali utilizzando la formula di Terzaghi per terreni coerenti e incoerenti.',
    metaDescription:
      'Calcolo della capacità portante dei plinti con metodo di Terzaghi: fattori Nc, Nq, Nγ e coefficienti di forma.',
    category: 'ingegneria-strutturale',
    keywords: [
      'portanza fondazione',
      'terzaghi',
      'plinto superficiale',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-muro-sostegno',
    title: 'Verifica Stabilità Muro di Sostegno',
    description:
      'Esegue le verifiche di ribaltamento, scorrimento e capacità portante per muri di sostegno a gravità o a mensola.',
    metaDescription:
      'Verifica completa dei muri di sostegno con spinte di Rankine e Coulomb e controlli di stabilità globale.',
    category: 'ingegneria-strutturale',
    keywords: [
      'muro di sostegno',
      'spinta terreno',
      'verifica ribaltamento',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-solaio-laterocemento',
    title: 'Calcolo Solaio Laterocemento',
    description:
      'Predimensiona e verifica solai in laterocemento con travetti e pignatte, includendo calcolo di frecce e armature integrate.',
    metaDescription:
      'Calcolatore per solai in laterocemento: carichi lineari, momenti, frecce e verifica normativa.',
    category: 'ingegneria-strutturale',
    keywords: [
      'solaio laterocemento',
      'predimensionamento solaio',
      'verifica freccia',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-trave-legno-slu',
    title: 'Verifica Trave in Legno (SLU)',
    description:
      'Verifica la capacità a flessione, taglio e instabilità delle travi in legno massiccio o lamellare con classi C e GL.',
    metaDescription:
      'Verifica allo stato limite ultimo per travi in legno con controllo di instabilità flesso-torsionale.',
    category: 'ingegneria-strutturale',
    keywords: [
      'trave legno',
      'classe resistenza legno',
      'SLU legno',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-taglio-sismico-statica',
    title: 'Calcolo Taglio Sismico (Analisi Statica)',
    description:
      'Calcola la forza di taglio sismica alla base di edifici tramite analisi statica equivalente secondo NTC 2018.',
    metaDescription:
      'Tool per la determinazione del taglio sismico di base con spettro di progetto NTC 2018 e fattore di comportamento.',
    category: 'ingegneria-strutturale',
    keywords: [
      'taglio sismico',
      'analisi statica equivalente',
      'NTC 2018 sismica',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-10',
    dateModified: '2025-02-15',
    schema: 'SoftwareApplication',
  },
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
  {
    slug: 'guida-calcolo-roi',
    title: 'Guida Completa al Calcolo del ROI',
    description:
      'Approfondimento pratico sul Return on Investment: definizione, formule, esempi reali e consigli per interpretare il ROI nei progetti aziendali.',
    metaDescription:
      'Articolo guida sul calcolo del ROI. Spiega formula, esempi pratici e strategie per migliorare il ritorno sugli investimenti nelle PMI.',
    category: 'guide',
    keywords: [
      'guida ROI',
      'come calcolare ROI',
      'interpretare ROI',
      'return on investment guida',
      'esempi ROI',
      'strategia investimenti',
      'ottimizzare ROI',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-11-05',
    dateModified: '2025-02-15',
    featured: true,
    schema: 'WebApplication',
  },
  {
    slug: 'guida-ntc-2018-principi-fondamentali',
    title: 'Guida alle NTC 2018: Principi Fondamentali',
    description:
      'Sintesi dei principi base delle NTC 2018, stati limite e novità normative per la progettazione strutturale.',
    metaDescription:
      'Approfondimento sui principi fondamentali delle NTC 2018: SLU, SLE, affidabilità e novità per progettisti strutturali.',
    category: 'guide',
    keywords: [
      'NTC 2018',
      'principi NTC',
      'stati limite',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-momento-taglio-teoria',
    title: 'Come Calcolare Momento e Taglio (Teoria)',
    description:
      'Richiami teorici sui diagrammi di momento e taglio per travi notevoli e schemi di carico ricorrenti.',
    metaDescription:
      'Guida teorica ai diagrammi di momento flettente e taglio nelle travi: metodi di calcolo e esempi pratici.',
    category: 'guide',
    keywords: [
      'diagrammi momento',
      'diagrammi taglio',
      'scienza delle costruzioni',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'verifica-ca-dominio-m-n',
    title: 'Verifica Sezioni CA: Il Dominio M-N',
    description:
      'Analisi del dominio momento-sforzo normale per sezioni in cemento armato e applicazione pratica ai pilastri.',
    metaDescription:
      'Guida al dominio M-N per il cemento armato: costruzione, interpretazione e utilizzo nelle verifiche strutturali.',
    category: 'guide',
    keywords: [
      'dominio M-N',
      'cemento armato',
      'verifica pilastri',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'stabilita-travi-acciaio-svergolamento',
    title: 'Stabilità Travi Acciaio: Svergolamento',
    description:
      'Spiegazione dell’instabilità flesso-torsionale nelle travi in acciaio e dei criteri di verifica secondo EC3.',
    metaDescription:
      'Approfondimento sullo svergolamento delle travi in acciaio con riferimenti all’Eurocodice 3 e alle NTC 2018.',
    category: 'guide',
    keywords: [
      'svergolamento',
      'instabilità flesso torsionale',
      'travi acciaio',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'spiegazione-combinazioni-carico-ntc-2018',
    title: 'Capire le Combinazioni di Carico NTC 2018',
    description:
      'Guida ai coefficienti parziali e di combinazione delle azioni per SLU e SLE nelle NTC 2018.',
    metaDescription:
      'Come applicare i coefficienti gamma e psi nelle combinazioni di carico NTC 2018 per SLU e SLE.',
    category: 'guide',
    keywords: [
      'combinazioni carico',
      'coefficiente gamma',
      'psi NTC 2018',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'teoria-capacita-portante-terzaghi',
    title: 'La Teoria della Capacità Portante (Terzaghi)',
    description:
      'Dettaglia la formula di Terzaghi, i fattori Nc, Nq, Nγ e le ipotesi alla base della verifica delle fondazioni.',
    metaDescription:
      'Spiegazione completa della capacità portante secondo Terzaghi con significato dei fattori e applicazioni pratiche.',
    category: 'guide',
    keywords: [
      'capacità portante',
      'teoria Terzaghi',
      'fondazioni superficiali',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'verifica-muri-sostegno-spinta-terreno',
    title: 'Verifica Muri di Sostegno: Spinta Attiva e Passiva',
    description:
      'Descrive come calcolare la spinta del terreno e le condizioni di equilibrio per muri di sostegno.',
    metaDescription:
      'Spinta attiva e passiva del terreno per la verifica dei muri di sostegno con Rankine e Coulomb.',
    category: 'guide',
    keywords: [
      'spinta attiva',
      'spinta passiva',
      'muro di sostegno teoria',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'progettazione-solai-laterocemento-carichi',
    title: 'Progettazione Solai: Ripartizione Carichi',
    description:
      'Metodi per ripartire i carichi sui solai in laterocemento e dimensionare travetti e travi perimetrali.',
    metaDescription:
      'Guida alla ripartizione dei carichi nei solai in laterocemento con esempi di calcolo.',
    category: 'guide',
    keywords: [
      'progettazione solai',
      'ripartizione carichi',
      'laterocemento',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'classi-resistenza-legno-c24-gl24h',
    title: 'Classi di Resistenza del Legno (C24, GL24h)',
    description:
      'Panoramica sulle classi di resistenza del legno massiccio e lamellare con valori caratteristici di progetto.',
    metaDescription:
      'Classi C e GL del legno strutturale: valori caratteristici e indicazioni per il progetto.',
    category: 'guide',
    keywords: [
      'classi legno',
      'C24',
      'GL24h',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
    schema: 'WebApplication',
  },
  {
    slug: 'analisi-sismica-spettri-risposta-ntc-2018',
    title: 'Analisi Sismica: Spettri di Risposta',
    description:
      'Introduce la costruzione degli spettri elastici e di progetto NTC 2018 e il loro impiego nelle verifiche sismiche.',
    metaDescription:
      'Guida agli spettri di risposta NTC 2018: calcolo dei parametri ag, F0, TC* e applicazioni progettuali.',
    category: 'guide',
    keywords: [
      'spettri risposta',
      'analisi sismica',
      'NTC 2018 spettro',
    ],
    author: defaultAuthors.engineer,
    datePublished: '2024-11-12',
    dateModified: '2025-02-20',
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
  guide: {
    title: 'Guide e Approfondimenti',
    description: 'Articoli tecnici, tutorial passo-passo e best practice per utilizzare al meglio i calcolatori e applicarli a casi reali.',
    metaDescription: 'Guide pratiche e tutorial per calcolatori professionali: interpretare i risultati, evitare errori e integrare gli strumenti nei processi di studio.',
    icon: '📚',
  },
};
