import Image from "next/image";
import { TypingText } from "./typing-text";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 md:pt-40">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-red/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="animate-fade-in-up mb-4 inline-block rounded-full bg-brand-red/10 px-4 py-1.5 text-sm font-medium text-brand-red opacity-0">
              Tu dinero bajo control
            </span>

            <h1 className="animate-fade-in-up delay-100 mb-6 text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 opacity-0 md:text-5xl lg:text-6xl">
              Simplifica tus{" "}
              <span className="text-brand-red">
                finanzas <TypingText words={["personales", "familiares"]} />
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 mb-8 text-lg text-zinc-600 opacity-0 md:text-xl">
              Controla tus gastos, establece presupuestos inteligentes y alcanza tus metas
              financieras. Todo en una sola app, diseñada para ti.
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-col items-center gap-4 opacity-0 sm:flex-row lg:justify-start">
              <a
                href="#cta"
                className="group flex cursor-pointer items-center gap-2 rounded-full bg-brand-red px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-red/25 transition-all duration-200 hover:bg-brand-red-dark hover:shadow-xl hover:shadow-brand-red/30"
              >
                Comenzar gratis
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

              <a
                href="#how-it-works"
                className="cursor-pointer text-base font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
              >
                Ver cómo funciona →
              </a>
            </div>

            {/* Social proof */}
            <div className="animate-fade-in-up delay-400 mt-10 flex items-center justify-center gap-6 opacity-0 lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-zinc-200"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg
                      key={i}
                      className="h-4 w-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-zinc-500">+10,000 usuarios activos</p>
              </div>
            </div>
          </div>

          {/* App mockup */}
          <div className="animate-fade-in-up delay-300 relative opacity-0">
            <div className="relative mx-auto aspect-square max-w-md lg:max-w-none">
              {/* Phone frame */}
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-zinc-800 to-zinc-900 p-3 shadow-2xl">
                <div className="h-full w-full rounded-[2.5rem] bg-zinc-100">
                  {/* Mock app screen */}
                  <div className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-500">Balance total</p>
                        <p className="text-2xl font-bold text-zinc-900">$24,350.00</p>
                      </div>
                      <Image
                        src="/omaf-light.png"
                        alt="OMA"
                        width={60}
                        height={20}
                        className="h-5 w-auto opacity-50"
                      />
                    </div>

                    {/* Chart placeholder */}
                    <div className="mb-4 flex-1 rounded-2xl bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-600">Gastos del mes</span>
                        <span className="text-xs text-brand-red">-12%</span>
                      </div>
                      <div className="flex h-24 items-end gap-2">
                        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-brand-red/80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent transactions */}
                    <div className="space-y-2">
                      {[
                        { name: "Supermercado", amount: "-$85.50" },
                        { name: "Sueldo", amount: "+$3,500.00" },
                        { name: "Netflix", amount: "-$15.99" },
                      ].map((tx, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-100" />
                            <span className="text-sm font-medium text-zinc-700">{tx.name}</span>
                          </div>
                          <span
                            className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-emerald-600" : "text-zinc-900"}`}
                          >
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
