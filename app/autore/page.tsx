import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Autore e Responsabili Tecnici',
  description:
    'Scopri chi cura e valida i calcolatori di Calcolo.online: esperienza, iscrizioni all’ordine professionale e processo di revisione tecnica.',
};

export default function AutorePage() {
  return (
    <article className="prose prose-slate max-w-4xl">
      <h1>Autore e Responsabili Tecnici</h1>
      <p>
        I contenuti e i calcolatori di Calcolo.online sono sviluppati e revisionati da professionisti iscritti agli ordini
        professionali italiani, con esperienza pluriennale nella progettazione di impianti, strutture e processi.
      </p>

      <section>
        <h2>Ing. Ugo Candido &mdash; Revisore Tecnico Capo</h2>
        <ul>
          <li>Iscritto all’Ordine degli Ingegneri, sezione A – settore Industriale.</li>
          <li>Esperienza ventennale nella progettazione di impianti industriali e nella verifica di conformità normativa.</li>
          <li>Responsabile del processo di <Link href="/processo-editoriale">revisione editoriale</Link> e del controllo qualità delle formule.</li>
        </ul>
      </section>

      <section>
        <h2>Ing. Martina Fabbri &mdash; Strumentazione e Processi</h2>
        <ul>
          <li>Specialista in strumentazione di processo e calibrazione industriale.</li>
          <li>Coordina gli aggiornamenti relativi a unità di misura, normative ISO e sistemi di controllo.</li>
        </ul>
      </section>

      <section>
        <h2>Ing. Lorenzo Marchetti &mdash; Motori elettrici e HVAC</h2>
        <ul>
          <li>Consulente per sistemi HVAC e motori elettrici ad alta efficienza.</li>
          <li>Cura i contenuti relativi a conversioni di potenza, coppia e rendimento energetico.</li>
        </ul>
      </section>

      <section>
        <h2>Metodo di lavoro</h2>
        <p>
          Ogni calcolatore segue un processo strutturato:
        </p>
        <ol>
          <li>Analisi della normativa tecnica (UNI, CEI, ISO, Eurocodici).</li>
          <li>Implementazione delle formule con verifica incrociata rispetto ai valori di riferimento.</li>
          <li>Revisione tecnica da parte di un secondo professionista iscritto all’Ordine.</li>
          <li>Validazione finale e pubblicazione con note d’uso e limitazioni.</li>
        </ol>
        <p>
          Per ulteriori dettagli consulta il <Link href="/processo-editoriale">processo editoriale</Link> o scrivici a{' '}
          <a href="mailto:info@calcolo.online">info@calcolo.online</a>.
        </p>
      </section>
    </article>
  );
}

