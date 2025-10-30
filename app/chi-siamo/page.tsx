import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Chi Siamo | La Missione di Calcolo.online',
  description:
    'Scopri la missione di Calcolo.online, il progetto di Yeah Up S.r.l. dedicato a calcolatori professionali affidabili e sempre aggiornati.',
  alternates: {
    canonical: `${siteConfig.url}/chi-siamo/`,
  },
};

const sedeLegale = `${siteConfig.organization.address.streetAddress}, ${siteConfig.organization.address.addressLocality} ${siteConfig.organization.address.postalCode}`;

export default function ChiSiamoPage() {
  return (
    <article className="prose prose-lg prose-blue max-w-3xl">
      <header>
        <h1>Chi Siamo</h1>
        <p className="text-lg text-gray-600">
          La missione di Calcolo.online è mettere a disposizione dei professionisti tecnici italiani la cassetta degli attrezzi digitale più affidabile del
          mercato.
        </p>
      </header>

      <section>
        <h2>La nostra missione: affidabilità e precisione</h2>
        <p>
          In un settore in cui la precisione è critica, ingegneri, architetti, periti e geometri hanno bisogno di strumenti di calcolo accurati. Un errore può
          costare tempo, denaro e compromettere la sicurezza dei progetti. Calcolo.online nasce per rispondere a questa esigenza con strumenti chiari,
          verificati e facili da usare.
        </p>
        <p>
          Il nostro obiettivo è fornire la &ldquo;cassetta degli attrezzi digitale&rdquo; più affidabile, aggiornata e aderente alle normative italiane ed europee.
          Ogni calcolatore e ogni guida è progettato per facilitare il lavoro quotidiano dei professionisti, riducendo al minimo il margine d&rsquo;errore.
        </p>
      </section>

      <section>
        <h2>Chi c&apos;è dietro Calcolo.online?</h2>
        <p>
          Calcolo.online è un progetto di <strong>{siteConfig.organization.legalName}</strong>, una startup innovativa italiana con sede in {sedeLegale}.
          Siamo un team di professionisti che sviluppano soluzioni digitali per il mondo tecnico, unendo competenze di sviluppo software e supervisione
          ingegneristica.
        </p>
        <p>
          La natura di startup innovativa ci spinge a mantenere un aggiornamento tecnologico e normativo costante: monitoriamo NTC 2018, D.Lgs. 81/08,
          CEI 64-8, Eurocodici e decreti fiscali per garantire che ogni calcolatore sia sempre attuale.
        </p>
      </section>

      <section>
        <h2>I nostri principi fondamentali</h2>
        <ul>
          <li>
            <strong>Rigore normativo:</strong> ogni calcolatore è progettato e aggiornato con riferimento alle normative italiane ed europee di settore.
          </li>
          <li>
            <strong>Validazione esperta:</strong> nessuno strumento viene pubblicato senza revisione tecnica. Scopri il nostro{' '}
            <Link href="/processo-editoriale" className="font-semibold text-blue-600">
              processo editoriale e di fact-checking
            </Link>
            .
          </li>
          <li>
            <strong>Trasparenza:</strong> crediamo che la fiducia si conquisti. Per questo raccontiamo chiaramente chi siamo, come lavoriamo e chi valida i
            nostri contenuti.
          </li>
          <li>
            <strong>Feedback continuo:</strong> ascoltiamo ogni segnalazione per migliorare strumenti e procedure. Se noti un&rsquo;imprecisione puoi scriverci
            a{' '}
            <a href="mailto:info@calcolo.online" className="text-blue-600">
              info@calcolo.online
            </a>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2>In sintesi</h2>
        <p>
          Calcolo.online è la piattaforma di riferimento per i professionisti che cercano strumenti certificati e verificati. Siamo un team di specialisti che
          crede nel valore dell&rsquo;affidabilità, della trasparenza e dell&rsquo;innovazione continua.
        </p>
      </section>
    </article>
  );
}
