"use client";

import Image from "next/image";
import Link from "next/link";

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-[#E8E9FF] relative overflow-x-hidden">
      <div className="px-4 pt-6">
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <Image src="/Logo.png" alt="Logo" width={30} height={30} />
          <span className="text-lg font-bold text-gray-800">DABubble</span>
        </div>

        <div className="absolute top-6 right-6 text-sm text-gray-700 flex flex-col items-end">
          <span className="hidden sm:block">Neu bei DABubble?</span>
          <Link
            href="/Newuser"
            className="text-[#5D5FEF] font-medium hover:underline"
          >
            Konto erstellen
          </Link>
        </div>
      </div>

      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Impressum
            </h1>
            <p className="mt-1 text-sm text-gray-600">Stand: Oktober 2025</p>
          </header>

          <section className="prose prose-gray max-w-none prose-headings:scroll-mt-24">
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              Christian Seidel
              <br />
              Am Hang 4<br />
              95152 Selbitz
              <br />
              Deutschland
            </p>

            <h2>Kontakt</h2>
            <p>
              E-Mail:&nbsp;
              <a
                className="text-[#5D5FEF] hover:underline"
                href="mailto:christian.pressig@web.de"
              >
                christian.pressig@web.de
              </a>
            </p>

            <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Christian Seidel
              <br />
              Am Hang 4<br />
              95152 Selbitz
            </p>

            <h2>Projektinformationen</h2>
            <p>
              <strong>DABubble</strong> ist ein Projekt mit Login-Funktion und
              Datenspeicherung über Firebase (Google). Es dient überwiegend
              Lern- und Demozwecken. Eine durchgehende Verfügbarkeit, technische
              Fehlerfreiheit oder Eignung für geschäftliche Zwecke wird nicht
              zugesichert.
            </p>

            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8–10 TMG bin ich jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen
              zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung
              oder Sperrung der Nutzung von Informationen nach den allgemeinen
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung
              ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
              Rechtsverletzung möglich.
            </p>

            <h2>Haftung für Links</h2>
            <p>
              Diese Website enthält ggf. Links zu externen Websites Dritter, auf
              deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese
              fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
              verantwortlich.
            </p>

            <h2>Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge
              Dritter sind als solche gekennzeichnet. Die Vervielfältigung,
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers.
            </p>

            <h2>Verbraucherstreitbeilegung</h2>
            <p>
              Ich bin nicht bereit und nicht verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen (§ 36 VSBG).
            </p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/Login"
              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm sm:text-base hover:bg-gray-800"
            >
              Zur Startseite
            </Link>
            <Link
              href="/ImpressumundDatenschutz/PrivacyPolicy"
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-sm sm:text-base hover:bg-gray-50"
            >
              Zur Datenschutzerklärung
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
