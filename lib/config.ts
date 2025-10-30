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
    taxId: '02930760307',
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
  ugoCandido: {
    name: 'Ing. Ugo Candido',
    role: 'Fondatore e Revisore Tecnico Capo',
    credentials: 'Ing. Gestionale (Università di Udine), Perito Elettrotecnico, MBA (MIB Trieste)',
    bio: 'Garantisce la validazione tecnica di tutte le formule e l\'aderenza normativa dei contenuti di Calcolo.online.',
    image: '/authors/ugo-candido.jpg',
    linkedIn: 'https://www.linkedin.com/in/ugo-candido-582659a/',
  },
};
