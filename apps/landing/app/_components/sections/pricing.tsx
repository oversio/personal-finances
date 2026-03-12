"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { TiltCard } from "../animations/tilt-card";
import { FadeIn } from "../animations/fade-in";
import { MagneticButton } from "../animations/magnetic-button";
import { CheckIcon } from "@repo/ui/icons";

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

export function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="pricing"
      ref={containerRef}
      className="py-32 px-6 bg-gradient-to-b from-default-50 to-background"
    >
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full bg-accent-500/10 text-accent-600 text-sm font-medium mb-6">
            Precios
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Planes que se adaptan a <span className="gradient-text">tus necesidades</span>
          </h2>
          <p className="text-xl text-default-600 max-w-2xl mx-auto">
            Comienza gratis y escala cuando lo necesites. Sin compromisos.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className={plan.popular ? "md:-mt-4" : ""}
            >
              <TiltCard maxTilt={5} className="h-full">
                <Card
                  className={`h-full ${
                    plan.popular
                      ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white border-0 shadow-2xl shadow-primary-500/30"
                      : "bg-background/60 backdrop-blur-sm border border-default-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Chip size="sm" className="bg-white text-primary-600 font-semibold px-4">
                        Más popular
                      </Chip>
                    </div>
                  )}
                  <CardHeader className="flex-col items-start p-8 pb-0">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className={plan.popular ? "text-white/80" : "text-default-500"}>
                      {plan.description}
                    </p>
                    <div className="mt-6">
                      <motion.span
                        className="text-5xl font-bold"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {plan.price}
                      </motion.span>
                      <span className={plan.popular ? "text-white/80" : "text-default-500"}>
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={feature}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.15 + featureIndex * 0.05 + 0.3,
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              plan.popular ? "bg-white/20" : "bg-primary-500/10"
                            }`}
                          >
                            <CheckIcon
                              className={`w-3 h-3 ${
                                plan.popular ? "text-white" : "text-primary-500"
                              }`}
                            />
                          </div>
                          <span className={plan.popular ? "text-white/90" : ""}>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <MagneticButton strength={0.15} className="w-full">
                      <Button
                        size="lg"
                        className={`w-full font-semibold ${
                          plan.popular
                            ? "bg-white text-primary-600 hover:bg-white/90"
                            : "bg-primary-500 text-white"
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </MagneticButton>
                  </CardBody>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
