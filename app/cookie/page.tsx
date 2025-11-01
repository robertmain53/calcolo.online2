import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Informativa Cookie',
  description:
    'Informazioni sull’uso dei cookie tecnici e di misurazione anonima su Calcolo.online, con istruzioni per la gestione delle preferenze.',
};

export default function CookiePage() {
  return (
    <article className="prose prose-slate max-w-4xl">
      <h1>Informativa Cookie</h1>
      <p>
        Calcolo.online utilizza cookie tecnici e strumenti di misurazione anonimi per garantire il corretto funzionamento
        dei calcolatori e migliorare l’esperienza d’uso. Utilizzando il sito acconsenti all’uso dei cookie descritti di seguito.
      </p>

      <section>
        <h2>Cookie tecnici</h2>
        <p>
          Sono necessari per consentire la navigazione e l’utilizzo delle funzionalità di base (es. memorizzazione
          delle preferenze linguistiche). Non richiedono il consenso dell’utente.
        </p>
      </section>

      <section>
        <h2>Cookie di misurazione anonima</h2>
        <p>
          Utilizziamo strumenti di analytics configurati in modalità anonima per raccogliere dati statistici aggregati
          (pagine visitate, tempo di permanenza). I dati non consentono l’identificazione del visitatore.
        </p>
      </section>

      <section>
        <h2>Cookie di terze parti</h2>
        <p>
          Non sono installati cookie di profilazione o marketing di terze parti. Qualora in futuro venissero integrati
          servizi esterni, l’informativa sarà aggiornata e saranno raccolti i consensi necessari.
        </p>
      </section>

      <section>
        <h2>Gestione delle preferenze</h2>
        <ul>
          <li>Puoi disattivare o cancellare i cookie direttamente dal browser utilizzato.</li>
          <li>
            Consulta le guide ufficiali di <a href="https://support.google.com/chrome/answer/95647">Chrome</a>,{' '}
            <a href="https://support.mozilla.org/it/kb/Eliminare%20i%20cookie">Firefox</a>,{' '}
            <a href="https://support.apple.com/it-it/HT201265">Safari</a> o{' '}
            <a href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d">
              Edge
            </a>.
          </li>
        </ul>
      </section>

      <section>
        <h2>Contatti</h2>
        <p>
          Per approfondimenti sul trattamento dei dati personali consulta l’<Link href="/privacy">informativa privacy</Link>{' '}
          o scrivi a <a href="mailto:privacy@calcolo.online">privacy@calcolo.online</a>.
        </p>
      </section>
    </article>
  );
}

