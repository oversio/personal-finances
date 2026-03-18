import { FadeInOnScroll } from "./fade-in-on-scroll";

const plans = [
  {
    name: "Gratis",
    description: "Perfecto para comenzar",
    price: "$0",
    period: "para siempre",
    features: [
      "Hasta 2 cuentas",
      "Categorización automática",
      "Dashboard básico",
      "Reportes mensuales",
    ],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para usuarios avanzados",
    price: "$4.990",
    period: "/mes",
    features: [
      "Cuentas ilimitadas",
      "Reportes avanzados",
      "Metas de ahorro",
      "Exportación de datos",
      "Soporte prioritario",
      "Sin publicidad",
    ],
    cta: "Probar 14 días gratis",
    popular: true,
  },
  {
    name: "Familia",
    description: "Finanzas compartidas",
    price: "$7.990",
    period: "/mes",
    features: [
      "Todo de Pro",
      "Hasta 5 usuarios",
      "Presupuestos compartidos",
      "Reportes familiares",
      "Control parental",
    ],
    cta: "Probar 14 días gratis",
    popular: false,
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="bg-zinc-50 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-red/10 px-4 py-1.5 text-sm font-medium text-brand-red">
              Precios
            </span>
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 md:text-4xl">
              Planes que se adaptan a <span className="text-brand-red">tus necesidades</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600">
              Comienza gratis y escala cuando lo necesites. Sin compromisos.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="grid items-start gap-8 pt-4 md:grid-cols-3">
          {plans.map((plan, i) => (
            <FadeInOnScroll key={plan.name} delay={i * 150}>
              <div className="relative">
                {/* Badge outside the card to avoid clipping */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-red shadow-md">
                      Más popular
                    </span>
                  </div>
                )}

                <div
                  className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-200 ${
                    plan.popular
                      ? "border-brand-red bg-gradient-to-br from-brand-red via-rose-600 to-brand-red-dark text-white shadow-2xl shadow-brand-red/25"
                      : "border-zinc-200 bg-white hover:border-brand-red/20 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <>
                      {/* Gradient glow effect */}
                      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    </>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className={plan.popular ? "text-white/80" : "text-zinc-500"}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className={plan.popular ? "text-white/80" : "text-zinc-500"}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            plan.popular ? "bg-white/20" : "bg-brand-red/10"
                          }`}
                        >
                          <CheckIcon
                            className={`h-3 w-3 ${plan.popular ? "text-white" : "text-brand-red"}`}
                          />
                        </div>
                        <span className={plan.popular ? "text-white/90" : "text-zinc-700"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#"
                    className={`relative block cursor-pointer rounded-full py-3 text-center font-semibold transition-all duration-200 ${
                      plan.popular
                        ? "bg-white text-brand-red hover:bg-white/90"
                        : "bg-brand-red text-white hover:bg-brand-red-dark"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
