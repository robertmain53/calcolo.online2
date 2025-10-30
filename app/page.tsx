import Link from 'next/link';
import { getCategories, getCalculatorsByCategory, categoryMetadata } from '@/lib/calculators';
import { siteConfig } from '@/lib/config';

export default function HomePage() {
  const categories = getCategories();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          La cassetta degli attrezzi digitale del professionista
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Più di 50 calcolatori specializzati per ingegneri, architetti e tecnici.
          Strumenti professionali certificati per calcoli strutturali, termotecnici,
          acustici e di sicurezza.
        </p>
      </section>

      {/* Trust Signals */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">50+</div>
          <div className="text-sm text-gray-600">Calcolatori Disponibili</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">✓</div>
          <div className="text-sm text-gray-600">Calcoli Certificati</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">⚡</div>
          <div className="text-sm text-gray-600">Risultati Immediati</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">🔄</div>
          <div className="text-sm text-gray-600">Sempre Aggiornato</div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Categorie di Calcolatori
        </h2>
        <p className="text-gray-600 mb-8">
          Scegli la categoria più adatta alle tue esigenze professionali
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((categorySlug) => {
            const calculatorsInCategory = getCalculatorsByCategory(categorySlug);
            const meta = categoryMetadata[categorySlug] || {
              title: categorySlug,
              description: 'Calcolatori professionali',
              icon: '📊',
            };

            return (
              <Link
                key={categorySlug}
                href={`/${categorySlug}`}
                className="section-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{meta.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {meta.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {meta.description}
                    </p>
                    <div className="text-sm font-medium text-blue-600">
                      {calculatorsInCategory.length} calcolatori disponibili →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* E-E-A-T Section */}
      <section className="section-card bg-blue-50 border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Perché Scegliere {siteConfig.name}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              ✅ Affidabilità Certificata
            </h3>
            <p className="text-gray-700">
              Strumenti basati su normative ufficiali e validati da esperti del settore.
              Ogni calcolatore cita esplicitamente le fonti normative utilizzate.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              🎓 Sviluppato da Professionisti
            </h3>
            <p className="text-gray-700">
              Collaboriamo con ingegneri civili, dottori commercialisti e revisori
              contabili per garantire accuratezza e conformità normativa.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              ⚡ Efficienza Operativa
            </h3>
            <p className="text-gray-700">
              Risparmia tempo prezioso automatizzando calcoli ricorrenti e complessi.
              Risultati immediati con possibilità di esportare report dettagliati.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              🔄 Sempre Aggiornato
            </h3>
            <p className="text-gray-700">
              Monitoriamo costantemente Gazzetta Ufficiale, circolari e nuove
              pubblicazioni normative per garantire tool sempre aggiornati.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
