import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Informativa Privacy',
  description:
    'Informativa sul trattamento dei dati personali per gli utenti dei calcolatori Calcolo.online, in conformità al GDPR (UE 2016/679).',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-4xl">
      <h1>Informativa sul trattamento dei dati personali</h1>
      <p>
        La presente informativa è redatta ai sensi del Regolamento (UE) 2016/679 (“GDPR”) e descrive le modalità con cui
        Calcolo.online tratta i dati personali degli utenti che utilizzano il sito e i calcolatori professionali messi a disposizione.
      </p>

      <section>
        <h2>Titolare del trattamento</h2>
        <p>
          Yeah Up Srl &ndash; Via Example 123, 20100 Milano (MI) &mdash; P.IVA 02930760307. Per contatti:{' '}
          <a href="mailto:privacy@calcolo.online">privacy@calcolo.online</a>.
        </p>
      </section>

      <section>
        <h2>Dati raccolti</h2>
        <ul>
          <li>Dati di navigazione (log di server, indirizzo IP, user agent) raccolti in forma anonima per finalità di sicurezza.</li>
          <li>Dati conferiti volontariamente dall’utente (es. richieste di contatto o iscrizione a newsletter).</li>
          <li>Cookie tecnici e di statistica anonima, descritti nell’<Link href="/cookie">informativa cookie</Link>.</li>
        </ul>
      </section>

      <section>
        <h2>Finalità e base giuridica</h2>
        <ul>
          <li>Fornitura del servizio di calcolo online (art. 6.1.b GDPR).</li>
          <li>Adempimento di obblighi di legge e sicurezza informatica (art. 6.1.c e 6.1.f GDPR).</li>
          <li>Invio di comunicazioni informative previa richiesta dell’utente (art. 6.1.a GDPR).</li>
        </ul>
      </section>

      <section>
        <h2>Conservazione dei dati</h2>
        <p>
          I dati tecnici di navigazione sono conservati per un periodo massimo di 12 mesi. I dati forniti volontariamente vengono
          conservati per il tempo strettamente necessario a rispondere alla richiesta o fino alla revoca del consenso.
        </p>
      </section>

      <section>
        <h2>Diritti dell’interessato</h2>
        <p>
          Gli utenti possono esercitare i diritti previsti dal GDPR (accesso, rettifica, cancellazione, limitazione, portabilità, opposizione)
          scrivendo a <a href="mailto:privacy@calcolo.online">privacy@calcolo.online</a>.
        </p>
      </section>

      <section>
        <h2>Trasferimento dati</h2>
        <p>
          I dati personali non sono trasferiti al di fuori dello Spazio Economico Europeo. Qualora si rendesse necessario, saranno adottate le
          garanzie previste dagli artt. 44-49 GDPR.
        </p>
      </section>

      <section>
        <h2>Aggiornamenti</h2>
        <p>
          La presente informativa può essere aggiornata. La versione corrente è in vigore dal 30 marzo 2025. Per chiarimenti o segnalazioni
          contattaci all’indirizzo sopra indicato.
        </p>
      </section>
    </article>
  );
}

