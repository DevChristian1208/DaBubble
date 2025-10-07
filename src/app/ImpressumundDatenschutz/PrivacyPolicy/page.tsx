"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#E8E9FF] relative overflow-x-hidden">
      <div className="px-4 pt-6">
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
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
              Datenschutzerklärung
            </h1>
            <p className="mt-1 text-sm text-gray-600">Stand: Oktober 2025</p>
            <p className="mt-3 text-xs text-gray-500">
              Hinweis: Diese Information dient der Transparenz nach Art. 12 ff.
              DSGVO und ersetzt keine individuelle Rechtsberatung.
            </p>
          </header>

          <nav aria-label="Inhaltsverzeichnis" className="mb-8">
            <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-gray-700">
              <li>
                <a className="hover:underline" href="#verantwortlicher">
                  1. Verantwortlicher
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#arten">
                  2. Kategorien personenbezogener Daten
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#zwecke-rechtsgrundlagen">
                  3. Zwecke &amp; Rechtsgrundlagen
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#hosting-logs">
                  4. Hosting &amp; Server-Logs
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#firebase">
                  5. Firebase (Authentication &amp; Realtime Database)
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#cookies">
                  6. Cookies &amp; lokale Speicher
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#empfaenger-drittländer">
                  7. Empfänger &amp; Drittlandübermittlung
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#speicherdauer">
                  8. Speicherdauer
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#rechte">
                  9. Deine Rechte
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#widerruf-widerspruch">
                  10. Widerruf &amp; Widerspruch
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#minderjaehrige">
                  11. Minderjährige
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#aenderungen">
                  12. Änderungen dieser Erklärung
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#kontakt">
                  13. Kontakt
                </a>
              </li>
            </ul>
          </nav>

          <section className="prose prose-gray max-w-none prose-headings:scroll-mt-24">
            <h2 id="verantwortlicher">1. Verantwortlicher</h2>
            <p>
              Christian Seidel
              <br />
              Am Hang 4, 95152 Selbitz, Deutschland
              <br />
              E-Mail:{" "}
              <a
                className="text-[#5D5FEF] hover:underline"
                href="mailto:christian.pressig@web.de"
              >
                christian.pressig@web.de
              </a>
            </p>

            <h2 id="arten">2. Kategorien personenbezogener Daten</h2>
            <ul>
              <li>Stammdaten (z. B. Anzeigename, E-Mail-Adresse)</li>
              <li>
                Nutzungs-/Protokolldaten (z. B. Zeitpunkt der
                Registrierung/Anmeldung, technische Log-Einträge)
              </li>
              <li>Kommunikationsdaten (bei Kontaktaufnahme per E-Mail)</li>
            </ul>

            <h2 id="zwecke-rechtsgrundlagen">
              3. Zwecke &amp; Rechtsgrundlagen
            </h2>
            <ul>
              <li>
                <strong>Registrierung &amp; Login:</strong> Einrichtung und
                Verwaltung deines Kontos, Authentifizierung, Sitzungsverwaltung.
                <br />
                <em>Rechtsgrundlage:</em> Art. 6 Abs. 1 lit. b DSGVO.
              </li>
              <li>
                <strong>Sicherheit &amp; Missbrauchsvermeidung:</strong> z. B.
                Fehleranalyse, Betrugsprävention, Rate Limiting.
                <br />
                <em>Rechtsgrundlage:</em> Art. 6 Abs. 1 lit. f DSGVO.
              </li>
              <li>
                <strong>Kontaktanfragen:</strong> Beantwortung deiner Anfragen.
                <br />
                <em>Rechtsgrundlage:</em> Art. 6 Abs. 1 lit. b DSGVO.
              </li>
            </ul>

            <h2 id="hosting-logs">4. Hosting &amp; Server-Logs</h2>
            <p>
              Beim Aufruf der Website verarbeitet der Hosting-Provider
              automatisch Server-Logdaten (z. B. IP-Adresse, Datum/Uhrzeit,
              User-Agent, aufgerufene URL, Referrer). Diese Daten sind für den
              technischen Betrieb und die Sicherheit erforderlich und werden
              regelmäßig kurzfristig gespeichert.
              <br />
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h2 id="firebase">
              5. Firebase (Authentication &amp; Realtime Database)
            </h2>
            <p>
              Wir nutzen <strong>Firebase</strong> Dienste der Google Ireland
              Limited, Gordon House, Barrow Street, Dublin 4, Irland.
              Eingesetzte Komponenten umfassen insbesondere{" "}
              <em>Firebase Authentication</em>
              (E-Mail/Passwort-Login) sowie die{" "}
              <em>Firebase Realtime Database</em> zur Speicherung
              projektbezogener Daten (z. B. Profilname, Avatar).
            </p>
            <p>
              Dabei können personenbezogene Daten wie E-Mail-Adresse, technische
              Metadaten und IP-Adresse verarbeitet werden. Firebase kann zur
              Erbringung der Dienste Unterauftragsverarbeiter einsetzen und
              Daten in Drittländer (insb. USA) übertragen. Nähere Informationen
              findest du in den Firebase-Datenschutzhinweisen.
              <br />
              <a
                className="text-[#5D5FEF] hover:underline"
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                firebase.google.com/support/privacy
              </a>
            </p>
            <p>
              <strong>Rechtsgrundlagen:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (Nutzung/Registrierung), ggf. Art. 6 Abs. 1 lit. a DSGVO (soweit
              eine Einwilligung erforderlich ist), sowie Art. 6 Abs. 1 lit. f
              DSGVO (Betrieb &amp; Sicherheit).
            </p>

            <h2 id="cookies">6. Cookies &amp; lokale Speicher</h2>
            <ul>
              <li>
                <strong>Notwendige Cookies/Speicher:</strong> Für
                Login-Sitzungen und Sicherheitsfunktionen werden technisch
                notwendige Cookies bzw. Web-Storage (z. B. von Firebase Auth)
                verwendet.
                <br />
                <em>Rechtsgrundlage:</em> § 25 Abs. 2 Nr. 2 TTDSG, Art. 6 Abs. 1
                lit. f DSGVO.
              </li>
              <li>
                <strong>Kein Tracking zu Marketing/Analyse:</strong> Es werden
                derzeit keine nicht erforderlichen Cookies zu
                Statistik-/Marketingzwecken gesetzt.
              </li>
              <li>
                <strong>Lokaler Speicher (localStorage):</strong> Im Rahmen des
                Registrierungsflusses können vorübergehend der von dir
                eingegebene Anzeigename/E-Mail lokal (auf deinem Gerät)
                gespeichert werden, um den nächsten Schritt zu erleichtern. Du
                kannst das im Browser jederzeit löschen.
              </li>
            </ul>

            <h2 id="empfaenger-drittländer">
              7. Empfänger &amp; Drittlandübermittlung
            </h2>
            <p>
              Empfänger deiner Daten sind – im Rahmen der Auftragsverarbeitung –
              insbesondere die Google Ireland Limited (Firebase) und ggf. deren
              Unterauftragsverarbeiter. Eine Übermittlung in Drittländer (insb.
              USA) kann stattfinden. Dabei kommen geeignete Garantien (z. B.
              Standardvertragsklauseln, ergänzende Maßnahmen) zum Einsatz.
              Soweit anwendbar, kann auch eine Übermittlung auf Basis eines
              Angemessenheitsbeschlusses erfolgen. Details findest du in den
              Informationen von Google/Firebase.
            </p>

            <h2 id="speicherdauer">8. Speicherdauer</h2>
            <p>
              Wir verarbeiten personenbezogene Daten nur so lange, wie es für
              die genannten Zwecke erforderlich ist. Kontodaten bleiben
              grundsätzlich bis zur Löschung deines Accounts gespeichert.
              Gesetzliche Aufbewahrungspflichten bleiben unberührt.
              Protokolldaten werden in der Regel kurzfristig gelöscht.
            </p>

            <h2 id="rechte">9. Deine Rechte</h2>
            <ul>
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
              <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung deiner Rechte kannst du dich jederzeit an die oben
              genannte Kontaktadresse wenden.
            </p>

            <h2 id="widerruf-widerspruch">10. Widerruf &amp; Widerspruch</h2>
            <p>
              Erteilte Einwilligungen kannst du jederzeit mit Wirkung für die
              Zukunft widerrufen. Soweit wir Daten auf Grundlage von Art. 6 Abs.
              1 lit. f DSGVO verarbeiten, kannst du aus Gründen, die sich aus
              deiner besonderen Situation ergeben, Widerspruch einlegen.
            </p>

            <h2 id="minderjaehrige">11. Minderjährige</h2>
            <p>
              Dieses Angebot richtet sich nicht an Kinder unter 16 Jahren.
              Sofern du jünger bist, nutze DABubble bitte nur mit Zustimmung
              deiner Erziehungsberechtigten.
            </p>

            <h2 id="aenderungen">12. Änderungen dieser Erklärung</h2>
            <p>
              Wir passen diese Datenschutzerklärung bei Bedarf an, z. B. wenn
              sich Funktionen oder Rechtslagen ändern. Die jeweils aktuelle
              Fassung ist hier abrufbar. Das Aktualisierungsdatum findest du
              oben.
            </p>

            <h2 id="kontakt">13. Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz oder zur Geltendmachung deiner Rechte:
              <br />
              E-Mail:&nbsp;
              <a
                className="text-[#5D5FEF] hover:underline"
                href="mailto:christian.pressig@web.de"
              >
                christian.pressig@web.de
              </a>
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
