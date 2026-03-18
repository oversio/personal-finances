import { FadeInOnScroll } from "./fade-in-on-scroll";

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description: "Regístrate en segundos con tu email o cuenta de Google. Sin complicaciones.",
  },
  {
    number: "02",
    title: "Conecta tus cuentas",
    description:
      "Vincula tus cuentas bancarias y tarjetas de forma segura para sincronizar automáticamente.",
  },
  {
    number: "03",
    title: "Configura presupuestos",
    description: "Establece límites de gasto por categoría según tus necesidades y objetivos.",
  },
  {
    number: "04",
    title: "Alcanza tus metas",
    description: "Visualiza tu progreso, recibe insights y toma mejores decisiones financieras.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-zinc-900 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll>
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-red/20 px-4 py-1.5 text-sm font-medium text-brand-red">
              Cómo funciona
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Comienza en <span className="text-brand-red">4 simples pasos</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400">
              Configurar OMA Finance es rápido y sencillo. En menos de 5 minutos tendrás todo listo.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <FadeInOnScroll key={i} delay={i * 150}>
              <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6 backdrop-blur-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.description}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
