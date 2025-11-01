import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini e Condizioni d’uso',
  description:
    'Condizioni generali di utilizzo dei calcolatori e dei contenuti pubblicati su Calcolo.online.',
};

export default function TerminiPage() {
  return (
    <article className="prose prose-slate max-w-4xl">
      <h1>Termini e condizioni d’uso</h1>
      <p>
        L’accesso e l’utilizzo dei calcolatori messi a disposizione da Calcolo.online sono subordinati all’accettazione
        delle presenti condizioni. Utilizzando il sito dichiari di aver letto e compreso le regole riportate di seguito.
      </p>

      <section>
        <h2>Servizio offerto</h2>
        <p>
          Calcolo.online fornisce strumenti di calcolo professionale per supportare ingegneri, architetti e tecnici. Il
          servizio è offerto “così com’è” e non sostituisce software certificati o attività professionali svolte da
          professionisti abilitati.
        </p>
      </section>

      <section>
        <h2>Limitazione di responsabilità</h2>
        <p>
          Il Titolare adotta processi di revisione tecnica, tuttavia non garantisce l’assenza di errori. L’utente è tenuto
          a verificare in autonomia i risultati prima di utilizzarli in progetti, relazioni tecniche o pratiche autorizzative.
        </p>
      </section>

      <section>
        <h2>Utilizzo consentito</h2>
        <ul>
          <li>È vietato l’utilizzo dei calcolatori per finalità illecite o lesive dei diritti altrui.</li>
          <li>È vietata la riproduzione sistematica dei contenuti senza autorizzazione scritta.</li>
          <li>È consentito citare i risultati indicando la fonte “Calcolo.online”.</li>
        </ul>
      </section>

      <section>
        <h2>Modifiche al servizio</h2>
        <p>
          Il Titolare si riserva il diritto di sospendere, modificare o interrompere il servizio senza preavviso per esigenze
          tecniche, manutenzione o aggiornamenti normativi.
        </p>
      </section>

      <section>
        <h2>Legge applicabile e foro competente</h2>
        <p>
          Le presenti condizioni sono regolate dalla legge italiana. Per ogni controversia è competente in via esclusiva
          il Foro di Milano.
        </p>
      </section>

      <section>
        <h2>Contatti</h2>
        <p>
          Per richieste relative ai termini di utilizzo scrivi a{' '}
          <a href="mailto:legal@calcolo.online">legal@calcolo.online</a>.
        </p>
      </section>
    </article>
  );
}

