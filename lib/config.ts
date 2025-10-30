import { SiteConfig } from '@/types/calculator';

export const siteConfig: SiteConfig = {
  name: 'Calcolo.online',
  url: 'https://calcolo.online',
  description: 'Oltre 50 calcolatori specializzati per professionisti tecnici. Strumenti certificati per calcoli strutturali, termotecnici, acustici e di sicurezza.',
  locale: 'it_IT',
  organization: {
    name: 'Calcolo.online',
    legalName: 'Yeah Up Srl',
    url: 'https://calcolo.online',
    logo: 'https://calcolo.online/logo.png',
    foundingDate: '2018-01-01',
    address: {
      streetAddress: 'Via Example 123',
      addressLocality: 'Milano',
      postalCode: '20100',
      addressCountry: 'IT',
    },
  },
};

// Default author for calculators - update with real credentials
export const defaultAuthors = {
  engineer: {
    name: 'Ing. Ugo Candido',
    role: 'Ingegnere Civile Strutturale',
    credentials: 'Ingegnere con Master in Business Administration',
    bio: 'Ingegnere specializzato in calcoli strutturali e analisi normative secondo NTC 2018 e Eurocodici.',
    image: '/authors/ugo-candido.jpg',
  },
  accountant: {
    name: 'Dott. Marco Rossi',
    role: 'Dottore Commercialista',
    credentials: 'Dottore Commercialista e Revisore Legale',
    bio: 'Commercialista specializzato in fiscalità d\'impresa e analisi finanziaria.',
    image: '/authors/marco-rossi.jpg',
  },
  safetyCoordinator: {
    name: 'Ing. Laura Bianchi',
    role: 'Coordinatore Sicurezza Cantieri',
    credentials: 'Ingegnere Edile, Coordinatore Sicurezza CSP/CSE',
    bio: 'Esperta in gestione sicurezza nei cantieri temporanei o mobili con oltre 15 anni di esperienza in PSC, POS e audit HSE.',
    image: '/authors/laura-bianchi.jpg',
  },
  acousticsEngineer: {
    name: 'Ing. Federico Rinaldi',
    role: 'Ingegnere Acustico e Termotecnico',
    credentials: 'Ingegnere Energetico, Tecnico Competente in Acustica',
    bio: 'Specialista in prestazioni energetiche degli edifici, requisiti acustici passivi e certificazioni ambientali.',
    image: '/authors/federico-rinaldi.jpg',
  },
  electricalEngineer: {
    name: 'Ing. Chiara Esposito',
    role: 'Ingegnere Elettrotecnico',
    credentials: 'Ingegnere Elettrico, Esperta CEI 64-8 e 0-16',
    bio: 'Progetta impianti elettrici BT/MT per edifici civili e industriali con focus su selettività e protezioni differenziali.',
    image: '/authors/chiara-esposito.jpg',
  },
  hydraulicEngineer: {
    name: 'Ing. Gabriele Fontana',
    role: 'Ingegnere Idraulico',
    credentials: 'PhD in Ingegneria delle Acque',
    bio: 'Consulente per reti idriche, drenaggi urbani, opere di bonifica e modellazione idraulica a moto vario.',
    image: '/authors/gabriele-fontana.jpg',
  },
  geotechnicalEngineer: {
    name: 'Ing. Alessio De Luca',
    role: 'Ingegnere Geotecnico',
    credentials: 'Specialista geotecnico, membro AGI',
    bio: 'Esperto in progettazione di fondazioni profonde, analisi di stabilità dei versanti e prove geotecniche in sito.',
    image: '/authors/alessio-deluca.jpg',
  },
  surveySpecialist: {
    name: 'Geom. Sara Monti',
    role: 'Geometra Topografo',
    credentials: 'Geometra, specializzazione in GNSS e GIS',
    bio: 'Conduce rilievi topografici avanzati, compensazioni reti e trasformazioni di riferimento cartografico.',
    image: '/authors/sara-monti.jpg',
  },
  conversionSpecialist: {
    name: 'Dott.ssa Elena Ricci',
    role: 'Metrologo Industriale',
    credentials: 'Fisica Industriale, esperta in sistemi di misura',
    bio: 'Supporta i professionisti nella gestione delle unità di misura, calibrazioni e conversioni multi-standard.',
    image: '/authors/elena-ricci.jpg',
  },
  operationsManager: {
    name: 'Ing. Luca Ferrero',
    role: 'Project Manager',
    credentials: 'PMP, Ingegnere Gestionale',
    bio: 'Aiuta studi tecnici e imprese a organizzare scadenze, permessi e workflow documentali con strumenti digitali.',
    image: '/authors/luca-ferrero.jpg',
  },
};
