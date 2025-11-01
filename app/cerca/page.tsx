import { Metadata } from 'next';
import Link from 'next/link';
import { calculators, getCalculatorPath } from '@/lib/calculators';

export const metadata: Metadata = {
  title: 'Ricerca calcolatori',
  description:
    'Trova rapidamente il calcolatore professionale che ti serve: cerca per disciplina, normativa o parola chiave.',
};

interface SearchPageProps {
  searchParams?: {
    q?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q?.trim() ?? '';
  const normalizedQuery = query.toLowerCase();

  const results =
    normalizedQuery.length > 0
      ? calculators.filter((calculator) => {
          const haystack = [
            calculator.title,
            calculator.description,
            calculator.metaDescription,
            ...(calculator.keywords ?? []),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : [];

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Risultati di ricerca</h1>
        <p className="text-sm text-gray-600">
          {query
            ? `Hai cercato “${query}”.`
            : 'Digita una parola chiave per individuare rapidamente il calcolatore o la guida normativa che ti serve.'}
        </p>
      </header>

      {query.length === 0 && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          Usa la barra di ricerca in alto per cercare per disciplina (es. “trave”, “pressione”), normativa
          (“NTC 2018”, “UNI EN 12464-1”) o parola chiave specifica della tua attività.
        </div>
      )}

      {query.length > 0 && (
        <section className="space-y-4">
          <p className="text-sm text-gray-600">
            {results.length === 0
              ? 'Nessun calcolatore corrisponde ai criteri indicati. Prova con sinonimi o restringi la ricerca.'
              : `${results.length} ${results.length === 1 ? 'risultato trovato' : 'risultati trovati'}.`}
          </p>

          {results.length > 0 && (
            <ul className="space-y-4">
              {results.map((calculator) => (
                <li key={calculator.slug} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">
                    <Link className="hover:text-blue-600" href={getCalculatorPath(calculator)}>
                      {calculator.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{calculator.metaDescription}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {calculator.keywords.slice(0, 6).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-2 py-1 text-gray-700"
                      >
                        #{keyword}
                      </span>
                    ))}
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                      {calculator.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {query.length > 0 && results.length === 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Suggerimenti</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Controlla eventuali errori di battitura.</li>
            <li>Usa termini più generici (es. “cavo”, “pressione”, “ROI”).</li>
            <li>Consulta le categorie principali dal menu per individuare strumenti affini.</li>
          </ul>
        </section>
      )}
    </article>
  );
}

