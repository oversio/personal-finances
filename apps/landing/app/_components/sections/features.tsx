"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardBody } from "@heroui/react";
import { TiltCard } from "../animations/tilt-card";
import { FadeIn } from "../animations/fade-in";
import {
  ChartPieIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
} from "@repo/ui/icons";

const features = [
  {
    icon: ChartPieIcon,
    title: "Dashboard intuitivo",
    description:
      "Visualiza tu situación financiera completa en un vistazo. Gráficos claros y métricas que importan.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: CreditCardIcon,
    title: "Múltiples cuentas",
    description:
      "Conecta todas tus cuentas bancarias, tarjetas y billeteras digitales en un solo lugar.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BanknotesIcon,
    title: "Control de gastos",
    description: "Categoriza automáticamente tus transacciones y descubre en qué se va tu dinero.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: ChartBarIcon,
    title: "Reportes detallados",
    description: "Genera informes personalizados para entender tus patrones de gasto e ingreso.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: ArrowTrendingUpIcon,
    title: "Metas de ahorro",
    description: "Define objetivos financieros y sigue tu progreso con proyecciones inteligentes.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: ShieldCheckIcon,
    title: "Seguridad total",
    description: "Tus datos están protegidos con encriptación de grado bancario.",
    gradient: "from-teal-500 to-cyan-500",
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-32 px-6 bg-gradient-to-b from-background to-default-50"
    >
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 text-sm font-medium mb-6">
            Funcionalidades
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Todo lo que necesitas para <span className="gradient-text">tomar el control</span>
          </h2>
          <p className="text-xl text-default-600 max-w-2xl mx-auto">
            Herramientas poderosas pero fáciles de usar para gestionar tu dinero como un
            profesional.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <TiltCard className="h-full">
                <Card className="h-full bg-background/60 backdrop-blur-sm border border-default-200 hover:border-primary-300 transition-colors">
                  <CardBody className="p-8">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-default-500 leading-relaxed">{feature.description}</p>
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
