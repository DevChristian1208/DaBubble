"use client";

import Image from "next/image";
import Link from "next/link";

export default function LegalNotice() {
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
              Impressum
            </h1>
            <p className="mt-1 text-sm text-gray-600">Stand: August 2025</p>
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
              E-Mail:{" "}
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
              Datenspeicherung über Firebase. Es dient vor allem
              Lern-/Demozwecken. Eine durchgehende Verfügbarkeit, technische
              Fehlerfreiheit oder Eignung für geschäftliche Nutzung wird nicht
              gewährleistet.
            </p>

            <h2>Urheberrecht</h2>
            <p>
              Sofern nicht anders gekennzeichnet, unterliegen Inhalte und
              Quellcode deutschem Urheberrecht. Eine Verwendung, Bearbeitung
              oder Vervielfältigung bedarf der Zustimmung des Rechteinhabers.
            </p>

            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene
              Inhalte verantwortlich. Für externe Inhalte/Links wird keine
              Haftung übernommen; hierfür ist der jeweilige Anbieter
              verantwortlich.
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
