import { FadeInOnScroll } from "./fade-in-on-scroll";

const features = [
  {
    title: "Control de gastos",
    description:
      "Registra y categoriza automáticamente todos tus gastos. Visualiza a dónde va tu dinero con gráficos claros.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
  },
  {
    title: "Presupuestos inteligentes",
    description:
      "Establece límites de gasto por categoría y recibe alertas antes de excederlos. Mantén el control.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
        />
      </svg>
    ),
  },
  {
    title: "Metas de ahorro",
    description:
      "Define objetivos financieros y visualiza tu progreso. Ahorra para lo que realmente importa.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
  },
  {
    title: "Multi-cuenta",
    description:
      "Conecta todas tus cuentas bancarias y tarjetas en un solo lugar. Vista unificada de tus finanzas.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
  },
  {
    title: "Reportes detallados",
    description:
      "Analiza tus hábitos financieros con reportes mensuales y anuales. Toma decisiones informadas.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
  {
    title: "Seguridad total",
    description:
      "Encriptación de grado bancario. Tus datos financieros están protegidos con los más altos estándares.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-red/10 px-4 py-1.5 text-sm font-medium text-brand-red">
              Características
            </span>
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 md:text-4xl">
              Todo lo que necesitas para{" "}
              <span className="text-brand-red">dominar tus finanzas</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600">
              Herramientas poderosas pero simples de usar, diseñadas para ayudarte a tomar el
              control de tu dinero.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeInOnScroll key={i} delay={i * 100}>
              <div className="group h-full cursor-pointer rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-200 hover:border-brand-red/20 hover:shadow-lg hover:shadow-brand-red/5">
                <div className="mb-4 inline-flex rounded-xl bg-brand-red/10 p-3 text-brand-red transition-colors duration-200 group-hover:bg-brand-red group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-zinc-900">{feature.title}</h3>
                <p className="text-zinc-600">{feature.description}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
