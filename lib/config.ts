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
};
