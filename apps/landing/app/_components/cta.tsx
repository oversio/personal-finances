import { FadeInOnScroll } from "./fade-in-on-scroll";

export function CTA() {
  return (
    <section id="cta" className="px-4 py-24">
      <FadeInOnScroll className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-red via-rose-600 to-brand-red-dark p-12 text-center shadow-2xl shadow-brand-red/30 md:p-16">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Comienza a controlar tus finanzas hoy
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
              Únete a miles de usuarios que ya están ahorrando más y gastando mejor con OMA Finance.
              Es gratis para comenzar.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#"
                className="group flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-brand-red shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                Crear cuenta gratis
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

            <p className="mt-6 text-sm text-white/60">
              Sin tarjeta de crédito requerida • Cancela cuando quieras
            </p>
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
