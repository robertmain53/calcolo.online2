'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

interface SearchFormProps {
  className?: string;
}

export default function SearchForm({ className }: SearchFormProps) {
  const searchParams = useSearchParams();
  const defaultQuery = useMemo(() => searchParams?.get('q') ?? '', [searchParams]);

  return (
    <form
      action="/cerca"
      method="get"
      className={`flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center ${className ?? ''}`}
    >
      <label htmlFor="site-search" className="text-sm font-medium text-gray-700 md:w-1/4">
        Cerca un calcolatore
      </label>
      <div className="flex w-full gap-2 md:w-3/4">
        <input
          id="site-search"
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="Es. pilastro, pressione, ROI..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cerca
        </button>
      </div>
      <p className="text-xs text-gray-500 md:ml-auto">
        Inserisci parole chiave per trovare il calcolatore o la guida che ti serve.
      </p>
    </form>
  );
}

