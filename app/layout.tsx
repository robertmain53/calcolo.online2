import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/lib/config';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/structured-data';
import './globals.css';
import SearchForm from '@/components/SearchForm';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0066cc',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name + ' - Calcolatori Professionali per Tecnici',
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'calcolatori online',
    'strumenti professionali',
    'calcoli tecnici',
    'ingegneria',
    'finanza',
    'business tools',
    'calcolatori certificati',
  ],
  authors: [
    {
      name: siteConfig.organization.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.organization.name,
  publisher: siteConfig.organization.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/og-image.png'],
    creator: '@calcolo_online',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: 'your-google-verification-code',
    // Add other verification codes as needed
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="it">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              <a href="/">{siteConfig.name}</a>
            </h1>
            <p className="text-sm text-gray-600">
              Calcolatori Professionali Certificati
            </p>
            <div className="mt-4">
              <SearchForm />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="border-t bg-white mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Chi Siamo</h3>
                <p className="text-sm text-gray-600">
                  {siteConfig.organization.legalName} - Strumenti professionali
                  certificati per ingegneri, architetti e professionisti tecnici.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contatti</h3>
                <p className="text-sm text-gray-600">
                  Email: info@calcolo.online
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Risorse</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><a href="/autore" className="hover:text-blue-600">Autore e Revisori</a></li>
                  <li><a href="/privacy" className="hover:text-blue-600">Informativa Privacy</a></li>
                  <li><a href="/termini" className="hover:text-blue-600">Termini di Servizio</a></li>
                  <li><a href="/cookie" className="hover:text-blue-600">Informativa Cookie</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
              © {new Date().getFullYear()} {siteConfig.organization.name}. Tutti i diritti riservati.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
