interface AuthorReviewerBoxProps {
  writtenBy?: string;
  reviewedBy?: string;
  lastReviewDate?: string;
  referenceStandard?: string;
}

const defaultProps: Required<AuthorReviewerBoxProps> = {
  writtenBy: 'Staff di Calcolo.online',
  reviewedBy: 'Ing. Ugo Candido',
  lastReviewDate: '—',
  referenceStandard: '—',
};

export default function AuthorReviewerBox(props: AuthorReviewerBoxProps) {
  const { writtenBy, reviewedBy, lastReviewDate, referenceStandard } = {
    ...defaultProps,
    ...props,
  };

  return (
    <aside className="not-prose mt-10 rounded-lg border border-blue-100 bg-blue-50/60 p-6 text-sm text-gray-700">
      <h3 className="text-base font-semibold text-blue-900">
        Informazioni su questo calcolatore / articolo
      </h3>
      <dl className="mt-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-medium text-gray-900">Scritto da</dt>
          <dd>{writtenBy}</dd>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-medium text-gray-900">Validato tecnicamente da</dt>
          <dd>{reviewedBy}</dd>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-medium text-gray-900">Ultima revisione normativa</dt>
          <dd>{lastReviewDate}</dd>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <dt className="font-medium text-gray-900">Norma di riferimento</dt>
          <dd>{referenceStandard}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-gray-600">
        Questo contenuto è stato sottoposto a un rigoroso processo di fact-checking per garantirne l&rsquo;accuratezza. Il nostro Revisore Tecnico Capo, Ing. Ugo
        Candido, ha validato le formule e la loro aderenza alle normative vigenti.
      </p>
    </aside>
  );
}
