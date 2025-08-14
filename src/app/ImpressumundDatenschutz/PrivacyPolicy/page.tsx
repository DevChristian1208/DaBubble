"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#E8E9FF] relative overflow-x-hidden">
      {/* Header */}
      <div className="px-4 pt-6">
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
          <span className="text-lg font-bold text-gray-800">DABubble</span>
        </div>

        <div className="absolute top-6 right-6 text-sm text-gray-700 flex flex-col items-end">
          <span className="hidden sm:block">Neu bei DABubble?</span>
          <Link
            href="/newuser"
            className="text-[#5D5FEF] font-medium hover:underline"
          >
            Konto erstellen
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Datenschutzerklärung
            </h1>
            <p className="mt-1 text-sm text-gray-600">Stand: August 2025</p>
          </header>

          {/* TOC */}
          <nav aria-label="Inhaltsverzeichnis" className="mb-8">
            <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-gray-700">
              <li>
                <a className="hover:underline" href="#verantwortlicher">
                  1. Verantwortlicher
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#hosting">
                  2. Hosting
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#firebase">
                  3. Firebase (Auth & Datenbank)
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#cookies">
                  4. Cookies
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#kontakt">
                  5. Kontaktaufnahme
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#speicherdauer">
                  6. Speicherdauer
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#rechte">
                  7. Deine Rechte
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#aenderungen">
                  8. Änderungen
                </a>
              </li>
            </ul>
          </nav>

          <section className="prose prose-gray max-w-none prose-headings:scroll-mt-24">
            <p>
              Der Schutz deiner persönlichen Daten ist mir wichtig. Diese
              Datenschutzerklärung informiert dich darüber, welche
              personenbezogenen Daten bei der Nutzung dieser Website erhoben und
              wie sie verarbeitet werden – im Einklang mit der
              Datenschutz-Grundverordnung (DSGVO).
            </p>

            <h2 id="verantwortlicher">1. Verantwortlicher</h2>
            <p>
              Christian Seidel
              <br />
              Am Hang 4<br />
              95152 Selbitz
              <br />
              E-Mail:{" "}
              <a
                className="text-[#5D5FEF] hover:underline"
                href="mailto:christian.pressig@web.de"
              >
                christian.pressig@web.de
              </a>
            </p>

            <h2 id="hosting">2. Hosting</h2>
            <p>
              Beim Besuch dieser Website werden durch den Hosting-Anbieter
              automatisch Server-Logfiles erfasst (z. B. IP-Adresse, Browsertyp,
              Datum/Uhrzeit, Referrer). Diese Daten dienen der technischen
              Sicherheit.
              <br />
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse).
            </p>

            <h2 id="firebase">3. Firebase (Auth &amp; Datenbank)</h2>
            <p>
              Zur Anmeldung/Authentifizierung und Speicherung von Daten wird{" "}
              <strong>Firebase</strong> (Google Ireland Ltd.) eingesetzt (z. B.
              Firebase Authentication und Firestore/Realtime Database). Dabei
              können personenbezogene Daten wie E-Mail-Adresse und IP-Adresse
              verarbeitet und – je nach Dienst – in die USA übertragen werden.
              Weitere Infos:{" "}
              <a
                className="text-[#5D5FEF] hover:underline"
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://firebase.google.com/support/privacy
              </a>
              .
              <br />
              <strong>Rechtsgrundlagen:</strong> Art. 6 Abs. 1 lit. b
              (Vertrag/Registrierung), lit. a (Einwilligung, soweit
              erforderlich), lit. f DSGVO (berechtigtes Interesse).
            </p>

            <h3>Registrierung/Account</h3>
            <p>
              Bei der Kontoerstellung verarbeiten wir die von dir angegebenen
              Daten (z. B. E-Mail, Anzeigename). Diese werden zur Bereitstellung
              deines Accounts sowie zur Nutzung von DABubble verwendet.
            </p>

            <h2 id="cookies">4. Cookies</h2>
            <p>
              Diese Website verwendet nur technisch notwendige Cookies (z. B.
              für Login-Sessions). Es erfolgt kein Tracking zu Marketing- oder
              Analysezwecken.
              <br />
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h2 id="kontakt">5. Kontaktaufnahme</h2>
            <p>
              Bei Kontaktaufnahme per E-Mail werden deine Angaben zur
              Bearbeitung der Anfrage gespeichert.
              <br />
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO.
            </p>

            <h2 id="speicherdauer">6. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden gelöscht, sobald der Zweck entfällt
              oder du deine Einwilligung widerrufst. Gesetzliche
              Aufbewahrungsfristen bleiben unberührt.
            </p>

            <h2 id="rechte">7. Deine Rechte</h2>
            <ul>
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Du kannst dich außerdem bei der zuständigen Datenschutzbehörde
              beschweren.
            </p>

            <h2 id="aenderungen">8. Änderungen</h2>
            <p>
              Diese Datenschutzerklärung wird bei Bedarf angepasst. Die aktuelle
              Version findest du immer auf dieser Seite.
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
              href="/ImpressumundDatenschutz/LegalNotice"
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-sm sm:text-base hover:bg-gray-50"
            >
              Zum Impressum
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
