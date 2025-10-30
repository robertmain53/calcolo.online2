import type { Metadata } from 'next';
import Image from 'next/image';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Il Nostro Processo di Validazione e Fact-Checking (E-E-A-T)',
  description:
    'Scopri il processo di validazione tecnica e fact-checking di Calcolo.online: sviluppo, revisione e responsabilità del Revisore Tecnico Capo.',
  alternates: {
    canonical: `${siteConfig.url}/processo-editoriale/`,
  },
};

export default function ProcessoEditorialePage() {
  return (
    <article className="prose prose-lg prose-blue max-w-3xl">
      <header>
        <h1>Il nostro processo di validazione e fact-checking</h1>
        <p className="text-lg text-gray-600">
          Accuratezza, autorevolezza e fiducia (E-E-A-T) sono i pilastri che guidano ogni calcolatore e guida pubblicati su Calcolo.online.
        </p>
      </header>

      <section>
        <h2>Perché il nostro processo è diverso</h2>
        <p>
          Il web è pieno di calcolatori generici e spesso inaffidabili. Per una piattaforma che opera in ambito YMYL (Your Money or Your Life) come la nostra,
          l&rsquo;accuratezza non è opzionale: è un obbligo. Per questo abbiamo definito un sistema di creazione e revisione basato su due fasi distinte, pensate per
          garantire il massimo livello di competenza (<em>Expertise</em>), autorevolezza (<em>Authoritativeness</em>) e affidabilità (<em>Trustworthiness</em>).
        </p>
      </section>

      <section>
        <h2>Fase 1: sviluppo e creazione</h2>
        <p>
          Ogni strumento nasce dalla collaborazione tra sviluppatori software interni e professionisti tecnici esterni specializzati nelle singole discipline
          (ingegneria strutturale, geotecnica, elettrotecnica, finanza). Questo ci permette di trasformare normative, formule e procedure in calcolatori
          affidabili e di facile utilizzo.
        </p>
      </section>

      <section>
        <h2>Fase 2: revisione tecnica e validazione</h2>
        <p>
          Nessun calcolatore o guida viene pubblicato finché non supera la revisione tecnica interna. Questa fase è condotta dal nostro Founder e Revisore
          Tecnico Capo, l&rsquo;Ing. Ugo Candido, che agisce come garante finale dell&rsquo;accuratezza del sito. Ogni contenuto viene controllato rispetto alle normative
          vigenti (NTC 2018, CEI 64-8, D.Lgs. 81/08, Eurocodici, decreti fiscali) e validato prima di essere messo online.
        </p>
      </section>

      <section>
        <h2>Il nostro Revisore Tecnico Capo (Head of E-E-A-T)</h2>
        <div className="not-prose rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-blue-100">
              <Image
                src={defaultImageFallback}
                alt="Ing. Ugo Candido"
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="m-0 text-xl font-semibold">Ing. Ugo Candido</h3>
              <p className="m-0 text-sm text-gray-600">Fondatore e Revisore Tecnico Capo di Calcolo.online</p>
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm text-gray-700">
            <p>
              Ugo è il garante dell&rsquo;affidabilità tecnica di Calcolo.online. È sua la responsabilità finale di validare le formule, verificare l&rsquo;aderenza
              normativa e approvare la correttezza di ogni contenuto prima della pubblicazione.
            </p>
            <dl className="grid gap-3">
              <div>
                <dt className="font-medium text-gray-900">Competenze tecniche (Expertise)</dt>
                <dd>
                  Diploma di Perito Tecnico Industriale in Elettrotecnica ed Automazione (I.T.I. A. Malignani, Udine) che garantisce esperienza pratica e
                  competenza diretta sulle categorie Elettrotecnica e Acustica/Termotecnica.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Autorevolezza metodologica (Authoritativeness)</dt>
                <dd>
                  Laurea in Ingegneria Gestionale (Università di Udine) e superamento dell&rsquo;Esame di Stato (Ing.) che certificano un approccio rigoroso
                  all&rsquo;analisi dei problemi complessi e alla revisione delle categorie ingegneristiche.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Esperienza nel dominio (Experience)</dt>
                <dd>
                  Master in Business Administration (MBA) presso MIB Trieste e collaborazione con progetti internazionali (CalcDomain.com) che forniscono
                  esperienza trasversale su calcolatori tecnici e finanza professionale.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section>
        <h2>Come teniamo aggiornati i contenuti</h2>
        <p>
          Aggiorniamo costantemente gli strumenti monitorando revisioni normative, circolari e linee guida tecniche. Ogni aggiornamento è accompagnato da una
          nuova revisione interna, così da mantenere il massimo livello di affidabilità nel tempo.
        </p>
        <p>
          Hai individuato un miglioramento possibile? Contattaci su{' '}
          <a href="mailto:info@calcolo.online" className="text-blue-600">
            info@calcolo.online
          </a>{' '}
          e il team tecnico analizzerà la segnalazione.
        </p>
      </section>
    </article>
  );
}

const defaultImageFallback = '/authors/ugo-candido.jpg';
