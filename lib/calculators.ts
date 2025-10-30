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
    slug: 'calcolo-trasmittanza-termica-u-value',
    title: 'Calcolo Trasmittanza Termica (U-value)',
    description:
      'Calcola la trasmittanza termica di pareti e solai multistrato secondo la UNI EN ISO 6946 con resistenze e conduttività dei materiali.',
    metaDescription:
      'Tool per calcolare il valore U di pareti e coperture multistrato secondo UNI EN ISO 6946 con resistenze termiche e conducibilità λ.',
    category: 'acustica-termotecnica',
    keywords: [
      'trasmittanza termica',
      'u value',
      'uni en iso 6946',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-condensa-interstiziale-glaser',
    title: 'Verifica Condensa Interstiziale (Glaser)',
    description:
      'Esegue la verifica di condensa interstiziale e superficiale tramite il metodo di Glaser conforme alla UNI EN ISO 13788.',
    metaDescription:
      'Verifica condensa interstiziale con diagramma di Glaser secondo UNI EN ISO 13788 per prevenire muffe e degradi.',
    category: 'acustica-termotecnica',
    keywords: [
      'condensa interstiziale',
      'metodo glaser',
      'uni en iso 13788',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-spessore-isolante',
    title: 'Calcolo Spessore Isolante Ottimale',
    description:
      'Determina lo spessore di materiale isolante necessario per raggiungere un valore target di trasmittanza o resistenza termica.',
    metaDescription:
      'Calcolo dello spessore isolante ottimale per rispettare valori U target con materiali a diversa conducibilità λ.',
    category: 'acustica-termotecnica',
    keywords: [
      'spessore isolante',
      'trasmittanza target',
      'resistenza termica',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-potere-fonoisolante-rw',
    title: 'Calcolo Potere Fonoisolante (Rw)',
    description:
      'Stima il potere fonoisolante apparente di elementi di separazione basandosi sulla legge della massa e sulla UNI EN 12354-1.',
    metaDescription:
      'Calcolatore del potere fonoisolante Rw di pareti e solai secondo UNI EN 12354-1 con legge della massa e correzioni.',
    category: 'acustica-termotecnica',
    keywords: [
      'potere fonoisolante',
      'Rw',
      'UNI EN 12354-1',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-tempo-riverberazione-t60-sabine',
    title: 'Calcolo Tempo di Riverberazione (T60)',
    description:
      'Calcola il tempo di riverberazione di un ambiente con la formula di Sabine includendo superfici e assorbimenti dei materiali.',
    metaDescription:
      'Calcolo del T60 con formula di Sabine: inserisci volumi e superfici assorbenti per valutare il comfort acustico.',
    category: 'acustica-termotecnica',
    keywords: [
      'tempo di riverberazione',
      'T60',
      'formula di Sabine',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-isolamento-calpestio-lnw',
    title: "Calcolo Isolamento Calpestio (L'nw)",
    description:
      "Stima il livello di rumore da calpestio normalizzato di un solaio e lo confronta con i limiti del DPCM 5/12/97.",
    metaDescription:
      "Calcolatore per il rumore da calpestio L'nw con valutazione dei limiti normativi del DPCM 5/12/97.",
    category: 'acustica-termotecnica',
    keywords: [
      "rumore da calpestio",
      "L'nw",
      'DPCM 5/12/97',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-ponte-termico-lineare-psi',
    title: 'Calcolo Ponte Termico (Lineare)',
    description:
      'Calcola il coefficiente lineare di dispersione Ψ per i principali nodi costruttivi secondo UNI EN ISO 10211.',
    metaDescription:
      'Determinazione del ponte termico lineare Ψ per nodi parete-solaio e parete-pilastro in conformità alla UNI EN ISO 10211.',
    category: 'acustica-termotecnica',
    keywords: [
      'ponte termico',
      'coefficiente psi',
      'UNI EN ISO 10211',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-dispersioni-termiche-stanza',
    title: 'Calcolo Dispersioni Termiche (Stanza)',
    description:
      'Stima il fabbisogno termico per trasmissione e ventilazione di una stanza per il dimensionamento dei corpi scaldanti.',
    metaDescription:
      'Calcolo delle dispersioni termiche di ambiente singolo secondo UNI EN 12831 per il dimensionamento degli impianti.',
    category: 'acustica-termotecnica',
    keywords: [
      'dispersioni termiche',
      'UNI EN 12831',
      'fabbisogno termico stanza',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-radiatori-delta-t',
    title: 'Dimensionamento Radiatori (ΔT)',
    description:
      'Calcola la potenza richiesta dei radiatori in funzione del ΔT di progetto e del fabbisogno termico dell’ambiente.',
    metaDescription:
      'Tool per dimensionare radiatori: potenza in funzione del ΔT (30, 50) e del fabbisogno termico della stanza.',
    category: 'acustica-termotecnica',
    keywords: [
      'dimensionamento radiatori',
      'delta T',
      'potenza termosifoni',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-requisiti-acustici-dpcm-97',
    title: 'Verifica Requisiti Acustici (DPCM 5/12/97)',
    description:
      "Controlla la conformità dei requisiti acustici passivi (Rw, L'nw, D2m,nT,w) ai limiti del DPCM 5/12/97 inserendo i valori misurati.",
    metaDescription:
      "Verifica dei requisiti acustici passivi secondo DPCM 5/12/97: isolamento facciata, pareti e rumore da calpestio.",
    category: 'acustica-termotecnica',
    keywords: [
      'requisiti acustici passivi',
      'DPCM 5/12/97',
      'verifica acustica',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-22',
    dateModified: '2025-02-28',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-sezione-cavo-portata',
    title: 'Calcolo Sezione Cavo (Portata Iz)',
    description:
      'Determina la sezione minima del cavo in rame o alluminio in funzione della corrente, del tipo di posa e del materiale secondo CEI 64-8.',
    metaDescription:
      'Calcolatore sezione cavi CEI 64-8: portata Iz, tipologie di posa e materiali conduttori per impianti civili e industriali.',
    category: 'elettrotecnica',
    keywords: [
      'sezione cavo',
      'CEI 64-8',
      'portata Iz',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-caduta-tensione-linea',
    title: 'Calcolo Caduta di Tensione (%)',
    description:
      'Calcola la caduta di tensione percentuale su linee monofase e trifase per garantire il rispetto dei limiti previsti dalla CEI 64-8.',
    metaDescription:
      'Calcolo caduta di tensione per linee monofase e trifase con verifica del limite 4 percento secondo CEI 64-8.',
    category: 'elettrotecnica',
    keywords: [
      'caduta di tensione',
      'linea elettrica',
      'CEI 64-8',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-interruttore-magnetotermico',
    title: 'Dimensionamento Interruttore Magnetotermico',
    description:
      'Calcola la taglia dell’interruttore magnetotermico coordinandola con la corrente di impiego e la portata del cavo secondo CEI 64-8.',
    metaDescription:
      'Dimensionamento degli interruttori automatici: verifica Ib ≤ In ≤ Iz e I2 ≤ 1,45·Iz come richiesto dalla CEI 64-8.',
    category: 'elettrotecnica',
    keywords: [
      'interruttore magnetotermico',
      'coordinamento cavo interruttore',
      'protezione sovraccarico',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-corrente-corto-circuito-icc',
    title: 'Calcolo Corrente di Corto Circuito (Icc)',
    description:
      'Stima la corrente di corto circuito presunta in un punto dell’impianto per la scelta del potere di interruzione dei dispositivi di protezione.',
    metaDescription:
      'Calcolo della corrente di corto circuito Icc per selezionare interruttori con potere di interruzione adeguato.',
    category: 'elettrotecnica',
    keywords: [
      'corrente di corto circuito',
      'Icc',
      'potere di interruzione',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-rifasamento-cos-phi',
    title: 'Calcolo Rifasamento (cos phi)',
    description:
      'Calcola la potenza reattiva richiesta per rifasare un impianto elettrico dal cos phi iniziale a quello desiderato.',
    metaDescription:
      'Calcolo della batteria di condensatori per rifasamento: determina i kVAR necessari per raggiungere il cos phi target.',
    category: 'elettrotecnica',
    keywords: [
      'rifasamento',
      'cos phi',
      'potenza reattiva',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolatore-legge-ohm-potenza',
    title: 'Legge di Ohm e Potenze (P, Q, S)',
    description:
      'Calcola tensione, corrente, resistenza e potenze attiva, reattiva e apparente in circuiti in corrente continua, monofase e trifase.',
    metaDescription:
      'Calcolatrice per la legge di Ohm e per le potenze elettriche in sistemi DC, AC monofase e trifase.',
    category: 'elettrotecnica',
    keywords: [
      'legge di ohm',
      'potenza elettrica',
      'trifase',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-tubi-portacavi',
    title: 'Calcolo Dimensionamento Tubi Portacavi',
    description:
      'Determina il diametro minimo di tubi e canaline in base al numero di conduttori e al grado di riempimento consentito dalla CEI 64-8.',
    metaDescription:
      'Dimensionamento dei tubi portacavi: calcolo del riempimento massimo e scelta del diametro minimo secondo CEI 64-8.',
    category: 'elettrotecnica',
    keywords: [
      'tubi portacavi',
      'posa cavi',
      'grado di riempimento',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-resistenza-impianto-terra',
    title: 'Calcolo Resistenza Impianto di Terra (Rt)',
    description:
      'Stima la resistenza di terra di un impianto in funzione del tipo di dispersore e della resistività del terreno per la protezione dai contatti indiretti.',
    metaDescription:
      'Calcolo della resistenza di terra Rt per impianti TT e TN con differenti configurazioni di dispersori.',
    category: 'elettrotecnica',
    keywords: [
      'resistenza di terra',
      'impianto di terra',
      'dispersori',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-illuminotecnico-numero-lampade',
    title: 'Calcolo Illuminotecnico (Lux)',
    description:
      'Calcola il numero di apparecchi illuminanti necessari per raggiungere il livello di illuminamento richiesto tramite il metodo del flusso totale.',
    metaDescription:
      'Calcolo illuminotecnico con metodo del flusso totale: numero di lampade e lux richiesti secondo UNI EN 12464-1.',
    category: 'elettrotecnica',
    keywords: [
      'calcolo lux',
      'illuminazione lavoro',
      'UNI EN 12464-1',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-corrente-spunto-motore',
    title: 'Calcolo Corrente di Spunto (Motori)',
    description:
      'Calcola la corrente di spunto di motori asincroni trifase per selezionare correttamente le protezioni e gli avviatori.',
    metaDescription:
      'Calcolo della corrente di spunto dei motori asincroni per la scelta di protezioni curva D e dispositivi di avviamento.',
    category: 'elettrotecnica',
    keywords: [
      'corrente di spunto',
      'motore asincrono',
      'protezione motore',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-11-28',
    dateModified: '2025-03-04',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-portata-velocita-diametro',
    title: 'Calcolo Portata-Velocità-Diametro',
    description:
      'Calcola portata, velocità o diametro di una condotta pressurizzata a partire dagli altri due parametri tramite l’equazione di continuità.',
    metaDescription:
      'Calcolatore per portata, velocità e diametro nelle condotte con l’equazione di continuità Q = V·A.',
    category: 'ingegneria-idraulica',
    keywords: [
      'portata condotta',
      'velocità fluido',
      'equazione di continuità',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-perdite-carico-darcy-weisbach',
    title: 'Calcolo Perdite di Carico (Darcy-Weisbach)',
    description:
      'Stima le perdite di carico distribuite e localizzate di una tubazione utilizzando la formula di Darcy-Weisbach.',
    metaDescription:
      'Calcolo delle perdite di carico in tubazioni con fattore d’attrito Darcy-Weisbach e coefficienti localizzati.',
    category: 'ingegneria-idraulica',
    keywords: [
      'perdite di carico',
      'Darcy-Weisbach',
      'tubazioni',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-rete-idrosanitaria-uni-9182',
    title: 'Dimensionamento Rete Idrosanitaria (UNI 9182)',
    description:
      'Determina il diametro delle tubazioni di adduzione acqua calda e fredda in base alle unità di carico previste dalla UNI 9182.',
    metaDescription:
      'Calcolo diametri rete idrica secondo UNI 9182 con unità di carico e velocità consentite.',
    category: 'ingegneria-idraulica',
    keywords: [
      'UNI 9182',
      'rete idrosanitaria',
      'diametro tubazioni acqua',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-rete-scarico-uni-12056',
    title: 'Dimensionamento Rete di Scarico (UNI EN 12056)',
    description:
      'Calcola i diametri delle reti di scarico per acque nere e grigie basandosi sulle unità di scarico e sulle pendenze minime.',
    metaDescription:
      'Dimensionamento delle reti di scarico secondo UNI EN 12056 con unità di scarico e pendenze minime.',
    category: 'ingegneria-idraulica',
    keywords: [
      'rete scarico',
      'UNI EN 12056',
      'unità di scarico',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-prevalenza-pompa-autoclave',
    title: 'Calcolo Prevalenza Pompa (Autoclave)',
    description:
      'Calcola la prevalenza totale richiesta da una pompa sommando dislivello geodetico, perdite di carico e pressione richiesta al punto di consegna.',
    metaDescription:
      'Calcolatore della prevalenza totale per pompe e autoclavi: dislivello, perdite lineari e pressione di esercizio.',
    category: 'ingegneria-idraulica',
    keywords: [
      'prevalenza pompa',
      'autoclave',
      'curve pompa',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'dimensionamento-pluviali-grondaie',
    title: 'Dimensionamento Pluviali e Grondaie',
    description:
      'Determina diametri di pluviali e sezioni di gronda in funzione della superficie tributaria e dell’intensità di pioggia secondo UNI EN 12056-3.',
    metaDescription:
      'Calcolo pluviali e gronde: superficie di raccolta e piovosità di progetto secondo UNI EN 12056-3.',
    category: 'ingegneria-idraulica',
    keywords: [
      'pluviali',
      'grondaie',
      'UNI EN 12056-3',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-numero-reynolds-re',
    title: 'Calcolo Numero di Reynolds (Re)',
    description:
      'Calcola il numero di Reynolds per valutare il regime di moto in condotte e selezionare i coefficienti di attrito corretti.',
    metaDescription:
      'Numero di Reynolds per condotte: determina il regime laminare o turbolento del flusso idraulico.',
    category: 'ingegneria-idraulica',
    keywords: [
      'numero di Reynolds',
      'regime laminare',
      'regime turbolento',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-vaso-espansione-riscaldamento',
    title: "Calcolo Vaso d'Espansione (Riscaldamento)",
    description:
      'Calcola il volume minimo del vaso di espansione in un impianto di riscaldamento a circuito chiuso in funzione del volume acqua e temperatura.',
    metaDescription:
      "Calcolo del vaso d'espansione per impianti di riscaldamento: variazione di volume e pressioni di esercizio.",
    category: 'ingegneria-idraulica',
    keywords: [
      "vaso d'espansione",
      'impianto riscaldamento',
      'circuito chiuso',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-portata-canale-manning',
    title: 'Calcolo Portata Canale (Formula Manning)',
    description:
      'Calcola la portata in un canale a pelo libero utilizzando la formula di Manning-Strickler e il coefficiente di scabrezza.',
    metaDescription:
      'Calcolo portata canali a pelo libero con formula di Manning e coefficienti di scabrezza.',
    category: 'ingegneria-idraulica',
    keywords: [
      'formula Manning',
      'canali a pelo libero',
      'scabrezza',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-tempo-svuotamento-serbatoio',
    title: 'Calcolo Tempo Svuotamento Serbatoio',
    description:
      'Calcola i tempi di svuotamento di serbatoi attraverso orifizi o bocchelli utilizzando il teorema di Torricelli.',
    metaDescription:
      'Calcolo dei tempi di svuotamento di serbatoi con teorema di Torricelli e coefficienti di scarico.',
    category: 'ingegneria-idraulica',
    keywords: [
      'svuotamento serbatoio',
      'Torricelli',
      'idraulica serbatoi',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-05',
    dateModified: '2025-03-10',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-regime-forfettario-netto',
    title: 'Calcolo Regime Forfettario',
    description:
      'Calcola reddito imponibile, imposta sostitutiva e contributi previdenziali per il regime forfettario a partire dal fatturato.',
    metaDescription:
      'Strumento per il calcolo del regime forfettario: imposte sostitutive e contributi INPS/Inarcassa dal fatturato annuo.',
    category: 'finanza-business',
    keywords: [
      'regime forfettario',
      'imposta sostitutiva',
      'contributi INPS',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-contributi-inarcassa',
    title: 'Calcolo Contributi Inarcassa',
    description:
      'Calcola contributi minimi e a conguaglio per Inarcassa in base al volume d’affari e all’anno di iscrizione.',
    metaDescription:
      'Calcolatore contributi Inarcassa: contributo soggettivo, integrativo e di maternità per ingegneri e architetti.',
    category: 'finanza-business',
    keywords: [
      'Inarcassa',
      'contributi minimi',
      'volume d’affari',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-tariffa-oraria-professionista',
    title: 'Calcolo Tariffa Oraria Professionista',
    description:
      'Determina la tariffa oraria minima per coprire costi fissi, variabili, imposte e margine di utile desiderato.',
    metaDescription:
      'Calcolatore tariffa oraria per professionisti: analizza costi fissi, variabili, ore fatturabili e utile atteso.',
    category: 'finanza-business',
    keywords: [
      'tariffa oraria',
      'costi fissi',
      'studio tecnico',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-rata-mutuo-ammortamento-francese',
    title: 'Calcolo Rata Mutuo (Ammortamento Francese)',
    description:
      'Calcola l’importo della rata costante di un mutuo a tasso fisso con piano di ammortamento alla francese.',
    metaDescription:
      'Calcolatore rata mutuo con ammortamento francese: quota capitale e interessi per finanziamenti a tasso fisso.',
    category: 'finanza-business',
    keywords: [
      'rata mutuo',
      'ammortamento francese',
      'quota capitale',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-van-tir-npv-irr',
    title: 'Calcolo VAN e TIR (NPV/IRR)',
    description:
      'Calcola il Valore Attuale Netto e il Tasso Interno di Rendimento per valutare investimenti e progetti immobiliari.',
    metaDescription:
      'Calcolatore VAN e TIR per analisi finanziarie: valuta profittabilità di investimenti con flussi di cassa previsti.',
    category: 'finanza-business',
    keywords: [
      'VAN',
      'TIR',
      'investimenti immobiliari',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-corrispettivo-decreto-parametri-dm-2016',
    title: 'Calcolo Corrispettivo (Decreto Parametri)',
    description:
      'Stima il compenso professionale secondo il DM 17/06/2016 partendo dai parametri V, G, Q e P.',
    metaDescription:
      'Calcolo corrispettivo professionale Decreto Parametri DM 17/06/2016 per lavori pubblici e privati.',
    category: 'finanza-business',
    keywords: [
      'decreto parametri',
      'DM 2016',
      'corrispettivo professionale',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-scorporo-iva-reverse-charge',
    title: 'Scorporo e Calcolo IVA (Reverse Charge)',
    description:
      'Calcola imponibile, IVA e totale documento e gestisce il meccanismo dell’inversione contabile per edilizia e subappalti.',
    metaDescription:
      'Calcolatore IVA con scorporo e reverse charge per operazioni ordinarie e in edilizia.',
    category: 'finanza-business',
    keywords: [
      'scorporo IVA',
      'reverse charge',
      'fatturazione edilizia',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-interesse-composto',
    title: 'Calcolo Interesse Composto',
    description:
      'Calcola montante futuro e valore attuale di un capitale utilizzando la formula dell’interesse composto.',
    metaDescription:
      'Calcolatore di interesse composto per investimenti: montante futuro, valore attuale e capitalizzazione periodica.',
    category: 'finanza-business',
    keywords: [
      'interesse composto',
      'montante',
      'valore attuale',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-15',
    dateModified: '2025-03-20',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-portanza-ntc-2018',
    title: 'Calcolo Portanza Fondazioni (NTC 2018)',
    description:
      'Calcola la capacità portante di fondazioni superficiali secondo l’Approccio 2 delle NTC 2018 con combinazione A1+M1+R1.',
    metaDescription:
      'Calcolatore portanza fondazioni superficiali NTC 2018 con Approccio 2 e combinazioni A1 M1 R1.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'NTC 2018 geotecnica',
      'portanza fondazioni',
      'approccio 2',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-cedimenti-edometrici',
    title: 'Calcolo Cedimenti Edometrici (Terreni Coesivi)',
    description:
      'Stima i cedimenti immediati e di consolidazione degli strati di argilla tramite indici di compressibilità e curve e-logσ’.',
    metaDescription:
      'Calcolo dei cedimenti edometrici in terreni coesivi con indici di compressibilità e teoria della consolidazione.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'cedimenti',
      'consolidazione',
      'indice di compressibilità',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-spinta-terreni-rankine-coulomb',
    title: 'Calcolo Spinta Terreni (Rankine & Coulomb)',
    description:
      'Calcola i coefficienti di spinta attiva e passiva e la spinta risultante su muri di sostegno con terreno inclinato o attrito muro-terreno.',
    metaDescription:
      'Calcolo della spinta dei terreni con teorie di Rankine e Coulomb per muri di sostegno.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'spinta terreno',
      'Rankine',
      'Coulomb',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-stabilita-pendio-fellenius',
    title: 'Verifica Stabilità Pendio (Metodo Fellenius)',
    description:
      'Esegue la verifica di stabilità di pendii con il metodo delle strisce di Fellenius calcolando il fattore di sicurezza.',
    metaDescription:
      'Calcolatore della stabilità dei pendii con metodo Fellenius e determinazione del fattore di sicurezza.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'stabilità pendio',
      'metodo Fellenius',
      'fattore di sicurezza',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'verifica-rischio-liquefazione-ntc-2018',
    title: 'Verifica Liquefazione Terreni (NTC 2018)',
    description:
      'Valuta il rischio di liquefazione in terreni sabbiosi in zona sismica utilizzando prove SPT o CPT e il metodo Seed & Idriss.',
    metaDescription:
      'Verifica del rischio di liquefazione secondo NTC 2018 con prove SPT e CPT e metodo semplificato Seed Idriss.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'liquefazione terreni',
      'Seed Idriss',
      'NTC 2018',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'classificazione-terreni-uscs-agi',
    title: 'Classificazione Geotecnica Terreni (USCS/AGI)',
    description:
      'Classifica campioni di terreno utilizzando curva granulometrica e limiti di Atterberg secondo sistemi USCS e AGI.',
    metaDescription:
      'Classificazione geotecnica dei terreni con sistemi USCS e AGI basata su analisi granulometrica e limiti di Atterberg.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'classificazione terreni',
      'USCS',
      'limiti Atterberg',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-portanza-palo-singolo',
    title: 'Calcolo Portanza Palo Singolo (NTC 2018)',
    description:
      'Stima la portanza di un palo trivellato o infisso calcolando i contributi di punta e laterale secondo NTC 2018.',
    metaDescription:
      'Calcolo portanza pali singoli con resistenze laterali e di punta conformi alle NTC 2018.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'portanza palo',
      'NTC 2018 pali',
      'resistenza laterale',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'correlazioni-prove-cpt-spt',
    title: 'Correlazioni Prove CPT/SPT (NTC 2018)',
    description:
      'Stima parametri geotecnici derivati da prove CPT e SPT tramite correlazioni riconosciute dalle NTC 2018.',
    metaDescription:
      'Calcolo parametri geotecnici da prove CPT e SPT attraverso correlazioni da normativa NTC 2018.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'prove CPT',
      'prove SPT',
      'correlazioni geotecniche',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'predimensionamento-paratie-diaframmi',
    title: 'Predimensionamento Paratie (Diaframmi)',
    description:
      'Esegue un predimensionamento di paratie o diaframmi a sbalzo calcolando l’altezza di infissione minima e le spinte da contrastare.',
    metaDescription:
      'Calcolatore per il predimensionamento di paratie a sbalzo con stima dell’altezza di infissione e delle spinte del terreno.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'paratie',
      'diaframmi',
      'spinta attiva',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
  },
  {
    slug: 'calcolo-indici-geotecnici-base',
    title: 'Calcolatore Indici Geotecnici di Base',
    description:
      'Calcola indice dei vuoti, porosità, grado di saturazione e pesi specifici del terreno a partire dai dati di laboratorio.',
    metaDescription:
      'Calcolatore indici geotecnici fondamentali: indice dei vuoti, porosità, saturazione e pesi specifici.',
    category: 'ingegneria-geotecnica',
    keywords: [
      'indice dei vuoti',
      'porosità',
      'pesi specifici terreno',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-09',
    dateModified: '2025-03-15',
    schema: 'SoftwareApplication',
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
    slug: 'calcolo-roi-return-on-investment',
    title: 'Calcolo ROI (Return on Investment)',
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
    slug: 'calcolo-break-even-point-studio-tecnico',
    title: 'Calcolo Break Even Point (Studio Tecnico)',
    description:
      'Calcola il punto di pareggio per studi tecnici con analisi dei costi fissi, variabili, margine di contribuzione e grafico BEP.',
    metaDescription:
      'Calcolatore break-even per studi professionali: determina fatturato minimo, quantità critica e margine di sicurezza.',
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
    dateModified: '2025-03-20',
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
  {
    slug: 'guida-dlgs-81-08-testo-unico-sicurezza',
    title: 'Guida al D.Lgs. 81/08: Il Testo Unico Sicurezza',
    description:
      'Struttura del Testo Unico, principi di prevenzione e obblighi della valutazione dei rischi per aziende e cantieri.',
    metaDescription:
      'Introduzione al D.Lgs. 81/08: struttura, ruoli e adempimenti per la sicurezza nei cantieri e nei luoghi di lavoro.',
    category: 'guide',
    keywords: [
      'd.lgs. 81/08',
      'testo unico sicurezza',
      'valutazione rischi',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'figure-sicurezza-csp-cse-rspp',
    title: 'Le Figure della Sicurezza: CSP, CSE e RSPP',
    description:
      'Ruoli, responsabilità e obblighi delle figure chiave della sicurezza nei cantieri e nelle aziende.',
    metaDescription:
      'Approfondimento sui ruoli CSP, CSE, RSPP e datore di lavoro: compiti e obblighi secondo D.Lgs. 81/08.',
    category: 'guide',
    keywords: [
      'CSP',
      'CSE',
      'RSPP',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'differenza-psc-pos-pimus',
    title: 'PSC, POS e PiMUS: Differenze e Obblighi',
    description:
      'Spiega cosa sono PSC, POS e PiMUS, chi li redige e quando sono obbligatori nei cantieri.',
    metaDescription:
      'Guida pratica alle differenze tra PSC, POS e PiMUS e agli obblighi normativi per imprese e coordinatori.',
    category: 'guide',
    keywords: [
      'PSC',
      'POS',
      'PiMUS',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'come-calcolare-costi-sicurezza',
    title: 'Come Calcolare i Costi della Sicurezza (Guida)',
    description:
      'Metodologia per stimare costi diretti e speciali della sicurezza con esempi di apprestamenti e DPI.',
    metaDescription:
      'Procedura per calcolare gli oneri della sicurezza da inserire in PSC e offerte: esempi di apprestamenti e DPI.',
    category: 'guide',
    keywords: [
      'costi sicurezza',
      'apprestamenti',
      'PSC costi',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-metodo-niosh-mmc',
    title: 'Valutazione Rischio MMC: Il Metodo NIOSH',
    description:
      'Spiegazione passo-passo del metodo NIOSH per la movimentazione manuale dei carichi con fattori di correzione.',
    metaDescription:
      'Guida applicativa del metodo NIOSH per la valutazione MMC: costanti, fattori di correzione e interpretazione dell’indice.',
    category: 'guide',
    keywords: [
      'metodo NIOSH',
      'MMC',
      'movimentazione carichi',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'rischio-rumore-valori-limite-misure',
    title: 'Rischio Rumore: da LEX, 8h alle Misure',
    description:
      'Come interpretare i valori limite di esposizione al rumore e scegliere le misure preventive e protettive adeguate.',
    metaDescription:
      'Valutazione rischio rumore: interpretazione di LEX,8h e Lpeak con focus su DPI, formazione e interventi tecnici.',
    category: 'guide',
    keywords: [
      'lex 8h',
      'rischio rumore',
      'misure prevenzione',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'rischio-vibrazioni-spiegazione-hav-wbv',
    title: 'Rischio Vibrazioni (HAV/WBV): Spiegazione',
    description:
      'Descrive valori d’azione e limite per vibrazioni mano-braccio e corpo intero con obblighi per il datore di lavoro.',
    metaDescription:
      'Guida alle vibrazioni HAV e WBV: valori limite A(8), valutazione e misure preventive secondo D.Lgs. 81/08.',
    category: 'guide',
    keywords: [
      'rischio vibrazioni',
      'HAV',
      'WBV',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'lavori-quota-obblighi-dpi-anticaduta',
    title: 'Lavori in Quota: Obblighi e DPI Anticaduta',
    description:
      'Panoramica sugli obblighi per i lavori in quota, differenza tra protezioni collettive e DPI e scelta dei sistemi anticaduta.',
    metaDescription:
      'Guida ai lavori in quota: obblighi, DPI anticaduta e sistemi di protezione collettiva secondo D.Lgs. 81/08.',
    category: 'guide',
    keywords: [
      'lavori in quota',
      'DPI anticaduta',
      'protezione collettiva',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'cos-e-pimus-ponteggi',
    title: 'Il PiMUS: Cos’è e Chi lo Redige',
    description:
      'Contenuti minimi, responsabilità e procedure per il Piano di Montaggio, Uso e Smontaggio dei ponteggi.',
    metaDescription:
      'Guida al PiMUS: contenuti obbligatori, ruolo del datore di lavoro e procedure per ponteggi sicuri.',
    category: 'guide',
    keywords: [
      'PiMUS',
      'ponteggi',
      'piano montaggio',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-congruita-manodopera-dm-143-2021',
    title: 'Congruità Manodopera: Come Funziona',
    description:
      'Spiega il funzionamento del DURC di congruità, calcolo dell’incidenza e gestione di eventuali scostamenti.',
    metaDescription:
      'Guida al D.M. 143/2021: calcolo della congruità della manodopera, soglie minime e gestione delle non conformità.',
    category: 'guide',
    keywords: [
      'congruità manodopera',
      'DM 143/2021',
      'DURC congruità',
    ],
    author: defaultAuthors.safetyCoordinator,
    datePublished: '2024-11-18',
    dateModified: '2025-02-26',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-uni-en-iso-6946-trasmittanza-termica',
    title: 'Guida alla UNI EN ISO 6946: Calcolare la U',
    description:
      'Spiega trasmittanza, resistenza termica e conducibilità dei materiali con esempi applicativi per pareti multistrato.',
    metaDescription:
      'Approfondimento sulla UNI EN ISO 6946: calcolo di U, resistenze termiche e parametri necessari per pareti e coperture.',
    category: 'guide',
    keywords: [
      'UNI EN ISO 6946',
      'trasmittanza termica',
      'resistenza termica',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'prevenire-muffa-condensa-metodo-glaser',
    title: 'Prevenire Muffa e Condensa: Il Metodo Glaser',
    description:
      'Guida alla lettura del diagramma di Glaser per prevedere condense interstiziali e superficiali e definire corretti pacchetti stratigrafici.',
    metaDescription:
      'Metodo Glaser spiegato: diagramma termoigrometrico, controllo della condensa e strategie per evitare muffe.',
    category: 'guide',
    keywords: [
      'metodo glaser',
      'condensa interstiziale',
      'muffa pareti',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-dpcm-5-12-97-requisiti-acustici',
    title: 'Il DPCM 5/12/97: Guida ai Requisiti Acustici',
    description:
      'Analizza i limiti del DPCM 5/12/97 per isolamento aereo, rumore da calpestio e impianti, con riferimenti normativi e sanzioni.',
    metaDescription:
      'Guida al DPCM 5/12/97 sui requisiti acustici passivi degli edifici: limiti, verifiche e responsabilità.',
    category: 'guide',
    keywords: [
      'DPCM 5/12/97',
      'requisiti acustici',
      'isolamento acustico',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'differenza-rumore-aereo-rw-calpestio-lnw',
    title: "Isolamento Acustico: Rw vs L'nw",
    description:
      "Confronta isolamento dal rumore aereo e dal rumore da calpestio spiegando le differenze tra gli indici Rw e L'nw.",
    metaDescription:
      "Differenza tra Rw e L'nw: isolamento dal rumore aereo e da calpestio spiegati con esempi pratici.",
    category: 'guide',
    keywords: [
      'Rw',
      "L'nw",
      'isolamento acustico',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'cosa-sono-ponti-termici-come-correggerli',
    title: "Cos'è un Ponte Termico e Come Correggerlo",
    description:
      'Illustra i diversi tipi di ponti termici, gli effetti su dispersioni e muffe e le strategie di correzione secondo UNI 10211.',
    metaDescription:
      'Guida ai ponti termici: identificazione, effetti su muffe e consumi, correzione con soluzioni costruttive conformi alla UNI 10211.',
    category: 'guide',
    keywords: [
      'ponte termico',
      'dispersioni termiche',
      'muffa pareti',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'progettare-comfort-acustico-riverberazione',
    title: 'Progettare il Comfort Acustico: Guida a T60',
    description:
      'Analizza il tempo di riverberazione e l’effetto dei materiali fonoassorbenti per ottimizzare il comfort acustico degli ambienti.',
    metaDescription:
      'Tempo di riverberazione T60: guida alla progettazione acustica con formula di Sabine e scelta dei materiali assorbenti.',
    category: 'guide',
    keywords: [
      'tempo riverberazione',
      'comfort acustico',
      'materiali fonoassorbenti',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'confronto-materiali-isolanti-termici',
    title: 'Materiali Isolanti Termici a Confronto',
    description:
      'Confronta i principali isolanti termici (EPS, XPS, lane minerali, sughero) per conducibilità, resistenza al vapore e impieghi.',
    metaDescription:
      'Confronto tra materiali isolanti termici: valori λ, resistenza al vapore μ e applicazioni tipiche.',
    category: 'guide',
    keywords: [
      'materiali isolanti',
      'conducibilità termica',
      'resistenza al vapore',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-uni-en-12831-dispersioni-termiche',
    title: 'Guida alla UNI EN 12831: Calcolo Fabbisogno',
    description:
      'Spiega il calcolo delle dispersioni termiche per trasmissione e ventilazione secondo la norma UNI EN 12831.',
    metaDescription:
      'Guida alla UNI EN 12831 per il calcolo del fabbisogno termico degli edifici e il dimensionamento degli impianti.',
    category: 'guide',
    keywords: [
      'UNI EN 12831',
      'fabbisogno termico',
      'dimensionamento impianto',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'scegliere-radiatori-delta-t-potenza',
    title: 'Scegliere i Radiatori: ΔT e Potenza',
    description:
      'Illustra il significato di ΔT30, ΔT50 e come influisce sulla resa dei radiatori per un corretto dimensionamento.',
    metaDescription:
      'Come scegliere i radiatori in funzione del ΔT e della potenza richiesta per il comfort termico degli ambienti.',
    category: 'guide',
    keywords: [
      'radiatori',
      'delta T',
      'potenza termica',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'differenza-legge-10-ape',
    title: 'Legge 10 e APE: Facciamo Chiarezza',
    description:
      'Confronta la Relazione tecnica Legge 10 con l’Attestato di Prestazione Energetica spiegando obiettivi e contenuti.',
    metaDescription:
      'Differenza tra relazione Legge 10 e APE: finalità, contenuti e quando sono necessari nei progetti energetici.',
    category: 'guide',
    keywords: [
      'legge 10',
      'APE',
      'prestazione energetica',
    ],
    author: defaultAuthors.acousticsEngineer,
    datePublished: '2024-11-25',
    dateModified: '2025-03-02',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-cei-64-8-sezione-cavi',
    title: 'Guida alla CEI 64-8: Scegliere la Sezione dei Cavi',
    description:
      'Illustra come dimensionare la sezione dei cavi elettrici considerando portata Iz, tabelle di posa e caduta di tensione.',
    metaDescription:
      'Guida pratica alla CEI 64-8 per scegliere la sezione dei cavi: portata, posa e caduta di tensione consentita.',
    category: 'guide',
    keywords: [
      'CEI 64-8',
      'sezione cavi',
      'portata Iz',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'coordinamento-cavo-interruttore-magnetotermico',
    title: 'Coordinamento Cavo-Interruttore (Guida)',
    description:
      'Spiega i criteri Ib ≤ In ≤ Iz e I2 ≤ 1,45·Iz per proteggere correttamente i cavi con interruttori magnetotermici.',
    metaDescription:
      'Guida al coordinamento tra cavo e interruttore magnetotermico secondo CEI 64-8 con esempi numerici.',
    category: 'guide',
    keywords: [
      'coordinamento cavo',
      'interruttore magnetotermico',
      'protezione sovraccarico',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-rifasamento-cos-phi-potenza-reattiva',
    title: 'Rifasamento: Cos’è il cos phi e Perché Correggerlo',
    description:
      'Analizza il triangolo delle potenze e i benefici tecnici ed economici del rifasamento degli impianti elettrici.',
    metaDescription:
      'Guida al rifasamento: cos phi, potenza attiva e reattiva e scelta della batteria di condensatori.',
    category: 'guide',
    keywords: [
      'rifasamento',
      'cos phi',
      'potenza reattiva',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'come-funziona-interruttore-differenziale-salvavita',
    title: 'Il "Salva-Vita": Come Funziona il Differenziale',
    description:
      'Descrive il principio di funzionamento degli interruttori differenziali, le classi disponibili e le protezioni dai contatti indiretti.',
    metaDescription:
      'Spiegazione dell’interruttore differenziale: classi AC, A, F, B e criteri di selezione per la sicurezza elettrica.',
    category: 'guide',
    keywords: [
      'interruttore differenziale',
      'salvavita',
      'protezione contatti indiretti',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'differenze-sistemi-distribuzione-tt-tn-it',
    title: 'Sistemi di Distribuzione TT, TN, IT (CEI 64-8)',
    description:
      'Confronta i sistemi di distribuzione TT, TN e IT evidenziando implicazioni su protezioni e impianto di terra.',
    metaDescription:
      'Guida ai sistemi TT, TN e IT secondo CEI 64-8: caratteristiche, vantaggi e scelte progettuali.',
    category: 'guide',
    keywords: [
      'sistemi TT',
      'sistemi TN',
      'impianto di terra',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'cos-e-corrente-corto-circuito-icc',
    title: 'Corto Circuito (Icc): Cos’è e Perché si Calcola',
    description:
      'Spiega il significato di corrente di corto circuito, potere di interruzione e perché devono essere verificati.',
    metaDescription:
      'Cos’è la corrente di corto circuito Icc e come scegliere dispositivi con adeguato potere di interruzione.',
    category: 'guide',
    keywords: [
      'corrente di corto circuito',
      'potere di interruzione',
      'protezione impianti',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'spiegazione-curve-intervento-magnetotermici-b-c-d',
    title: 'Curve Magnetotermici (B, C, D, K, Z)',
    description:
      'Descrive le curve di intervento degli interruttori magnetotermici e quando utilizzare ciascuna tipologia.',
    metaDescription:
      'Guida alle curve B, C, D, K, Z degli interruttori magnetotermici con esempi applicativi per carichi diversi.',
    category: 'guide',
    keywords: [
      'curve magnetotermico',
      'protezione circuiti',
      'interruttori automatici',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-uni-en-12464-1-illuminazione-lavoro',
    title: 'Guida alla UNI EN 12464-1 (Illuminazione)',
    description:
      'Esamina i requisiti di illuminamento, uniformità e abbagliamento per i luoghi di lavoro secondo la norma UNI EN 12464-1.',
    metaDescription:
      'Guida alla UNI EN 12464-1: lux, uniformità e UGR per progettare l’illuminazione dei luoghi di lavoro.',
    category: 'guide',
    keywords: [
      'UNI EN 12464-1',
      'illuminamento',
      'UGR',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'verifica-impianto-terra-dpr-462-01',
    title: 'Verifica Impianto di Terra (DPR 462/01)',
    description:
      'Approfondisce gli obblighi di verifica periodica degli impianti di terra e il significato dei parametri Rt e Ra.',
    metaDescription:
      'Guida al DPR 462/01 per la verifica degli impianti di terra: controlli obbligatori e parametri da rispettare.',
    category: 'guide',
    keywords: [
      'DPR 462/01',
      'verifica impianto terra',
      'resistenza terra',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'posa-cavi-riempimento-tubi-corrugati',
    title: 'Posa Cavi (CEI 64-8): Riempimento Tubi',
    description:
      'Guida alle regole di posa dei cavi nei tubi corrugati e canaline con calcolo del grado di riempimento massimo consentito.',
    metaDescription:
      'Regole CEI 64-8 per la posa dei cavi: calcolo del grado di riempimento dei tubi e garanzia di sfilabilità.',
    category: 'guide',
    keywords: [
      'posa cavi',
      'tubi corrugati',
      'grado riempimento',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-progettazione-geotecnica-ntc-2018-ec7',
    title: 'Progettazione Geotecnica NTC 2018: Guida Pratica',
    description:
      'Spiega il capitolo 6 delle NTC 2018 e l’Eurocodice 7: approcci progettuali, combinazioni e stati limite GEO/STR.',
    metaDescription:
      'Guida pratica alla progettazione geotecnica secondo NTC 2018 ed Eurocodice 7: Approccio 1 e 2, stati limite GEO e STR.',
    category: 'guide',
    keywords: [
      'NTC 2018 geotecnica',
      'Eurocodice 7',
      'stati limite GEO',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'teoria-consolidazione-terzaghi-cedimenti',
    title: 'Teoria della Consolidazione (Terzaghi) e Cedimenti',
    description:
      'Spiega cedimenti immediati e di consolidazione con riferimento alla teoria di Terzaghi e alle curve e-logσ’.',
    metaDescription:
      'Guida alla teoria della consolidazione di Terzaghi per il calcolo dei cedimenti edometrici.',
    category: 'guide',
    keywords: [
      'consolidazione Terzaghi',
      'cedimenti',
      'indice di compressibilità',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'spinta-terreni-attiva-passiva-rankine-coulomb',
    title: 'Spinta Attiva, Passiva e a Riposo: Teorie a Confronto',
    description:
      'Confronta le teorie di Rankine e Coulomb per il calcolo delle spinte del terreno e introduce il coefficiente a riposo K₀.',
    metaDescription:
      'Guida alle spinte attive, passive e a riposo dei terreni con teorie di Rankine e Coulomb.',
    category: 'guide',
    keywords: [
      'spinta attiva',
      'spinta passiva',
      'Rankine Coulomb',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'metodi-verifica-stabilita-pendii-equilibrio-limite',
    title: 'Metodi di Verifica Stabilità Pendii (Equilibrio Limite)',
    description:
      'Analizza i principali metodi dell’equilibrio limite (Fellenius, Bishop, Janbu) per la verifica di stabilità dei pendii.',
    metaDescription:
      'Guida ai metodi di verifica della stabilità dei pendii: Fellenius, Bishop semplificato e Janbu.',
    category: 'guide',
    keywords: [
      'stabilità pendii',
      'metodo Fellenius',
      'Bishop Janbu',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-verifica-liquefazione-ntc-2018-sismica',
    title: 'Guida alla Verifica di Liquefazione (NTC 2018)',
    description:
      'Spiega la procedura semplificata Seed & Idriss per valutare la liquefazione dei terreni sabbiosi secondo NTC 2018.',
    metaDescription:
      'Guida alla verifica di liquefazione dei terreni in zona sismica secondo NTC 2018 e metodo Seed Idriss.',
    category: 'guide',
    keywords: [
      'liquefazione',
      'Seed Idriss',
      'NTC 2018',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'come-classificare-terreni-uscs-agi-casagrande',
    title: 'Come Classificare i Terreni (USCS e AGI)',
    description:
      'Guida pratica alla classificazione geotecnica tramite carta di Casagrande e curve granulometriche.',
    metaDescription:
      'Classificazione geotecnica dei terreni con sistemi USCS e AGI usando limiti di Atterberg e analisi granulometrica.',
    category: 'guide',
    keywords: [
      'classificazione terreni',
      'USCS',
      'limiti Atterberg',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'calcolo-portanza-pali-fondazione-ntc-2018',
    title: 'Calcolo Portanza Pali (NTC 2018): Punta e Laterale',
    description:
      'Spiega come calcolare i contributi di punta e laterali della portanza dei pali di fondazione secondo le NTC 2018.',
    metaDescription:
      'Guida al calcolo della portanza dei pali di fondazione secondo NTC 2018: resistenza di punta e laterale.',
    category: 'guide',
    keywords: [
      'portanza pali',
      'NTC 2018',
      'resistenza laterale',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'interpretare-prove-geotecniche-cpt-vs-spt',
    title: 'Interpretare le Prove Geotecniche: CPT e SPT a Confronto',
    description:
      'Analizza vantaggi, limiti e correlazioni delle prove penetrometriche statiche CPT/CPTU e dinamiche SPT.',
    metaDescription:
      'Guida alla lettura dei risultati CPT e SPT con correlazioni pratiche per parametri geotecnici.',
    category: 'guide',
    keywords: [
      'prove CPT',
      'prove SPT',
      'correlazioni geotecniche',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'progettazione-paratie-diaframmi-sostegno',
    title: 'Progettazione di Paratie e Diaframmi (Opere di Sostegno)',
    description:
      'Descrive criteri progettuali per paratie a sbalzo, tirantate o ancorate e le verifiche geotecniche richieste.',
    metaDescription:
      'Guida alla progettazione di paratie e diaframmi: tipologie, verifiche e criteri di scelta.',
    category: 'guide',
    keywords: [
      'paratie',
      'diaframmi',
      'opere di sostegno',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'parametri-fondamentali-terreno-indici-vuoti-porosita',
    title: 'I Parametri Fondamentali del Terreno (Indice Vuoti, Porosità)',
    description:
      'Spiega le relazioni tra le fasi solida, liquida e gassosa del terreno e i principali indici geotecnici.',
    metaDescription:
      'Guida agli indici geotecnici di base: indice dei vuoti, porosità, grado di saturazione e pesi specifici.',
    category: 'guide',
    keywords: [
      'indice dei vuoti',
      'porosità',
      'grado di saturazione',
    ],
    author: defaultAuthors.geotechnicalEngineer,
    datePublished: '2024-12-11',
    dateModified: '2025-03-18',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-regime-forfettario-professionisti',
    title: 'Guida al Regime Forfettario [Anno Corrente]',
    description:
      'Illustra requisiti di accesso, coefficienti di redditività, calcolo di imposte e contributi nel regime forfettario.',
    metaDescription:
      'Regime forfettario per professionisti: requisiti, coefficienti di redditività, imposte e contributi con esempi pratici.',
    category: 'guide',
    keywords: [
      'regime forfettario',
      'coefficiente redditività',
      'tasse forfettario',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'inarcassa-vs-gestione-separata-inps',
    title: 'Inarcassa vs Gestione Separata INPS',
    description:
      'Confronta le due gestioni previdenziali per ingegneri e architetti: requisiti, contributi e vantaggi.',
    metaDescription:
      'Guida comparativa Inarcassa e Gestione Separata INPS per professionisti tecnici, contributi e obblighi.',
    category: 'guide',
    keywords: [
      'Inarcassa',
      'Gestione Separata',
      'previdenza professionisti',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'spiegazione-decreto-parametri-dm-2016',
    title: 'Come Calcolare i Parametri (DM 17/06/2016)',
    description:
      'Spiega i parametri V, G, Q e P del Decreto Parametri con esempi di calcolo del compenso professionale.',
    metaDescription:
      'Guida al Decreto Parametri DM 17/06/2016: significato dei parametri V, G, Q, P e calcolo del compenso.',
    category: 'guide',
    keywords: [
      'Decreto Parametri',
      'DM 17/06/2016',
      'compenso professionale',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'come-calcolare-tariffa-oraria-professionista',
    title: 'Come Determinare la Tariffa Oraria (Metodo)',
    description:
      'Metodologia per calcolare la tariffa oraria di uno studio professionale analizzando costi fissi, variabili e ore fatturabili.',
    metaDescription:
      'Metodo pratico per definire la tariffa oraria di professionisti tecnici: costi fissi, variabili e margine.',
    category: 'guide',
    keywords: [
      'tariffa oraria',
      'studio tecnico',
      'analisi costi',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-van-tir-valutazione-investimenti-immobiliari',
    title: 'Guida a VAN e TIR: Valutare Investimenti Immobiliari',
    description:
      'Spiega come utilizzare VAN e TIR per valutare investimenti, con esempi applicati a operazioni immobiliari.',
    metaDescription:
      'Guida a VAN (NPV) e TIR (IRR) per analisi di investimenti immobiliari e progetti aziendali.',
    category: 'guide',
    keywords: [
      'VAN',
      'TIR',
      'investimenti immobiliari',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'ammortamento-francese-spiegazione-calcolo-rata',
    title: 'Ammortamento Francese: Spiegazione Pratica',
    description:
      'Descrive la scomposizione della rata costante in quota capitale e interessi in un piano di ammortamento alla francese.',
    metaDescription:
      'Guida all’ammortamento francese: calcolo rata, quota capitale e interessi per mutui a rata costante.',
    category: 'guide',
    keywords: [
      'ammortamento francese',
      'rata mutuo',
      'quota capitale',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'differenza-roi-roe-roa-indici-redditivita',
    title: 'ROI, ROE, ROA: Capire gli Indici di Redditività',
    description:
      'Spiega le differenze tra ROI, ROE e ROA e come interpretarli nella gestione economico-finanziaria di uno studio.',
    metaDescription:
      'Guida ai principali indici di redditività aziendale: ROI, ROE, ROA e loro interpretazione.',
    category: 'guide',
    keywords: [
      'ROI',
      'ROE',
      'ROA',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-reverse-charge-edilizia-iva',
    title: 'Il Reverse Charge (Edilizia): Come Funziona',
    description:
      'Spiega l’inversione contabile IVA nel settore edile, quando si applica e come emettere correttamente la fattura.',
    metaDescription:
      'Guida al reverse charge in edilizia: obblighi, casi applicativi e gestione in fattura.',
    category: 'guide',
    keywords: [
      'reverse charge',
      'IVA edilizia',
      'fatturazione',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'leasing-vs-acquisto-beni-strumentali',
    title: 'Leasing vs Acquisto: Cosa Conviene al Professionista?',
    description:
      'Confronta costi e benefici fiscali di leasing, acquisto e noleggio di beni strumentali per professionisti tecnici.',
    metaDescription:
      'Analisi comparativa tra leasing e acquisto di beni strumentali per professionisti: vantaggi fiscali e finanziari.',
    category: 'guide',
    keywords: [
      'leasing',
      'acquisto beni strumentali',
      'analisi costi benefici',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'business-plan-studio-tecnico-ingegneria',
    title: 'Il Business Plan dello Studio Tecnico: Guida',
    description:
      'Illustra come costruire un business plan per studi tecnici: analisi mercato, costi, ricavi e break-even.',
    metaDescription:
      'Guida alla redazione del business plan per studi tecnici: analisi di mercato, piano economico e break-even.',
    category: 'guide',
    keywords: [
      'business plan studio tecnico',
      'analisi costi ricavi',
      'break even',
    ],
    author: defaultAuthors.accountant,
    datePublished: '2024-12-18',
    dateModified: '2025-03-22',
    schema: 'WebApplication',
  },
  {
    slug: 'posa-cavi-riempimento-tubi-corrugati',
    title: 'Posa Cavi (CEI 64-8): Riempimento Tubi',
    description:
      'Guida alle regole di posa dei cavi nei tubi corrugati e canaline con calcolo del grado di riempimento massimo consentito.',
    metaDescription:
      'Regole CEI 64-8 per la posa dei cavi: calcolo del grado di riempimento dei tubi e garanzia di sfilabilità.',
    category: 'guide',
    keywords: [
      'posa cavi',
      'tubi corrugati',
      'grado riempimento',
    ],
    author: defaultAuthors.electricalEngineer,
    datePublished: '2024-12-02',
    dateModified: '2025-03-06',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-progettazione-impianti-idrosanitari-uni-9182',
    title: 'Progettare Impianti Idrosanitari: Guida alla UNI 9182',
    description:
      'Spiega unità di carico, velocità di progetto e criteri per dimensionare reti idriche secondo la norma UNI 9182.',
    metaDescription:
      'Guida alla UNI 9182 per impianti idrosanitari: unità di carico, diametri e velocità consigliate.',
    category: 'guide',
    keywords: [
      'UNI 9182',
      'impianti idrosanitari',
      'unità di carico',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-uni-12056-scarico-acque',
    title: 'Guida alla UNI EN 12056: Scarico Acque',
    description:
      'Descrive pendenze minime, unità di scarico e ventilazioni delle reti di scarico civili secondo UNI EN 12056.',
    metaDescription:
      'Guida alla UNI EN 12056-2 per progettare reti di scarico: pendenze, DU e sistemi di ventilazione.',
    category: 'guide',
    keywords: [
      'UNI EN 12056',
      'reti di scarico',
      'unità di scarico',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'spiegazione-perdite-carico-distribuite-localizzate',
    title: 'Perdite di Carico: Distribuite e Localizzate',
    description:
      'Spiega le differenze tra perdite distribuite e perdite localizzate nelle condotte e come calcolarle.',
    metaDescription:
      'Guida alle perdite di carico in tubazioni: formule di Darcy-Weisbach e coefficienti locali.',
    category: 'guide',
    keywords: [
      'perdite di carico',
      'darcy weisbach',
      'coefficiente locale',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'spiegazione-equazione-continuita-qva',
    title: "L'Equazione di Continuità (Q = V · A): Spiegazione",
    description:
      'Introduzione pratica all’equazione di continuità e al legame tra portata, velocità e area.',
    metaDescription:
      'Equazione di continuità spiegata: calcolo della portata e della velocità in condotte idrauliche.',
    category: 'guide',
    keywords: [
      'equazione continuità',
      'portata',
      'velocità fluido',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'come-scegliere-pompa-prevalenza-portata',
    title: 'Come Scegliere una Pompa: Prevalenza e Portata',
    description:
      'Guida alla lettura delle curve di pompaggio e al calcolo della prevalenza richiesta da un impianto.',
    metaDescription:
      'Scelta della pompa: prevalenza totale, curve caratteristiche e punto di funzionamento ottimale.',
    category: 'guide',
    keywords: [
      'prevalenza pompa',
      'curve pompa',
      'dimensionamento pompe',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'flusso-laminare-turbolento-numero-reynolds',
    title: 'Flusso Laminare vs Turbolento: Il Numero di Reynolds',
    description:
      'Spiega i regimi di moto nei fluidi e l’importanza del numero di Reynolds nelle progettazioni idrauliche.',
    metaDescription:
      'Numero di Reynolds: come classificare il moto laminare e turbolento nelle condotte.',
    category: 'guide',
    keywords: [
      'numero Reynolds',
      'flusso laminare',
      'flusso turbolento',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'equazione-bernoulli-spiegazione-pratica',
    title: "L'Equazione di Bernoulli: Spiegazione Semplice",
    description:
      'Introduce il principio di Bernoulli e le sue applicazioni in impianti idraulici civili e industriali.',
    metaDescription:
      'Equazione di Bernoulli spiegata in modo pratico con esempi per impianti idraulici.',
    category: 'guide',
    keywords: [
      'equazione Bernoulli',
      'energia fluido',
      'idraulica',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'guida-uni-12056-3-acque-meteoriche-pluviali',
    title: 'Guida UNI EN 12056-3: Acque Meteoriche',
    description:
      'Spiega come dimensionare pluviali e canali di gronda in base all’intensità di pioggia e alla superficie di captazione.',
    metaDescription:
      'Dimensionamento delle acque meteoriche secondo UNI EN 12056-3: pluviali e canali di gronda.',
    category: 'guide',
    keywords: [
      'UNI EN 12056-3',
      'acque meteoriche',
      'pluviali',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'vaso-espansione-riscaldamento-guida',
    title: "Vaso d'Espansione: Perché si Usa e Come si Calcola",
    description:
      'Descrive il funzionamento dei vasi di espansione e le formule per dimensionarli negli impianti di riscaldamento.',
    metaDescription:
      "Guida al dimensionamento del vaso d'espansione negli impianti di riscaldamento a circuito chiuso.",
    category: 'guide',
    keywords: [
      "vaso d'espansione",
      'riscaldamento',
      'impianti chiusi',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
    schema: 'WebApplication',
  },
  {
    slug: 'idraulica-pelo-libero-formula-manning',
    title: 'Idraulica a Pelo Libero: Formula di Manning',
    description:
      'Approfondisce la formula di Manning-Strickler per il calcolo della portata in canali aperti e fognature.',
    metaDescription:
      'Formula di Manning per canali a pelo libero: coefficiente di scabrezza e portata.',
    category: 'guide',
    keywords: [
      'formula Manning',
      'canali aperti',
      'portata',
    ],
    author: defaultAuthors.hydraulicEngineer,
    datePublished: '2024-12-07',
    dateModified: '2025-03-12',
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
