"use client";

import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { MagneticButton } from "../animations/magnetic-button";
import { Parallax } from "../animations/parallax";

export function CTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Parallax decorative elements */}
      <Parallax speed={0.3} className="absolute top-10 left-[10%]">
        <div className="w-24 h-24 rounded-full bg-white/10 blur-sm" />
      </Parallax>
      <Parallax speed={0.5} direction="down" className="absolute top-20 right-[15%]">
        <div className="w-16 h-16 rounded-2xl bg-white/10 rotate-45" />
      </Parallax>
      <Parallax speed={0.4} className="absolute bottom-20 left-[20%]">
        <div className="w-20 h-20 rounded-full bg-white/5" />
      </Parallax>
      <Parallax speed={0.6} direction="down" className="absolute bottom-10 right-[25%]">
        <div className="w-12 h-12 rounded-lg bg-white/10 rotate-12" />
      </Parallax>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Empieza a controlar tu dinero{" "}
            <motion.span
              className="inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              hoy
            </motion.span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Únete a miles de personas que ya están tomando el control de sus finanzas personales. Es
            gratis para comenzar.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <MagneticButton strength={0.2}>
            <Button
              size="lg"
              className="px-10 py-7 text-lg font-semibold bg-white text-primary-600 hover:bg-white/90 shadow-2xl shadow-black/20"
            >
              Crear cuenta gratis
            </Button>
          </MagneticButton>
          <MagneticButton strength={0.15}>
            <Button
              size="lg"
              variant="bordered"
              className="px-10 py-7 text-lg font-semibold border-white/30 text-white hover:bg-white/10"
            >
              Contactar ventas
            </Button>
          </MagneticButton>
        </motion.div>

        <motion.p
          className="mt-8 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Sin tarjeta de crédito requerida · Configura en menos de 2 minutos
        </motion.p>
      </div>
    </section>
  );
}
