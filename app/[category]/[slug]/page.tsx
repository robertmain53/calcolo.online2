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
import SeismicBaseShearCalculator from '@/components/SeismicBaseShearCalculator';
import ConcreteBeamVerification from '@/components/ConcreteBeamVerification';
import CableSizingCalculator from '@/components/CableSizingCalculator';
import VoltageDropCalculator from '@/components/VoltageDropCalculator';
import MagnetothermicBreakerCalculator from '@/components/MagnetothermicBreakerCalculator';
import ShortCircuitCurrentCalculator from '@/components/ShortCircuitCurrentCalculator';
import ConduitSizingCalculator from '@/components/ConduitSizingCalculator';
import EarthResistanceCalculator from '@/components/EarthResistanceCalculator';
import PowerFactorCorrectionCalculator from '@/components/PowerFactorCorrectionCalculator';
import OhmsLawPowerCalculator from '@/components/OhmsLawPowerCalculator';
import IlluminanceLampsCalculator from '@/components/IlluminanceLampsCalculator';
import MotorInrushCalculator from '@/components/MotorInrushCalculator';
import LowVoltageCableCalculator from '@/components/LowVoltageCableCalculator';
import PressureConverter from '@/components/PressureConverter';
import PowerConverter from '@/components/PowerConverter';

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
        'Sì, il tool applica le tabelle CEI 64-8/CEI UNEL 35024-1 combinando fattori di posa, temperatura e raggruppamento per restituire la portata Iz corretta del cavo.',
    },
    {
      question: 'Posso verificare protezioni e corto circuito?',
      answer:
        'Il calcolatore controlla Ib ≤ In ≤ Iz, stima la caduta di tensione e confronta la corrente di corto circuito impostata con la capacità termica del cavo (S ≥ Icc·√t/k) evidenziando gli scostamenti critici.',
    },
  ],
  'calcolo-sezione-cavo-portata': [
    {
      question: 'Come viene determinata la portata Iz consigliata?',
      answer:
        'Il calcolatore applica i coefficienti correttivi CEI 64-8 per il metodo di posa, la temperatura ambiente e il numero di conduttori attivi restituendo la portata disponibile per la sezione selezionata.',
    },
    {
      question: 'È inclusa la verifica della caduta di tensione?',
      answer:
        'Sì, oltre alla sezione minima viene calcolata la caduta di tensione percentuale e confrontata con il limite impostato, suggerendo eventuali adeguamenti della sezione.',
    },
  ],
  'calcolo-caduta-tensione-linea': [
    {
      question: 'Quali limiti normativi vengono applicati?',
      answer:
        'Per impostazione predefinita vengono proposti i limiti CEI 64-8: 4% per forza motrice e 3% per illuminazione. È possibile impostare un valore personalizzato per adeguarsi a prescrizioni specifiche.',
    },
    {
      question: 'Il tool calcola anche la lunghezza massima ammessa?',
      answer:
        'Sì, oltre alla caduta di tensione restituisce la lunghezza massima utile della tratta con i parametri inseriti e suggerisce sezioni alternative conformi.',
    },
  ],
  'dimensionamento-interruttore-magnetotermico': [
    {
      question: 'Come verifico che l\'interruttore scelto sia coordinato con il cavo?',
      answer:
        'Il calcolatore controlla automaticamente Ib ≤ In ≤ Iz e la condizione I₂ ≤ 1,45·Iz prevista dalla CEI 64-8, suggerendo eventuali taglie alternative o l\'adeguamento della sezione del cavo.',
    },
    {
      question: 'È possibile valutare anche la soglia magnetica rispetto all\'Icc presunta?',
      answer:
        'Sì, inserendo la corrente di corto circuito il tool confronta il valore con le soglie della curva magnetica (B, C, D) e segnala se occorre cambiare curva o dispositivo.',
    },
  ],
  'calcolo-corrente-corto-circuito-icc': [
    {
      question: 'Quali normative vengono considerate per il calcolo di Ik?',
      answer:
        'Il calcolo si basa sulle indicazioni della CEI 64-8 e della CEI 60909, applicando la tensione di guasto ridotta e l\'impedenza equivalente del trasformatore e della linea.',
    },
    {
      question: 'Posso verificare se il potere d\'interruzione del dispositivo è adeguato?',
      answer:
        'Inserendo il valore di Icu del dispositivo il calcolatore confronta automaticamente Ik presunta e segnala se occorre selezionare un interruttore con potere superiore.',
    },
  ],
  'dimensionamento-tubi-portacavi': [
    {
      question: 'Qual è il grado massimo di riempimento consentito per i tubi?',
      answer:
        'La CEI 64-8 raccomanda un riempimento non superiore al 40% per tubi e guaine, riducibile per tratti lunghi o curve strette. Il tool consente di impostare un valore personalizzato.',
    },
    {
      question: 'Come inserire i diametri corretti dei cavi?',
      answer:
        'Utilizza i diametri esterni riportati sui cataloghi dei costruttori (guaina inclusa). In mancanza di dati ufficiali, applica un margine di sicurezza del 10% rispetto ai diametri teorici.',
    },
  ],
  'calcolo-resistenza-impianto-terra': [
    {
      question: 'Quali metodi utilizza il calcolo della resistenza di terra?',
      answer:
        'Il calcolatore applica le formule CEI 64-8 per picchetti, nastri e anelli, con possibilità di modellare il terreno a strato unico o a due strati con resistività diverse.',
    },
    {
      question: 'È possibile verificare la conformità con i limiti normativi?',
      answer:
        'Inserendo il valore massimo ammesso (es. 50 Ω per sistemi TT) il tool segnala automaticamente se l\'impianto rispetta la soglia o richiede integrazioni.',
    },
  ],
  'calcolo-rifasamento-cos-phi': [
    {
      question: 'Quale cos φ target è consigliato?',
      answer:
        'I distributori italiani richiedono cos φ ≥ 0,95 per evitare penali. Il tool consente di impostare target fino a 0,99, segnalando eventuali rischi di rifasamento eccessivo (cos φ capacitivo).',
    },
    {
      question: 'Come sono calcolati i gradini della batteria di condensatori?',
      answer:
        'La suddivisione avviene usando le taglie standard (5-100 kVAR). Puoi aggiungere un gradino custom se il valore calcolato non coincide con quelli commerciali.',
    },
  ],
  'calcolatore-legge-ohm-potenza': [
    {
      question: 'Quali grandezze elettriche posso determinare con il calcolatore?',
      answer:
        'Lo strumento fornisce tensione, corrente, impedenza, potenze attiva/reactive/apparente e fattore di potenza per circuiti in DC, monofase e trifase equilibrato. I calcoli seguono le relazioni CEI 64-8 capitolo 2 con precisione numerica meglio di 1‰ grazie all’uso di valori RMS coerenti.',
    },
    {
      question: 'Come gestisce il fattore di potenza per carichi induttivi o capacitivi?',
      answer:
        'Puoi inserire cos φ con segno oppure direttamente Q con segno: il motore assegna automaticamente la natura induttiva/capacitiva al carico e calcola le componenti R ed X della impedenza come richiesto da CEI EN 50160 e dalle guide ARERA sul rifasamento.',
    },
    {
      question: 'Posso usare il risultato per dimensionare protezioni e cavi?',
      answer:
        'Sì. Una volta determinati Ib, S e cos φ puoi confrontarli con i limiti CEI 64-8 per le protezioni (art. 433) e, integrandoli con la caduta di tensione, scegliere sezione e interruttore. In fase di progetto allega comunque le verifiche di caduta e corto circuito dedicate.',
    },
  ],
  'calcolo-illuminotecnico-numero-lampade': [
    {
      question: 'Quale metodo di calcolo utilizza per stimare il numero di lampade?',
      answer:
        'Il tool applica il metodo del flusso totale (cavità zonale) previsto da UNI EN 12464-1 e UNI 10380, utilizzando il fattore di utilizzazione UF e il maintenance factor MF impostati dal progettista o stimati a partire dalle riflettanze del locale.',
    },
    {
      question: 'Posso stimare il fattore di utilizzazione senza le curve fotometriche del costruttore?',
      answer:
        'Sì, attivando la modalità “Calcola da riflettanze” il calcolatore ricava un UF indicativo in funzione dell’indice del locale K e delle riflettanze di soffitto, pareti e pavimento. Per la progettazione esecutiva è comunque raccomandato utilizzare i dati IES/ULD del produttore.',
    },
    {
      question: 'Come verifico uniformità e controllo dell’abbagliamento?',
      answer:
        'Il risultato fornisce la spaziatura consigliata e segnala quando il rapporto interasse/altezza supera 1,5. Per il controllo di UGR e uniformità U₀ è necessario un calcolo fotometrico dettagliato (Dialux/Relux) secondo UNI EN 12464-1 allegato B.',
    },
  ],
  'calcolo-corrente-spunto-motore': [
    {
      question: 'Come viene calcolata la corrente di spunto del motore?',
      answer:
        'Il calcolatore ricava la corrente nominale In dalla potenza di targa (P = √3 · V · I · η · cosφ) e la moltiplica per il rapporto Iavv/In impostato secondo il metodo di avviamento scelto, in accordo con le curve CEI EN 60034-12.',
    },
    {
      question: 'Posso stimare l’impatto della corrente di spunto sulla rete di alimentazione?',
      answer:
        'Inserendo la potenza di corto circuito Sk disponibile sul quadro il tool calcola la caduta di tensione percentuale (ΔV ≈ Iavv/Ik · 100), evidenziando se supera i limiti di CEI EN 61000-3-11.',
    },
    {
      question: 'Quando conviene passare da avviamento diretto a soluzioni ridotte?',
      answer:
        'Il riepilogo segnala rapporti di spunto elevati e fornisce note operative: se Iavv supera 6·In o la caduta di tensione è >15% valuta stella-triangolo, soft starter, autotrasformatore o inverter per contenere i transitori.',
    },
  ],
  'convertitore-potenza-kw-hp-cv': [
    {
      question: 'Qual è la differenza tra HP, CV e kW?',
      answer:
        '1 HP (horsepower SAE) vale 745,7 W, 1 CV (cavallo vapore metrico) vale 735,5 W, mentre 1 kW corrisponde a 1 000 W. Il convertitore utilizza i fattori ISO/NIST per confrontare le unità in modo coerente.',
    },
    {
      question: 'Posso stimare la potenza assorbita da un motore?',
      answer:
        'Sì. Inserendo l’efficienza η il tool calcola automaticamente la potenza assorbita (Pinput = Poutput/η) e suggerisce la coppia all’albero in funzione dei giri impostati.',
    },
    {
      question: 'Sono supportati i sistemi HVAC?',
      answer:
        'Oltre a kW e HP, il convertitore gestisce BTU/h e tonnellate di refrigerazione (1 TR = 3,517 kW) per confrontare chiller e unità di climatizzazione industriale.',
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
  'convertitore-pressione-bar-psi-pa': [
    {
      question: 'Qual è la differenza tra pressione assoluta e relativa (gauge)?',
      answer:
        'La pressione assoluta è misurata rispetto al vuoto (Pa assoluti), mentre la pressione gauge è misurata rispetto alla pressione atmosferica. Il convertitore consente di impostare il dato come gauge aggiungendo automaticamente l’atmosfera di riferimento.',
    },
    {
      question: 'Posso modificare la pressione atmosferica di riferimento?',
      answer:
        'Sì. Nelle impostazioni avanzate imposti la pressione atmosferica locale (ad esempio 95 kPa per siti in quota) così da ottenere conversioni accurate tra gauge e valori assoluti.',
    },
    {
      question: 'Quali unità supporta il convertitore?',
      answer:
        'Sono incluse le principali unità: Pascal, kPa, MPa, bar, mbar, psi, atm, Torr, pollici e millimetri di colonna d’acqua, e kgf/cm² con fattori conformi a ISO 80000-4 e tabelle NIST.',
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
        text: 'Analizza portata corretta Iz, caduta di tensione, verifica Ib ≤ In ≤ Iz e controlla l’idoneità al corto circuito impostato.',
      },
    ],
  },
  'calcolo-sezione-cavo-portata': {
    name: 'Come Calcolare la Sezione Minima del Cavo',
    description: 'Metodo passo-passo per dimensionare la sezione del cavo sulla base della portata Iz e della caduta di tensione.',
    steps: [
      {
        name: 'Stima la corrente di progetto',
        text: 'Inserisci potenza, fattore di potenza, rendimento o la corrente nominale disponibile per ottenere la corrente di progetto Ib.',
      },
      {
        name: 'Imposta materiale e posa',
        text: 'Scegli rame o alluminio, il metodo di posa e il numero di conduttori attivi per applicare i coefficienti correttivi CEI 64-8.',
      },
      {
        name: 'Confronta portata e caduta',
        text: 'Verifica la sezione suggerita, la portata corrispondente e la caduta di tensione rispetto al limite inserito, valutando eventuali sezioni alternative.',
      },
    ],
  },
  'calcolo-caduta-tensione-linea': {
    name: 'Come Verificare la Caduta di Tensione di una Linea',
    description: 'Passi operativi per controllare che la caduta di tensione sia nei limiti CEI 64-8.',
    steps: [
      {
        name: 'Definisci il carico',
        text: 'Seleziona tipo di rete, tensione e potenza (o corrente) per determinare la corrente di progetto Ib.',
      },
      {
        name: 'Inserisci sezione e condizioni',
        text: 'Indica materiale, sezione, lunghezza e temperatura del conduttore per calcolare la resistività equivalente.',
      },
      {
        name: 'Confronta con il limite',
        text: 'Analizza la caduta ΔV rispetto al limite scelto e valuta la lunghezza massima ammessa o le sezioni alternative proposte.',
      },
    ],
  },
  'calcolatore-legge-ohm-potenza': {
    name: 'Come determinare P, Q, S e cos φ con la legge di Ohm',
    description:
      'Procedura guidata per ricavare tutte le grandezze elettriche fondamentali a partire da due dati di targa o di misura.',
    steps: [
      {
        name: 'Seleziona il tipo di circuito',
        text: 'Indica se il circuito è in corrente continua, monofase o trifase e specifica se la tensione immessa è linea-linea o linea-neutro.',
      },
      {
        name: 'Inserisci due grandezze note',
        text: 'Compila almeno due campi tra tensione, corrente, |Z|, potenza attiva o apparente e il fattore di potenza, rispettando le unità utilizzate in campo.',
      },
      {
        name: 'Analizza i risultati',
        text: 'Verifica corrente Ib, potenze P-Q-S, cos φ e impedenza ottenuti confrontandoli con i limiti CEI 64-8 per il dimensionamento di cavi e protezioni.',
      },
    ],
  },
  'calcolo-illuminotecnico-numero-lampade': {
    name: 'Come dimensionare il numero di corpi illuminanti',
    description:
      'Sequenza operativa per calcolare le lampade necessarie con il metodo del flusso totale conforme alla UNI EN 12464-1.',
    steps: [
      {
        name: 'Definisci il locale e il compito visivo',
        text: 'Inserisci lunghezza, larghezza, altezza di montaggio e seleziona lo scenario UNI EN 12464-1 per caricare il valore di illuminamento richiesto.',
      },
      {
        name: 'Imposta i dati dell’apparecchio',
        text: 'Indica il flusso luminoso per apparecchio, il maintenance factor previsto dal piano di manutenzione e, se disponibile, l’efficienza luminosa per stimare l’assorbimento.',
      },
      {
        name: 'Verifica UF e distribuzione',
        text: 'Stima il fattore di utilizzazione dalle riflettanze oppure inserisci quello fornito dal costruttore, quindi controlla spaziatura e lux ottenuti prima di esportare il risultato nel report illuminotecnico.',
      },
    ],
  },
  'calcolo-corrente-spunto-motore': {
    name: 'Come verificare la corrente di spunto di un motore asincrono',
    description:
      'Procedura guidata per stimare corrente, potenza di spunto e tarature di protezione in base al metodo di avviamento scelto.',
    steps: [
      {
        name: 'Raccogli i dati di targa',
        text: 'Inserisci potenza nominale, tensione, rendimento e cos φ riportati sulla targhetta o nel catalogo IEC del costruttore.',
      },
      {
        name: 'Seleziona il metodo di avviamento',
        text: 'Scegli tra DOL, stella-triangolo, autotrasformatore, soft starter o inverter e imposta il rapporto Iavv/In fornito dal costruttore.',
      },
      {
        name: 'Analizza correnti e protezioni',
        text: 'Valuta i kVA assorbiti, la caduta di tensione rispetto alla potenza di corto circuito disponibile e regola le protezioni termiche e magnetiche.',
      },
    ],
  },
  'dimensionamento-interruttore-magnetotermico': {
    name: 'Come Dimensionare l\'Interruttore Magnetotermico',
    description: 'Procedura guidata per scegliere la taglia dell\'interruttore automatico in accordo con la CEI 64-8.',
    steps: [
      {
        name: 'Calcola la corrente di impiego',
        text: 'Inserisci potenza, tensione, cosφ e fattore di contemporaneità oppure la corrente nominale disponibile per ottenere Ib.',
      },
      {
        name: 'Definisci portata del cavo',
        text: 'Scegli sezione, materiale e metodo di posa per determinare Iz applicando i coefficienti correttivi previsti dalla norma.',
      },
      {
        name: 'Seleziona la curva e verifica',
        text: 'Imposta curva B, C o D, confronta le soglie magnetiche con l\'Icc e scegli la taglia In che soddisfa Ib ≤ In ≤ Iz e I₂ ≤ 1,45·Iz.',
      },
    ],
  },
  'calcolo-corrente-corto-circuito-icc': {
    name: 'Come Calcolare la Corrente di Corto Circuito Presunta',
    description: 'Passi essenziali per determinare Ik in un punto dell\'impianto e verificare il potere d\'interruzione delle protezioni.',
    steps: [
      {
        name: 'Raccogli i dati della sorgente',
        text: 'Inserisci potenza nominale e impedenza percentuale del trasformatore che alimenta la linea.',
      },
      {
        name: 'Descrivi la linea',
        text: 'Imposta lunghezza, sezione, materiale e temperatura del conduttore per calcolare resistenza e reattanza.',
      },
      {
        name: 'Verifica il dispositivo',
        text: 'Analizza Ik, il picco e l\'energia termica, confrontandoli con il potere d\'interruzione del dispositivo installato.',
      },
    ],
  },
  'dimensionamento-tubi-portacavi': {
    name: 'Come Dimensionare un Tubo Portacavi',
    description: 'Procedura guidata per scegliere il diametro o la sezione della canalina in funzione del grado di riempimento consentito.',
    steps: [
      {
        name: 'Elenca i cavi presenti',
        text: 'Raccogli diametro esterno e quantità di ciascun cavo da installare nella tubazione.',
      },
      {
        name: 'Definisci il limite di riempimento',
        text: 'Imposta il grado di riempimento massimo (40% consigliato) secondo CEI 64-8 o specifiche di progetto.',
      },
      {
        name: 'Seleziona il tubo o la canalina',
        text: 'Confronta le soluzioni proposte e scegli la prima conforme, mantenendo margine per future integrazioni.',
      },
    ],
  },
  'calcolo-resistenza-impianto-terra': {
    name: 'Come Valutare la Resistenza di Terra',
    description: 'Passaggi fondamentali per stimare Rt di un impianto di terra e confrontarla con i limiti CEI.',
    steps: [
      {
        name: 'Caratterizza il terreno',
        text: 'Inserisci la resistività misurata o stimata; in caso di terreno stratificato specifica i valori dei due strati.',
      },
      {
        name: 'Definisci i dispersori',
        text: 'Seleziona tipologia, lunghezza, diametro e numero di dispersori includendo la distanza reciproca.',
      },
      {
        name: 'Esegui la verifica normativa',
        text: 'Confronta Rt con il limite imposto dal sistema di protezione (TT, TN, SPD) e valuta eventuali interventi correttivi.',
      },
    ],
  },
  'calcolo-rifasamento-cos-phi': {
    name: 'Come Dimensionare il Rifasamento',
    description: 'Procedura per calcolare la potenza reattiva da compensare e scegliere la batteria di condensatori più adatta.',
    steps: [
      {
        name: 'Analizza i dati di impianto',
        text: 'Inserisci potenza attiva, tensione e cos φ misurato per determinare la potenza apparente e reattiva attuale.',
      },
      {
        name: 'Definisci il cos φ target',
        text: 'Seleziona il cos φ desiderato in accordo con le prescrizioni del distributore (tipicamente ≥ 0,95).',
      },
      {
        name: 'Scegli la batteria di condensatori',
        text: 'Consulta la tabella dei gradini suggeriti e componi la batteria (manuale o automatica) più vicina al valore calcolato.',
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
  'convertitore-pressione-bar-psi-pa': {
    name: 'Come convertire correttamente le pressioni tecniche',
    description:
      'Procedura guidata per passare da pressioni assolute o relative alle unità richieste nei progetti e nei collaudi.',
    steps: [
      {
        name: 'Imposta valore e unità di partenza',
        text: 'Inserisci il valore da convertire e seleziona l’unità di origine (bar, psi, Pa, ecc.).',
      },
      {
        name: 'Definisci il tipo di pressione',
        text: 'Scegli se il dato è assoluto o relativo (gauge) e, in quest’ultimo caso, imposta la pressione atmosferica locale.',
      },
      {
        name: 'Leggi i valori convertiti',
        text: 'Consulta la tabella per ottenere tutti i corrispondenti nelle unità richieste e utilizza i riferimenti rapidi per verificare la plausibilità del risultato.',
      },
    ],
  },
  'convertitore-potenza-kw-hp-cv': {
    name: 'Come convertire la potenza tra kW, HP e CV',
    description:
      'Passi fondamentali per confrontare motori elettrici, termici e unità HVAC, tenendo conto di efficienza e coppia.',
    steps: [
      {
        name: 'Definisci valore e unità',
        text: 'Inserisci la potenza nota e seleziona l’unità di origine (kW, HP, CV, BTU/h, ecc.).',
      },
      {
        name: 'Imposta parametri operativi',
        text: 'Se desideri stimare potenza assorbita e coppia, imposta efficienza e numero di giri/minuto.',
      },
      {
        name: 'Analizza le conversioni',
        text: 'Utilizza la tabella per leggere le equivalenze e confronta i risultati con le schede tecniche del costruttore.',
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
  'calcolo-taglio-sismico-statica': SeismicBaseShearCalculator,
  'verifica-trave-ca': ConcreteBeamVerification,
  'calcolo-sezione-cavo-portata': CableSizingCalculator,
  'dimensionamento-cavi-bt': LowVoltageCableCalculator,
  'calcolo-caduta-tensione-linea': VoltageDropCalculator,
  'dimensionamento-interruttore-magnetotermico': MagnetothermicBreakerCalculator,
  'calcolo-corrente-corto-circuito-icc': ShortCircuitCurrentCalculator,
  'dimensionamento-tubi-portacavi': ConduitSizingCalculator,
  'calcolo-resistenza-impianto-terra': EarthResistanceCalculator,
  'calcolo-rifasamento-cos-phi': PowerFactorCorrectionCalculator,
  'calcolo-trave-appoggiata': SimplySupportedBeamCalculator,
  'calcolo-roi-return-on-investment': ROICalculator,
  'calcolatore-legge-ohm-potenza': OhmsLawPowerCalculator,
  'calcolo-illuminotecnico-numero-lampade': IlluminanceLampsCalculator,
  'calcolo-corrente-spunto-motore': MotorInrushCalculator,
  'convertitore-pressione-bar-psi-pa': PressureConverter,
  'convertitore-potenza-kw-hp-cv': PowerConverter,
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
